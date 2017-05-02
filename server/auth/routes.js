const uuid = require("uuid/v4");

const { getTransporter, sendMail } = require("../mail/mailer");
const { Users } = require("../collections");

exports.configure = ({
  app,
  pages,
  server,
  path,
  clientMaxAge,
}) => {
  console.log("[Auth] Setting up routes");

  // Add route to get CSRF token via AJAX
  server.get(`${path}/csrf`, (req, res) => {
    console.log("[Auth] Getting csrf");
    return res.json({
      csrfToken: res.locals._csrf,
    });
  });

  // Return session info
  server.get(`${path}/session`, (req, res) => {
    console.log("[Auth] Getting session");
    const session = {
      clientMaxAge,
      csrfToken: res.locals._csrf,
    };

    // Add user object to session if logged in
    if (req.user) {
      session.user = req.user;
    }

    return res.json(session);
  });

  // On post request, redirect to page with instrutions to check email for link
  server.post(`${path}/email/signin`, async (req, res) => {
    const email = req.body.email || null;
    console.log(`[Auth] Signing in with ${email}`);

    const emptyEmail = !email || email.trim() === "";
    if (emptyEmail) {
      console.log("[Auth] Email is empty, rendering signin");
      return app.render(req, res, `${pages}/signin`, req.params);
    }

    const token = uuid();
    const verificationUrl = `http://${req.headers.host}${path}/email/signin/${token}`;

    console.log(`[Auth] Made verification url ${verificationUrl}`);

    // Create verification token save it to database
    // @FIXME Improve error handling
    const user = await Users.findOne({ email });

    if (user) {
      console.log(`[Auth] User ${user._id} already exits, setting new token`);
      await Users.updateOne(user._id, {
        $set: { token }
      });
    } else {
      console.log(`[Auth] Creating new user ${email} with token ${token}`);
      await Users.insertOne({
        email,
        token
      });
    }

    const transport = getTransporter();
    await sendMail(transport, {
      to: email,
      from: "jorgen@eri.im",
      subject: "Sign in link",
      text: `Use the link below to sign in:\n\n${verificationUrl}\n\n`
    });

    return app.render(req, res, `${pages}/check-email`, req.params);
  });

  server.get(`${path}/email/signin/:token`, async (req, res) => {
    const token = req.params.token;
    console.log(`[Auth] User trying to verify token ${token}`);

    if (!token) {
      console.log("[Auth] No token, going back to signin");
      return res.redirect(`${path}/signin`);
    }

    let user;
    try {
      // Look up user by token
      user = await Users.findOne({ token });
    } catch (e) {
      console.error(`[Auth] Error when finding user using ${token}`, e);
      return res.redirect(`${path}/error`);
    }

    if (!user) {
      console.error(`[Auth] Found no user with token ${token}`);
      return res.redirect(`${path}/error`);
    }

    console.log(`[Auth] Found user ${user._id} with token ${token}, setting verified to true`);

    try {
      // Reset token and mark as verified
      await Users.updateOne(user._id, {
        $set: {
          token: null,
          verified: true
        }
      });
    } catch (e) {
      console.log(`[Auth] Failiure when updating user ${user._id}`, e);
      return res.redirect(`${path}/error`);
    }

    console.log("[Auth] Logging in user");

    // Having validated to the token, we log the user with Passport
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.log("[Auth] Failiure when logging in newly verified user", loginErr);
        return res.redirect(`${path}/error`);
      }

      console.log("[Auth] Successfully logged in");
      return res.redirect(`${path}/success`);
    });
  });

  server.post(`${path}/signout`, (req, res) => {
    // Log user out by disassociating their account from the session
    console.log(`[Auth] Signing out user ${req.user}`);
    req.signout();
    res.redirect("/");
  });
};

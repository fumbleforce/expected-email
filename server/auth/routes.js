const uuid = require("uuid/v4");

const { getTransporter } = require("../mail/mailer");
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
  server.post(`${path}/email/signin`, (req, res) => {
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
    Users.findOne({ email })
    .then((getUserErr, user) => {
      if (getUserErr) {
        throw getUserErr;
      }

      if (user) {
        console.log(`[Auth] User ${user._id} already exits, setting new token`);
        Users.update(user._id, {
          $set: { token }
        }, (tokenSaveErr) => {
          if (tokenSaveErr) {
            throw tokenSaveErr;
          }
        });
      } else {
        console.log(`[Auth] Creating new user ${email} with token ${token}`);
        Users.insert({
          email,
          token
        }, (createUserErr) => {
          if (createUserErr) {
            throw createUserErr;
          }
        });
      }

      getTransporter()
      .sendMail({
        to: email,
        from: "jorgen@eri.im",
        subject: "Sign in link",
        text: `Use the link below to sign in:\n\n${verificationUrl}\n\n`
      }, (sendMailError) => {
        // @TODO Handle errors
        if (sendMailError) {
          console.log(`Generated sign in link ${verificationUrl} for ${email}`);
          console.log(`Error sending email to ${email}`, sendMailError);
        }
      });
    });

    return app.render(req, res, `${pages}/check-email`, req.params);
  });

  server.get(`${path}/email/signin/:token`, (req, res) => {
    const token = req.params.token;
    console.log(`[Auth] User trying to verify token ${token}`);

    if (!token) {
      console.log("[Auth] No token, going back to signin");
      return res.redirect(`${path}/signin`);
    }

    // Look up user by token
    Users.findOne({ token }, (userFormTokenErr, user) => {
      if (userFormTokenErr) {
        console.error(`[Auth] Error when finding user using ${token}`, userFormTokenErr);
        return res.redirect(`${path}/error`);
      }

      if (!user) {
        console.error(`[Auth] Found no user with token ${token}`);
        return res.redirect(`${path}/error`);
      }

      console.log(`[Auth] Found user ${user._id} with token ${token}, setting verified to true`);

      // Reset token and mark as verified
      Users.update(user._id, {
        $set: {
          token: null,
          verified: true
        }
      }, (updateUserErr) => {
        // @TODO Improve updateUserError handling
        if (updateUserErr) {
          console.log(`[Auth] Failiure when updating user ${user._id}`, updateUserErr);
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
    });
  });

  server.post(`${path}/signout`, (req, res) => {
    // Log user out by disassociating their account from the session
    console.log(`[Auth] Signing out user ${req.user}`);
    req.signout();
    res.redirect("/");
  });
};

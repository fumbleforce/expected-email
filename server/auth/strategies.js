const passport = require("passport");

const { Users } = require("../collections");
const {
  getFacebookConfig,
  getGoogleConfig,
  getTwitterConfig
} = require("./providers");

async function linkExistingUserToProvider (id, provider, userData) {
  console.log(`[Auth] Linking user ${userData.email} to provider ${provider}`);

  let user;
  try {
    user = await Users.findOne(id);
  } catch (e) { throw new Error(`Error when finding user ${id}, ${e.message}`); }

  const updatedUser = Object.assign(user, {
    name: user.name || userData.name,
    [provider]: userData._id
  });

  return Users.updateOne(userData._id, updatedUser);
}

async function createUserFromProvider (userData, provider, done) {
  console.log(`[Auth] Creating user ${userData.email} from provider ${provider}`);
  const { name, email, _id } = userData;

  let userWithSameEmail;
  try {
    userWithSameEmail = await Users.findOne({ email });
  } catch (e) { throw new Error(`Error when finding user ${email}, ${e.message}`); }

  /* If we already have an account associated with that email address in the databases,
     the user should sign in with that account instead
     (to prevent them creating two accounts by mistake)

     Note: Automatically linking them here could expose a potential security exploit
     allowing someone to create an account for another users email address in advance
     then hijack it, so don"t do that.
  */
  if (userWithSameEmail) {
    return done(
      new Error("There is already an account associated with the same email address.")
    );
  }

  // If account does not exist, create one for them and sign the user in
  try {
    Users.insertOne({
      name,
      email,
      [provider]: _id
    });
  } catch (e) { throw new Error(`Error when inserting user ${email}, ${e.message}`); }
}

function addProviderStrategy ({
  path,
  provider,
  Strategy,
  strategyOptions,
  getUserFromProfile
}) {
  const strategyConfig = Object.assign(strategyOptions, {
    callbackURL: `${path}/oauth/${provider}/callback`,
    passReqToCallback: true
  });

  const strategy = new Strategy(strategyConfig, (req, accessToken, refreshToken, profile, done) => {
    try {
      // Normalise the provider specific profile into a User object
      const userData = getUserFromProfile(profile);

      // See if we have this oAuth account in the database associated with a user
      let existingProviderUser;
      try {
        existingProviderUser = Users.findOne({ [provider]: userData._id });
      } catch (e) {
        return done(e);
      }

      const loggedInUser = req.user;
      const isLoggedIn = !!loggedInUser;

      if (isLoggedIn) {
        // If the current session is signed in

        // If the oAuth account is not linked to another account, link it and exit
        if (!existingProviderUser) {
          return linkExistingUserToProvider(req.user._id, provider, userData, done);
        }

        // If oAuth account already linked to the current user, just exit
        const isLinkedToProvider = req.user._id === existingProviderUser._id;
        if (isLinkedToProvider) {
          return done(null, existingProviderUser);
        }

        // If the oAuth account is already linked to different account, exit with error
        if (req.user._id !== existingProviderUser._id) {
          return done(
            new Error("This account is already associated with another login.")
          );
        }
      } else {
        // If the current session is not signed in

        // If we have the oAuth account in the db then let them sign in as that user
        if (existingProviderUser) {
          return done(null, existingProviderUser);
        }

        // If we don"t have the oAuth account in the db, check to see if an account with the
        // same email address as the one associated with their oAuth acccount exists in the db
        return createUserFromProvider(userData, provider, done);
      }
    } catch (err) {
      done(err);
    }
  });

  passport.use(strategy);
}

function addProviderRoutes ({ provider, scope, server, path }) {
  server.get(
    `${path}/oauth/${provider}`,
    passport.authenticate(provider, { scope })
  );

  server.get(
    `${path}/oauth/${provider}/callback`,
    passport.authenticate(
      provider,
      { failureRedirect: `${path}/signin` }
    ),
    (req, res) =>
      // Redirect to the sign in success, page which will force the client to update it"s cache
      res.redirect(`${path}/success`)
  );
}

exports.configure = ({
    app = null, // Next.js App
    server = null, // Express Server
    path = "/auth" // URL base path for authentication routes
  } = {}) => {
  console.log("[Auth] Configuring passport providers");

  if (app === null) {
    throw new Error("app option must be a next server instance");
  }

  if (server === null) {
    throw new Error("server option must be an express server instance");
  }

  // Tell Passport how to seralize/deseralize user accounts
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (_id, done) => {
    try {
      const { name, email } = await Users.findOne(_id);
      // Note: We don"t return all user profile fields to the client, just ones
      // that are whitelisted here to limit the amount of users" data we expose.
      done(null, {
        _id,
        name,
        email,
      });
    } catch (e) {
      done(e);
    }
  });

  const providers = [];

  // IMPORTANT! If you add a provider, be sure to add a property to the User
  // model with the name of the provider or you won"t be able to log in!

  if (process.env.FACEBOOK_ID && process.env.FACEBOOK_SECRET) {
    providers.push(getFacebookConfig());
  }

  if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
    providers.push(getGoogleConfig());
  }

  if (process.env.TWITTER_KEY && process.env.TWITTER_SECRET) {
    providers.push(getTwitterConfig());
  }

  // Define a Passport strategy for provider
  providers.forEach(opts =>
    addProviderStrategy(Object.assign(opts, { path })));

  // Initialise Passport
  server.use(passport.initialize());
  server.use(passport.session());

  // Add routes for provider
  providers.forEach(opts =>
    addProviderRoutes(Object.assign(opts, { path, server })));

  // A catch all for providers that are not configured
  server.get(`${path}/oauth/:provider`, (req, res) =>
    res.redirect(`${path}/not-configured`)
  );

  return passport;
};

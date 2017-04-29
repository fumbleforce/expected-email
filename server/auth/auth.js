/**
 * Add routes for authentication
 *
 * Also sets up dependancies for authentication:
 * - Adds sessions support to Express (with HTTP only cookies for security)
 * - Configures session store (defaults to a flat file store in /tmp/sessions)
 * - Adds protection for Cross Site Request Forgery attacks to all POST requests
 *
 * Normally some of this logic might be elsewhere (like server.js) but for the
 * purposes of this example all server logic related to authentication is here.
 */

const expressSession = require("express-session");
const FileStore = require("session-file-store")(expressSession);
const csrf = require("lusca").csrf();

const passportStrategies = require("./strategies");
const authRoutes = require("./routes");


exports.configure = ({
    // Next.js App
    app = null,
    // Express Server
    server = null,
    // URL base path for authentication routes
    path = "/auth",
    // Directory in ./pages/ where auth pages can be found
    pages = "auth",
    // Secret used to encrypt session data on the server
    secret = "change-me",
    // Sessions store for express-session (defaults to /tmp/sessions file store)
    store = new FileStore({ path: "/tmp/sessions", secret }),
    // Max session age in ms (default is 4 weeks)
    // NB: With "rolling: true" passed to session() the session expiry time will
    // be reset every time a user visits the site again before it expires.
    maxAge = 60000 * 60 * 24 * 7 * 4,
    // How often the client should revalidate the session in ms (default 60s)
    // Does not impact the session life on the server, but causes the client to
    // always refetch session info after N seconds has elapsed since last
    // checked. Sensible values are between 0 (always check the server) and a
    // few minutes.
    clientMaxAge = 60000,
    // URL of the server (e.g. "http://www.example.com"). Used when sending
    // sign in links in emails. Autodetects to hostname if null.
    serverUrl = null,
  } = {}) => {
  console.log("[Auth] Configuring auth");

  if (app === null) {
    throw new Error("app option must be a next server instance");
  }

  if (server === null) {
    throw new Error("server option must be an express server instance");
  }

  // Configure sessions
  server.use(expressSession({
    secret,
    store,
    resave: false,
    rolling: true,
    saveUninitialized: true,
    httpOnly: true,
    cookie: {
      maxAge,
    },
  }));

  // Add CSRF to all POST requests
  // (If you want to add exceptions to paths you can do that here)
  server.use((req, res, next) => {
    csrf(req, res, next);
  });

  console.log("[Auth] Calling configure passportStrategies");

  // With sessions connfigured (& before routes) we need to configure Passport
  // and trigger passport.initialize() before we add any routes
  passportStrategies.configure({
    app,
    server,
  });

  console.log("[Auth] Calling configureRoutes");

  authRoutes.configure({
    app,
    pages,
    serverUrl,
    server,
    path,
    clientMaxAge,
  });

  console.log("[Auth] Finished configuration");
};

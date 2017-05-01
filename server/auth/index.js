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
    // How often the client should revalidate the session in ms (default 60s)
    // Does not impact the session life on the server, but causes the client to
    // always refetch session info after N seconds has elapsed since last
    // checked. Sensible values are between 0 (always check the server) and a
    // few minutes.
    clientMaxAge = 60000,
  } = {}) => {
  console.log("[Auth] Configuring auth");

  if (app === null) {
    throw new Error("app option must be a next server instance");
  }

  if (server === null) {
    throw new Error("server option must be an express server instance");
  }

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
    server,
    path,
    clientMaxAge,
  });

  console.log("[Auth] Finished configuration");
};

const auth = require("./auth");

function setupAuth (app, server) {
  auth.configure({
    app,
    server,
    secret: process.env.SESSION_SECRET,
  });
}

module.exports = setupAuth;

const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const _ = require("lodash");
const expressSession = require("express-session");
const FileStore = require("session-file-store")(expressSession);
const csrf = require("lusca").csrf();

const dev = process.env.NODE_ENV !== "production";

// In production we use secrets set by the now service
if (dev) {
  require("dotenv").config();
}

const app = next({ dev });
console.log(`[Next] Starting app in ${dev ? "dev" : "production"}`);

const secret = process.env.SESSION_SECRET;

// Needs to be after import of dotenv to utilize env variables
const { connect } = require("./server/mongo/connection");

const nextHandle = app.getRequestHandler();

app.prepare()
.then(async () => {
  const server = express();

  server.use(bodyParser.json());       // to support JSON-encoded bodies
  server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
  }));

  // Set vary header (good practice)
  // It's Vary important for performance
  server.use((req, res, nextStep) => {
    res.setHeader("Vary", "Accept-Encoding");
    nextStep();
  });

  // Sessions store for express-session (defaults to /tmp/sessions file store)
  const store = new FileStore({ path: "/tmp/sessions", secret });

  // Max session age in ms (default is 4 weeks)
  // NB: With "rolling: true" passed to session() the session expiry time will
  // be reset every time a user visits the site again before it expires.
  const maxAge = 60000 * 60 * 24 * 7 * 4;

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
  // TODO GET THIS TO WORK
  server.use(csrf);

  // Hook up database
  await connect();

  const collections = require("./server/collections");

  await Promise.all(_.map(collections, c => c.init()));

  // We have these imports here because the db needs to init first
  const api = require("./server/api");
  const auth = require("./server/auth");
  const cron = require("./server/cron");

  auth.configure({
    app,
    server,
  });

  api.configure({
    app,
    server
  });

  cron.start();

  // Client page routes
  server.get("*", (req, res) => nextHandle(req, res));

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
})
.catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

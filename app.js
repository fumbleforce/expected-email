const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");
const _ = require("lodash");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
console.log(`[Next] Starting app in ${dev ? "dev" : "production"}`);

if (dev) {
  require("dotenv").config();
}

// Needs to be after import of dotenv to utilize env variables
const { connect } = require("./server/mongo/connection");

const handle = app.getRequestHandler();


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

  // Hook up database
  await connect();

  const collections = require("./server/collections");

  await Promise.all(_.map(collections, c => c.init()));

  const api = require("./server/api");
  const auth = require("./server/auth");
  const cron = require("./server/cron");

  auth.configure({
    app,
    server,
    secret: process.env.SESSION_SECRET,
  });

  api.configure({
    app,
    server
  });

  cron.start();

  // Client page routes
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
})
.catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

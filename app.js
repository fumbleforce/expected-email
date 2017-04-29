const express = require("express");
const next = require("next");
const bodyParser = require("body-parser");

process.env.TZ = 'Europe/Amsterdam';

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
console.log(`[Next] Starting app in ${dev ? "dev" : "production"}`);

if (dev) {
  require("dotenv").config();
}

// Needs to be after import of dotenv to utilize env variables
const { connect } = require("./server/database");
const router = require("./server/router");
const auth = require("./server/auth");
const cron = require("./server/cron");

const handle = app.getRequestHandler();


app.prepare()
.then(async () => {
  const server = express();

  server.use(bodyParser.json());       // to support JSON-encoded bodies
  server.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
  }));

  // Hook up database
  await connect();

  // Api routes
  router(server);
  auth(app, server);

  // Client page routes
  server.get("*", (req, res) => handle(req, res));

  // Set vary header (good practice)
  // It's Vary important for performance
  server.use((req, res, nextStep) => {
    res.setHeader("Vary", "Accept-Encoding");
    nextStep();
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });

  cron.start();
})
.catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});

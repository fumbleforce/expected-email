const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const dev = process.env.NODE_ENV !== "production";
const username = process.env.MONGO_USER;
const password = process.env.MONGO_PW;

const url = dev
  ? "mongodb://localhost:27017/mailtime"
  : `mongodb://${username}:${password}@ds017193.mlab.com:17193/mailtime`;

console.log("[DB] Condiguring DB ", username, password);

let cachedDb = null;

function connect () {
  if (cachedDb) return cachedDb;

  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      if (err) return reject(err);
      console.log("[DB] Connected to database, creating initial collections");

      cachedDb = db;

      db.createCollection("mails");
      db.createCollection("users");

      resolve(null, db);
    });
  });
}

module.exports = {
  connect,
  getDb: () => cachedDb
};

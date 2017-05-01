const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;

const dev = process.env.NODE_ENV !== "production";
const username = process.env.MONGO_USER;
const password = process.env.MONGO_PW;
const host = process.env.MONGO_HOST;

const url = dev
  ? "mongodb://localhost:27017/mailtime"
  : `mongodb://${username}:${password}@${host}/mailtime`;

console.log("[DB] Configuring DB: ", dev ? "Connecting to local mongodb" : `Connecting to ${url}`);

let cachedDb = null;

function connect () {
  if (cachedDb) return cachedDb;

  const dbPromise = new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, db) => {
      if (err) return reject(err);
      console.log("[DB] Connected to database");

      cachedDb = db;

      return resolve(db);
    });
  });

  return dbPromise;
}

module.exports = {
  connect,
  getDb: () => cachedDb
};

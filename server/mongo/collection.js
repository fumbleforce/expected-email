const _ = require("lodash");

const { getDb } = require("./connection");
const { isObjectId, objectAndIdQuery } = require("./util");


function promisedFindQuery (collection, selector, options) {
  return new Promise((resolve, reject) => {
    const q = objectAndIdQuery(selector);
    const cursor = collection.find(q);

    if (options.limit) cursor.limit(options.limit);
    if (options.skip) cursor.skip(options.skip);
    if (options.sort) cursor.sort(_.keys(options.sort)[0], _.values(options.sort)[0]);

    cursor.toArray((err, res) => {
      if (err) return reject(err);

      if (options.one) {
        return resolve(res[0]);
      }
      return resolve(res);
    });
  });
}

function promisedInsertOne (collection, doc) {
  return new Promise((resolve, reject) => {
    if (!_.isObject(doc)) {
      reject(new Error(`Trying to insert ${JSON.stringify(doc)}`));
    }

    collection.insertOne(doc, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

function promisedInsertMany (collection, docs, options) {
  return new Promise((resolve, reject) => {
    if (!_.isArray(docs)) {
      reject(new Error(`Trying to insert many ${JSON.stringify(docs)}`));
    }

    collection.insertMany(docs, options, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

function promisedRemoveOne (collection, selector) {
  return new Promise((resolve, reject) => {
    const q = objectAndIdQuery(selector);

    collection.deleteOne(q, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

function promisedRemoveMany (collection, selector, options) {
  return new Promise((resolve, reject) => {
    const q = objectAndIdQuery(selector);

    collection.deleteMany(q, options, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

class Collection {
  constructor (name) {
    this.name = name;
  }

  async init () {
    console.log(`[Collection] Initializing ${this.name}`);
    const db = getDb();
    if (_.isNull(db)) {
      throw new Error(`Initializing ${this.name} before db is initialized`);
    }
    await db.createCollection(this.name);
    this.collection = db.collection(this.name);
    this.initialized = true;
  }

  findMany (selector = {}, options = {}, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] findMany`);
    return promisedFindQuery(
      this.collection,
      selector,
      options
    );
  }

  findOne (selector = {}, options = {}, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] findOne`);
    return promisedFindQuery(
      this.collection,
      selector,
      _.extend(options, {
        limit: 1,
        one: true
      })
    );
  }

  insertOne (data, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] insertOne`);
    return promisedInsertOne(
      this.collection,
      data
    );
  }

  insertMany (docs, options = {}, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] insertMany`);
    return promisedInsertMany(
      this.collection,
      docs,
      options
    );
  }

  removeOne (selector, options = {}, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] removeOne`);
    return promisedRemoveOne(
      this.collection,
      selector,
      options
    );
  }

  removeMany (selector, options = {}, cb) {
    if (cb) throw new Error("Collection wrappers do not take callbacks, but returns a promise");
    if (!this.initialized) throw new Error(`Collection ${this.name} not initialized`);
    console.log(`[Collection][${this.name}] removeMany`);
    return promisedRemoveMany(
      this.collection,
      selector,
      options
    );
  }
}

module.exports = Collection;

const _ = require("lodash");

const { getDb } = require("../database");
const { noop, objectAndIdQuery } = require("../util");

function getUserCollection () {
  return getDb().collection("users");
}

function getUser (queryObjOrId, callback) {
  const query = objectAndIdQuery(queryObjOrId);
  console.log(`[User] Getting user ${JSON.stringify(query)}`);

  const users = getUserCollection();

  users.findOne(query, (err, res) => {
    callback(err, res);
  });
}

function createUser (data, callback = noop) {
  console.log(`[User] Creating user ${JSON.stringify(data)}`);
  if (_.isUndefined(data)) throw new Error("Inserting undefined");
  if (!_.isObject(data)) throw new Error(`Trying to insert ${JSON.stringify(data)}`);

  const users = getUserCollection();

  users.insert(data, (err, res) => {
    callback(err, res);
  });
}

function updateUser (queryObjOrId, data, callback = noop) {
  const query = objectAndIdQuery(queryObjOrId);
  if (_.isUndefined(data)) throw new Error("Inserting undefined");
  if (!_.isObject(data)) throw new Error(`Trying to insert ${JSON.stringify(data)}`);

  console.log(`[User] Updating user ${query} ${JSON.stringify(data)}`);
  const users = getUserCollection();

  users.update(query, data, (err, res) => {
    callback(err, res);
  });
}

module.exports = {
  getUser,
  createUser,
  updateUser
};

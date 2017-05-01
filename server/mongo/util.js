const _ = require("lodash");
const ObjectID = require("mongodb").ObjectID;

function isObjectID (q) {
  return _.isObject(q) &&
    q.toString &&
    q.toString().match(/^[0-9a-fA-F]{24}$/);
}

// A get / find query should work with either id string, id objectId and a query object
function objectAndIdQuery (q) {
  if (_.isUndefined(q)) throw new Error("query is undefined");
  if (isObjectID(q)) return { _id: q };
  if (_.isString(q)) return { _id: ObjectID(q) };
  if (_.isObject(q)) {
    if (q._id && _.isString(q._id)) {
      return _.extend(q, {
        _id: ObjectID(q._id)
      });
    }
    return q;
  }
  throw new Error(`Unknown type of query ${q}`);
}

function noop () {}

module.exports = {
  noop,
  isObjectID,
  objectAndIdQuery,
};

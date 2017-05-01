const { getDb } = require("../database");
const _ = require("lodash");

const { noop, objectAndIdQuery } = require("../util");

function getMailCollection () {
  return getDb().collection("mails");
}

function createMail (data, callback) {
  if (_.isUndefined(data)) throw new Error("Inserting undefined");
  if (!_.isObject(data)) throw new Error(`Trying to insert ${JSON.stringify(data)}`);

  const {
    from,
    to,
    subject,
    text,
    sendAfter,
  } = data;

  const mails = getMailCollection();

  mails.insertOne({
    from,
    to,
    subject,
    text,
    sendAfter,
    sent: false,
  }, (err, res) => {
    callback(err, res);
  });
}

function getAllMail (callback) {
  const mails = getMailCollection();

  mails.find({})
  .toArray((err, res) => {
    callback(err, res);
  });
}

function getUnsentMails (callback) {
  const mails = getMailCollection();

  mails.find({
    sent: false,
    sendAfter: { $lte: +new Date() },
  })
  .toArray((err, res) => {
    callback(err, res);
  });
}

function markMailAsSent (q, callback = noop) {
  const query = objectAndIdQuery(q);
  const mails = getMailCollection();
  console.log("[Mail] Updating", query);

  mails.update(query, {
    $set: { sent: true },
  }, (err, res) => {
    if (err) {
      console.error("[Mail] Failed to mark as sent", err);
    } else {
      console.log("[Mail] Successfully maked as sent");
    }
    callback(err, res);
  });
}

function removeMail (q, callback = noop) {
  const query = objectAndIdQuery(q);
  const mails = getMailCollection();
  console.log("[Mail] Removing", query);

  mails.remove(query, (err, res) => {
    if (err) {
      console.error("[Mail] Failed to remove", err);
    } else {
      console.log("[Mail] Successfully removed mail");
    }
    callback(err, res);
  });
}


module.exports = {
  createMail,
  getAllMail,
  getUnsentMails,
  markMailAsSent,
  removeMail,
};

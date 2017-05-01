const nodemailer = require("nodemailer");

const { noop } = require("../util");

const dev = process.env.NODE_ENV !== "production";
const HOST = process.env.EMAIL_HOST;
const USER = process.env.EMAIL_USER;
const PASSWORD = process.env.EMAIL_PW;

console.log("[Mailer] Configuring mail:", dev ? "Using dummy transporter" : `Connecting to ${USER}:${PASSWORD}@${HOST}`);

// create reusable transporter object using the default SMTP transport
const standardTransporter = nodemailer.createTransport({
  host: HOST,
  auth: {
    user: USER,
    pass: PASSWORD,
  },
});

const dummyTransporter = {
  sendMail (mail) {
    console.log("[Mailer] Sending dummy mail", mail);
  }
};

if (!dev) {
  // verify connection configuration
  standardTransporter.verify((error, success) => {
    if (error || !success) {
      console.error("[Mailer] Error verifying mail transporter", error);
    } else {
      console.log("[Mailer] Standard transporter verified");
    }
  });
}

// TODO support user's own transports
function getTransporter () {
  if (dev) return dummyTransporter;

  return standardTransporter;
}

function createTransport (data) {
  const {
    host,
    user,
    password
  } = data;

  return nodemailer.createTransport({
    host,
    auth: {
      user,
      pass: password,
    },
  });
}

function verifyTransport (data) {
  return new Promise((resolve, reject) => {
    console.log("[Mailer] Verifying transport", data);
    const transport = nodemailer.createTransport(data);
    transport.verify((error, res) => {
      if (error) return reject(error);
      return resolve(res);
    });
  });
}

function sendMail (transport, data) {
  return new Promise((resolve, reject) => {
    transport.sendMail(data, (err, res) => {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}

module.exports = {
  sendMail,
  verifyTransport,
  getTransporter,
  createTransport
};

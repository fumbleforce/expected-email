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
    if (error) {
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

function verifyTransport (data) {
  return new Promise((resolve, reject) => {
    const transport = nodemailer.createTransport(data);
    transport.verify((error, res) => {
      console.log(error, res);
      if (error) return reject(error);
      return resolve(res);
    });
  });
}

function send (data, transporter, callback = noop) {
  transporter.sendMail(data, callback);
}

module.exports = {
  send,
  verifyTransport,
  getTransporter,
};

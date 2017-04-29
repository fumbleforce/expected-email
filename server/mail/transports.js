const nodemailer = require("nodemailer");

const { noop } = require("../util");

const HOST = process.env.EMAIL_HOST;
const USER = process.env.EMAIL_USER;
const PASSWORD = process.env.EMAIL_PW;

console.log("[Maile] Mailer config", HOST, USER, PASSWORD);

// create reusable transporter object using the default SMTP transport
const standardTransporter = nodemailer.createTransport({
  host: HOST,
  auth: {
    user: USER,
    pass: PASSWORD,
  },
});

// verify connection configuration
standardTransporter.verify((error, success) => {
  if (error) {
    console.error("[Mailer] Error verifying mail transporter", error);
  } else {
    console.log("[Mailer] Standard transporter verified");
  }
});

// TODO support user's own transports
function getTransporter () {
  return standardTransporter;
}

/* setup email data with unicode symbols
let mailOptions = {
  from: ""Fred Foo 👻" <foo@blurdybloop.com>", // sender address
  to: "bar@blurdybloop.com, baz@blurdybloop.com", // list of receivers
  subject: "Hello ✔", // Subject line
  text: "Hello world ?", // plain text body
  html: "<b>Hello world ?</b>" // html body
};
*/

function send (data, transporter, callback = noop) {
  transporter.sendMail(data, callback);
}

module.exports = {
  send,
  getTransporter,
};

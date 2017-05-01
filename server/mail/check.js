const { Mails } = require("../collections");
const { getTransporter } = require("./mailer");

async function checkMail () {
  console.log("[Mailer] Checking mail");

  const transporter = getTransporter();

  let mails;
  try {
    mails = await Mails.findMany({
      sent: false,
      sendAfter: { $lte: +new Date() },
    });
  } catch (e) { return console.error(e); }

  if (!mails.length) {
    return console.log("[Mailer] No mail to send");
  }

  mails.forEach(mail => {
    console.log("[Mailer] Sending unsent mail", mail);
    transporter.sendMail(mail);
    console.log("[Mailer] Marking mail as sent");
    Mails.update(mail._id, {
      $set: { sent: true },
    });
  });
}

module.exports = checkMail;

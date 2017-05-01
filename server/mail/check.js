const { Mails, Transports } = require("../collections");
const { createTransport } = require("./mailer");

async function checkMail () {
  console.log("[Mailer] Checking mail");

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

  mails.forEach(async (mail) => {
    console.log("[Mailer] Sending unsent mail", mail);
    const {
      from,
      to,
      subject,
      text,
    } = mail;

    const transport = await Transports.findOne(from);
    const emailTransport = createTransport(transport);

    emailTransport.sendMail({
      from: transport.email,
      to,
      subject,
      text,
    });

    console.log(`[Mailer] Marking mail from ${transport.email} as sent`);
    Mails.updateOne(mail._id, {
      $set: { sent: true },
    });
  });
}

module.exports = checkMail;

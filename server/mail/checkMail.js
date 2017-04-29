const { getUnsentMails, markMailAsSent } = require("../api/mail");
const { getTransporter } = require("./transports");

function checkMail () {
  console.log("[Mailer] Checking mail");

  const transporter = getTransporter();

  getUnsentMails((error, mails) => {
    if (error) throw error;

    if (!mails.length) {
      console.log("[Mailer] No mail to send");
    }

    mails.forEach(mail => {
      console.log("[Mailer] Sending unsent mail", mail);
      transporter.sendMail(mail);
      console.log("[Mailer] Marking mail as sent");
      markMailAsSent(mail._id);
    });
  });
}

module.exports = checkMail;

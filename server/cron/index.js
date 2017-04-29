const cron = require("node-cron");
const checkMail = require("../mail/checkMail");

exports.start = () => {
  console.log("[Cron] Started mail checking");
  cron.schedule("* * * * *", checkMail);
};

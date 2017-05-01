const cron = require("node-cron");
const checkMail = require("../mail/check");

exports.start = () => {
  console.log("[Cron] Started mail checking");
  checkMail();
  cron.schedule("* * * * *", checkMail);
};

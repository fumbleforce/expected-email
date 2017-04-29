const { handleGetAllMail, handleAddMail } = require("./handlers/mailHandlers");

const router = (server) => {
  server.route("/api/mail")
    .get(handleGetAllMail)
    .post(handleAddMail);
};

module.exports = router;

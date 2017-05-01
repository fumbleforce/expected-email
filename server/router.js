const {
  handleGetAllMail,
  handleAddMail,
  handleDeleteMail,
} = require("./handlers/mailHandlers");

const router = (server) => {
  server.route("/api/mail")
    .get(handleGetAllMail)
    .post(handleAddMail);

  server.route("/api/mail/:id")
    .delete(handleDeleteMail);
};

module.exports = router;

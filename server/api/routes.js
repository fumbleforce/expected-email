const {
  handleGetAllMail,
  handleAddMail,
  handleDeleteMail,
} = require("./mail-handlers");

const {
  handleAddTransports,
  handleGetAllTransports,
  handleDeleteTransports,
} = require("./transport-handlers");

exports.configure = (server) => {
  server.route("/api/mail")
    .get(handleGetAllMail)
    .post(handleAddMail);

  server.route("/api/mail/:id")
    .delete(handleDeleteMail);

  server.route("/api/transport")
    .get(handleGetAllTransports)
    .post(handleAddTransports);

  server.route("/api/transport/:id")
    .delete(handleDeleteTransports);

  console.log("[API] Configured routes.");
};


const routes = require("./routes");


exports.configure = ({
  server
}) => {
  console.log("[API] Configuring API");
  routes.configure(server);
  console.log("[API] Finished configuring API.");
};

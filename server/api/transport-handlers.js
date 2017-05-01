const { Transports } = require("../collections");
const { verifyTransport } = require("../mail/mailer");

async function handleAddTransports (req, res) {
  console.log("[Transport handler] handleAddTransports");
  const {
    email,
    host,
    user,
    password,
  } = req.body;

  console.log("Session", req.session);
  console.log("User", req.user);

  if (!req.user) return res.json({ error: "not_logged_in" });
  console.log("Is logged in");
  const userId = req.user._id;

  try {
    console.log("Verifying transport");
    await verifyTransport({
      host,
      auth: {
        user,
        pass: password,
      }
    });
    console.log("Verified transport");
  } catch (error) {
    if (error.code === "ECONNECTION") return res.json({ error: "invalid_host" });
    return res.json({ error: "invalid_transport" });
  }

  try {
    await Transports.insertOne({
      userId,
      email,
      host,
      user,
      password,
    });
    console.log("Inserted transport");
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleGetAllTransports (req, res) {
  console.log("[Transport handler] handleGetAllTransports");
  console.log("Session", req.session, req.session.prototype, req.session.user, req.session._user, req.session._session, req.user);
  try {
    const transports = await Transports.findMany({});
    return res.json({ transports });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleDeleteTransports (req, res) {
  console.log("[Transport handler] handleDeleteTransports");
  const id = req.params.id;
  try {
    await Transports.removeOne(id);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
}


module.exports = {
  handleAddTransports,
  handleGetAllTransports,
  handleDeleteTransports,
};

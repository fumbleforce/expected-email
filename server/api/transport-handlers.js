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

  if (!req.user) {
    console.error("Not logged in in handle add transport");
    return res.json({ error: "not_logged_in" });
  }
  const userId = req.user._id;

  try {
    console.log("Verifying transport");
    const verified = await verifyTransport({
      host,
      auth: {
        user,
        pass: password,
      }
    });
    console.log("Verified transport", verified);
  } catch (error) {
    console.error(error);
    if (error.code === "ECONNECTION") return res.json({ error: "invalid_host" });
    if (error.code === "EAUTH") return res.json({ error: "invalid_user_or_password" });
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
  if (!req.user) {
    console.error("Not logged in in get all transports");
    return res.json({ transports: [], waitingForAuth: true });
  }
  const userId = req.user._id;

  try {
    const transports = await Transports.findMany({
      userId,
    });
    return res.json({ transports });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleDeleteTransports (req, res) {
  console.log("[Transport handler] handleDeleteTransports");
  const id = req.params.id;
  if (!req.user) {
    console.error("Not logged in in delete transports");
    return res.json({ error: "not_logged_in" });
  }
  const userId = req.user._id;

  try {
    await Transports.removeOne({
      _id: id,
      userId,
    });
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

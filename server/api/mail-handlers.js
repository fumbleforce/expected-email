const { Mails } = require("../collections");

async function handleAddMail (req, res) {
  console.log("[Mail handler] handleAddMail");
  const {
    to,
    from,
    subject,
    text,
    sendAfter,
  } = req.body;

  if (!req.user) return res.json({ error: "not_logged_in" });
  const userId = req.user._id;

  try {
    await Mails.insertOne({
      to,
      from,
      subject,
      text,
      sendAfter,
      userId,
      sent: false
    });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleGetAllMail (req, res) {
  console.log("[Mail handler] handleGetAllMail");
  if (!req.user) {
    console.error("Not logged in in get all mail");
    return res.json({ mails: [], waitingForAuth: true });
  }
  const userId = req.user._id;

  try {
    const mails = await Mails.findMany({
      userId
    });
    return res.json({ mails });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleDeleteMail (req, res) {
  console.log("[Mail handler] handleDeleteMail");
  const id = req.params.id;

  if (!req.user) {
    console.error("Not logged in in delete mail");
    return res.json({ error: "not_logged_in" });
  }
  const userId = req.user._id;
  console.log("Removing", id, userId);
  try {
    const mail = await Mails.findOne({
      _id: id,
    });
    console.log("Found", mail);
    await Mails.removeOne({
      _id: id,
      userId
    });
    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.json({ error });
  }
}


module.exports = {
  handleAddMail,
  handleGetAllMail,
  handleDeleteMail,
};

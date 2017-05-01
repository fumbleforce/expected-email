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

  try {
    await Mails.insertOne({
      to,
      from,
      subject,
      text,
      sendAfter,
      sent: true
    });
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleGetAllMail (req, res) {
  console.log("[Mail handler] handleGetAllMail");
  try {
    const mails = await Mails.findMany({});
    return res.json({ mails });
  } catch (error) {
    return res.json({ error });
  }
}

async function handleDeleteMail (req, res) {
  console.log("[Mail handler] handleDeleteMail");
  const id = req.params.id;
  try {
    await Mails.removeOne(id);
    return res.json({ success: true });
  } catch (error) {
    return res.json({ error });
  }
}


module.exports = {
  handleAddMail,
  handleGetAllMail,
  handleDeleteMail,
};

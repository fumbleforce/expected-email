const { createMail, getAllMail, removeMail } = require("../api/mail");

function handleAddMail (req, res) {
  createMail(req.body, error => {
    if (error) return res.json({ error });
    return res.json({ success: true });
  });
}

function handleGetAllMail (req, res) {
  getAllMail((error, mails) => {
    if (error) return res.json({ error });
    return res.json({ mails });
  });
}

function handleDeleteMail (req, res) {
  const id = req.params.id;
  removeMail(id, error => {
    if (error) return res.json({ error });
    return res.json({ success: true });
  });
}


module.exports = {
  handleAddMail,
  handleGetAllMail,
  handleDeleteMail,
};

const { createMail, getAllMail } = require("../api/mail");

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


module.exports = {
  handleAddMail,
  handleGetAllMail,
};

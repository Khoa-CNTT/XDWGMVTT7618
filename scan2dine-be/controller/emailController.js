// controller/emailController.js
const { getLatestEmailData } = require('../emailListener');

function getLatestEmail(req, res) {
  const emailData = getLatestEmailData();
  if (emailData) {
    return res.json({ emailData });
  } else {
    return res.status(404).json({ message: 'Chưa có email mới.' });
  }
}

module.exports = { getLatestEmail };

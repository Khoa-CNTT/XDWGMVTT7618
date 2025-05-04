const qr = require('qrcode');

const vietqrController = {
  generateQR: async (req, res) => {
    try {
      //  Thông tin cố định của chủ quầy
      const bankBin = '970403'; // vcb Bank
      const accountNumber = '040382295508'; // Số tài khoản chủ quầy
      const accountName = 'NGUYEN VO ANH QUYEN'; // Tên chủ quầy

      //  Các giá trị từ phía khách hàng gửi lên
      const { amount, addInfo } = req.body;

      const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png` +
        `?accountName=${encodeURIComponent(accountName)}` +
        `${amount ? `&amount=${amount}` : ''}` +
        `${addInfo ? `&addInfo=${encodeURIComponent(addInfo)}` : ''}`;

      return res.status(200).json({ qr_url: qrUrl });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
};
module.exports = vietqrController;

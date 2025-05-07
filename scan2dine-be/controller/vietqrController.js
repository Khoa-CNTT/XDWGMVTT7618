const { Order, Table } = require('../model/model'); // Sếp đổi lại đúng đường dẫn
const vietqrController = {
  generateQR: async (req, res) => {
    try {
      const bankBin = '970403'; // VCB
      const accountNumber = '040382295508';
      const accountName = 'NGUYEN VO ANH QUYEN';

      const { orderId } = req.body;
      if (!orderId) return res.status(400).json({ message: 'orderId is required' });

      // Populate để lấy số bàn từ bảng Table
      const order = await Order.findById(orderId).populate('table');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const amount = order.total_amount;
      const tableNumber = order.table?.tb_number || 'Không rõ bàn';

      const addInfo = `Ban ${tableNumber} Ma don ${orderId}`;
      console.log(orderId);

      const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png` +
        `?accountName=${encodeURIComponent(accountName)}` +
        `&amount=${amount}` +
        `&addInfo=${encodeURIComponent(addInfo)}`;

      return res.status(200).json({ qr_url: qrUrl });
    } catch (error) {
      console.error('[QR ERROR]', error);
      return res.status(500).json({ message: error.message });
    }
  }
};

module.exports = vietqrController;

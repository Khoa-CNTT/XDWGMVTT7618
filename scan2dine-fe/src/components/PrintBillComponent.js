// PrintBillComponent.js
const PrintBillComponent = ({ tableInfo, orderItems, total, qrUrl }) => {
    const formatCurrency = (amount) =>
        amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleString("vi-VN");
    };

    const html = `
    <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>Hóa Đơn Thanh Toán</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; margin-bottom: 10px; }
          .info, .total { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          table, th, td { border: 1px solid #000; }
          th, td { padding: 8px; text-align: center; }
          .total p { text-align: right; margin: 5px 0; }
          .footer { text-align: center; margin-top: 30px; font-style: italic; }
          .qr-code { text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <h1>HÓA ĐƠN THANH TOÁN</h1>
        <div class="info">
          <p><strong>Nhà hàng:</strong> Khu chợ đêm SCAN2DINE</p>
          <p><strong>Địa chỉ:</strong> Cù Chính Lan</p>
          <p><strong>SĐT:</strong> 0909 123 456</p>
          <hr>
          <p><strong>Mã hóa đơn:</strong> ${tableInfo?.orderId?.toUpperCase()}</p>
          <p><strong>Bàn số:</strong> ${tableInfo?.tableNumber || ''}</p>
          <p><strong>Ngày giờ:</strong> ${formatDate(new Date().toISOString())}</p>
          <p><strong>Khách hàng:</strong> ${tableInfo?.customer?.name || 'Khách lẻ'}</p>
          <p><strong>Số điện thoại:</strong> ${tableInfo?.customer?.phone || '---'}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Món ăn</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${orderItems
            .map(
                (item) => `
              <tr>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.price)}</td>
                <td>${formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `
            )
            .join('')}
          </tbody>
        </table>
        <div class="total">
          <p><strong>Tạm tính:</strong> ${formatCurrency(total)}</p>
          <p><strong>Thuế (0%):</strong> ${formatCurrency(total * 0.0)}</p>
          <p><strong>Tổng cộng:</strong> ${formatCurrency(total)}</p>
        </div>
        <div class="qr-code">
          <p>Quét mã để thanh toán hóa đơn:</p>
          <img src="${qrUrl}" alt="QR Code" style="width: 240px; height: 300px;" />
        </div>
        <div class="footer">
          <p>Cảm ơn Quý khách! Hẹn gặp lại!</p>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 500);
          };
        </script>
      </body>
    </html>
  `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    }
};

export default PrintBillComponent;

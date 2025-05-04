// controllers/emailController.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const moment = require('moment');
const cheerio = require('cheerio');
require('dotenv').config();

// Cấu hình kết nối IMAP
const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

function getLatestEmail(req, res) {
  imap.once('ready', function () {
    imap.openBox('INBOX', false, function (err, box) {
      if (err) {
        return res.status(500).json({ error: 'Không thể kết nối tới hộp thư.' });
      }

      console.log('✅ Đang theo dõi hộp thư đến...');

      imap.on('mail', function () {
        const today = moment().startOf('day');
        
        // Tìm email có tiêu đề "SACOMBANK THONG BAO GIAO DICH PHAT SINH" từ hôm nay trở đi
        imap.search([["SINCE", today.format("DD-MMM-YYYY")], ["SUBJECT", "SACOMBANK THONG BAO GIAO DICH PHAT SINH"]], function (err, results) {
          if (err || !results || results.length === 0) {
            console.log("📭 Không có email mới hôm nay");
            return res.status(200).json({ message: 'Không có email mới hôm nay.' });
          }

          const lastEmail = results[results.length - 1];
          const f = imap.fetch(lastEmail, { bodies: "" });

          f.on('message', function (msg) {
            msg.on('body', function (stream) {
              simpleParser(stream, async (err, parsed) => {
                const { subject, date, text, html } = parsed;
                const mailTime = moment(date);

                // Kiểm tra email có phải hôm nay không và tiêu đề chính xác
                if (mailTime.isSame(today, "day") && subject === "SACOMBANK THONG BAO GIAO DICH PHAT SINH") {
                  const $ = cheerio.load(html);  // Tải HTML của email vào cheerio
                  const transaction = $('td:contains("Phát sinh")').next().text().trim();  // Tìm giao dịch
                  const availableBalance = $('td:contains("Số dư khả dụng")').next().text().trim();  // Tìm số dư khả dụng
                  const transactionDescription = $('td:contains("Nội dung")').next().text().trim(); // Tìm nội dung giao dịch

                  // Trả về dữ liệu dưới dạng JSON
                  res.status(200).json({
                    subject,
                    mailTime: mailTime.format('HH:mm:ss'),
                    transaction,
                    availableBalance,
                    transactionDescription
                  });
                } else {
                  return res.status(200).json({ message: 'Không có giao dịch mới từ Sacombank.' });
                }
              });
            });
          });
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.log('❌ Lỗi:', err);
    return res.status(500).json({ error: 'Lỗi kết nối IMAP.' });
  });

  imap.once('end', function () {
    console.log('🛑 Ngắt kết nối');
  });

  imap.connect();
}

module.exports = {
  getLatestEmail,
};

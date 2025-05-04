// emailListener.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const moment = require('moment');
const cheerio = require('cheerio');
require('dotenv').config();

let latestEmailData = null;

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

imap.once('ready', () => {
  imap.openBox('INBOX', false, (err) => {
    if (err) {
      console.error('Không mở được INBOX:', err);
      return;
    }

    console.log('📥 IMAP đã kết nối và đang theo dõi hộp thư.');

    imap.on('mail', () => {
      const today = moment().startOf('day');

      imap.search([
        ['SINCE', today.format('DD-MMM-YYYY')],
        ['SUBJECT', 'SACOMBANK THONG BAO GIAO DICH PHAT SINH']
      ], (err, results) => {
        if (err || !results || results.length === 0) {
          console.log('📭 Không có email mới phù hợp.');
          return;
        }

        const lastEmail = results[results.length - 1];
        const f = imap.fetch(lastEmail, { bodies: '' });

        f.on('message', (msg) => {
          msg.on('body', (stream) => {
            simpleParser(stream, async (err, parsed) => {
              const { subject, date, html } = parsed;
              const mailTime = moment(date);

              if (mailTime.isSame(today, 'day') && subject === 'SACOMBANK THONG BAO GIAO DICH PHAT SINH') {
                const $ = cheerio.load(html);
                latestEmailData = {
                  subject,
                  mailTime: mailTime.format('HH:mm:ss'),
                  transaction: $('td:contains("Phát sinh")').next().text().trim(),
                  availableBalance: $('td:contains("Số dư khả dụng")').next().text().trim(),
                  transactionDescription: $('td:contains("Nội dung")').next().text().trim(),
                };

                console.log('📨 Có email mới:', latestEmailData);
              }
            });
          });
        });
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('❌ Lỗi IMAP:', err);
});

imap.once('end', () => {
  console.log('🛑 Kết nối IMAP đã đóng');
});

imap.connect();

// Export cho controller lấy dữ liệu
module.exports = {
  getLatestEmailData: () => latestEmailData,
};

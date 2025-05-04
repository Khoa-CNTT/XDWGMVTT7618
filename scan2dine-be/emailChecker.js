// const Imap = require("imap");
// const { simpleParser } = require("mailparser");
// const moment = require("moment");
// require("dotenv").config();

// const imap = new Imap({
//   user: process.env.EMAIL_USER,
//   password: process.env.EMAIL_PASS,
//   host: "imap.gmail.com",
//   port: 993,
//   tls: true,
//   tlsOptions: { rejectUnauthorized: false },
// });

// // 👉 Hàm xử lý khi có email mới
// function openInbox(cb) {
//   imap.openBox("INBOX", false, cb);
// }

// imap.once("ready", function () {
//   openInbox(function (err, box) {
//     if (err) throw err;

//     console.log("✅ Đang theo dõi hộp thư đến...");

//     imap.on("mail", function () {
//       const today = moment().startOf("day");

//       // Tìm mail từ hôm nay trở đi
//       imap.search([["SINCE", today.format("DD-MMM-YYYY")]], function (err, results) {
//         if (err || !results || results.length === 0) {
//           console.log("📭 Không có email mới hôm nay");
//           return;
//         }

//         const f = imap.fetch(results, { bodies: "" });

//         f.on("message", function (msg) {
//           msg.on("body", function (stream) {
//             simpleParser(stream, async (err, parsed) => {
//               const { subject, date, text } = parsed;
//               const mailTime = moment(date);

//               // Kiểm tra email có phải hôm nay không
//               if (mailTime.isSame(today, "day")) {
//                 console.log("📩 Email mới:");
//                 console.log("Tiêu đề:", subject);
//                 console.log("Thời gian:", mailTime.format("HH:mm:ss"));
//                 console.log("Nội dung:\n", text);
//                 console.log("──────────────────────────────\n");
//               }
//             });
//           });
//         });
//       });
//     });
//   });
// });

// imap.once("error", function (err) {
//   console.log("❌ Lỗi:", err);
// });

// imap.once("end", function () {
//   console.log("🛑 Ngắt kết nối");
// });

// // ✅ Kết nối duy nhất
// imap.connect();
const Imap = require("imap");
const { simpleParser } = require("mailparser");
const moment = require("moment");
const cheerio = require("cheerio");  // Cài đặt cheerio để phân tích HTML
require("dotenv").config();

const imap = new Imap({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASS,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: { rejectUnauthorized: false },
});

// 👉 Hàm xử lý khi có email mới
function openInbox(cb) {
  imap.openBox("INBOX", false, cb);
}

imap.once("ready", function () {
  openInbox(function (err, box) {
    if (err) throw err;

    console.log("✅ Đang theo dõi hộp thư đến...");

    imap.on("mail", function () {
      const today = moment().startOf("day");

      // Tìm email có tiêu đề "SACOMBANK THONG BAO GIAO DICH PHAT SINH" từ hôm nay trở đi
      imap.search([["SINCE", today.format("DD-MMM-YYYY")], ["SUBJECT", "SACOMBANK THONG BAO GIAO DICH PHAT SINH"]], function (err, results) {
        if (err || !results || results.length === 0) {
          console.log("📭 Không có email mới hôm nay");
          return;
        }

        // Lấy email cuối cùng trong danh sách kết quả
        const lastEmail = results[results.length - 1];
        const f = imap.fetch(lastEmail, { bodies: "" });

        f.on("message", function (msg) {
          msg.on("body", function (stream) {
            simpleParser(stream, async (err, parsed) => {
              const { subject, date, text, html } = parsed;
              const mailTime = moment(date);

              // Kiểm tra email có phải hôm nay không và tiêu đề chính xác
              if (mailTime.isSame(today, "day") && subject === "SACOMBANK THONG BAO GIAO DICH PHAT SINH") {
                console.log("📩 Email mới:");
                console.log("Tiêu đề:", subject);
                console.log("Thời gian:", mailTime.format("HH:mm:ss"));

                // Sử dụng cheerio để xử lý HTML và tìm các trường trong form
                const $ = cheerio.load(html);  // Tải HTML của email vào cheerio
                const transaction = $('td:contains("Phát sinh")').next().text().trim();  // Tìm giao dịch
                const availableBalance = $('td:contains("Số dư khả dụng")').next().text().trim();  // Tìm số dư khả dụng
                const transactionDescription = $('td:contains("Nội dung")').next().text().trim(); // Tìm nội dung giao dịch

                // Kiểm tra và hiển thị các giá trị
                if (transaction && availableBalance && transactionDescription) {
                  console.log("Giao dịch:", transaction);
                  console.log("Số dư khả dụng:", availableBalance);
                  console.log("Nội dung giao dịch:", transactionDescription);
                } else {
                  console.log("❌ Không tìm thấy thông tin giao dịch, số dư hoặc nội dung.");
                }

                // Lọc thêm thông tin khác nếu cần
                const formFields = [];
                $("form input, form textarea").each(function() {
                  formFields.push({
                    name: $(this).attr("name"),
                    value: $(this).val(),
                  });
                });
                console.log("Các trường trong form: ", formFields);
                console.log("──────────────────────────────\n");
              }
            });
          });
        });
      });
    });
  });
});

imap.once("error", function (err) {
  console.log("❌ Lỗi:", err);
});

imap.once("end", function () {
  console.log("🛑 Ngắt kết nối");
});

// ✅ Kết nối duy nhất
imap.connect();






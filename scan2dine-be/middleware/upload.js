const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu và đổi tên file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image'); // ← lưu vào thư mục public/image
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

// Chỉ chấp nhận file ảnh
const fileFilter = function (req, file, cb) {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
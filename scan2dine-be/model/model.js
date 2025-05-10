const mongoose = require("mongoose");
//DANH MỤC
const categorySchema = new mongoose.Schema({
  cate_name: { type: String },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
},
  { collection: 'CATEGORY' }
);
const productSchema = new mongoose.Schema({
  pd_name: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: { type: String },
  price: { type: Number },
  image: { type: String },
  stall_id: { type: mongoose.Schema.Types.ObjectId, ref: "Stall" },
  orderdetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderDetail",
    },
  ],

  cartdetail: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "CartDetail"
  }],
}, { collection: 'PRODUCT' });
const foodstallsSchema = new mongoose.Schema({
  stall_name: {
    type: String,
  },
  location: { type: String },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  user: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
}, { collection: 'FOODSTALL' });

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  cartdetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CartDetail",
    },
  ],
}, {
  collection: "CART",
});
const cartdetailSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  products:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number
  }
}, {
  collection: "CARTDETAIL",
});
//ĐÁNH GIÁ
const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  stall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: " Stall",
  },
  content: {
    type: String,
  },
  date: { type: String },
}, { collection: 'REVIEW' });
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  phone: {
    type: String,
    // required: true
  },
  cart: {
    type: mongoose.Types.ObjectId,
    // liên kết với bảng cart
    ref: "Cart",
  },
  order: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  payment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
}, { collection: 'CUSTOMER' });
//ĐƠN HÀNG
const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table",
  },
  od_date: {
    type: Date, default: Date.now
  },
  
  total_amount: {
    type: Number,
    default: 0
  },
  od_status: {
    type: String,
    // enum: ['Chờ xác nhận','Chưa thanh toán', 'Thanh toán'],  // danh sách các trạng thái hợp lệ
    enum: ['1','2', '3'],  // danh sách các trạng thái hợp lệ
    default: "1"
  },
  orderdetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orderdetail",
    },
  ],
  notification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notification",
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  // updatedAt: { type: Date, default: Date.now }
}, { collection: 'ORDER' });
//CHI TIẾT ĐƠN HÀNG
const orderdetailSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  products: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
  },
  status: {
    type: String,
    default: "1",
    // enum: ['Chờ xác nhận', 'Xác nhận', 'Đang chuẩn bị', 'Hoàn thành'],  // danh sách các trạng thái hợp lệ
    enum: ['1', '2', '3', '4'],  // danh sách các trạng thái hợp lệ
  },
  total: {
    type:Number,
    default:0
  },
  note: {
    type: String,
    default:''
  },
}, { collection: 'ORDERDETAIL' 
});
const tableSchema = new mongoose.Schema({
  tb_number: {
    type: Number,
    unique: true
  },
  status: {
    type: String,
    // enum: ['Trống', 'Yêu cầu xác nhận món', 'Yêu cầu nhân viên', 'Yêu cầu thanh toán', 'Đang phục vụ'], 
    enum: ['1', '3', '4', '5', '2'],
    default: "1"
  },
  qr_code: {
    type: String,
  },
  order: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  stall: {
    type: String,
    ref: "Stall"
  }
}, { collection: 'TABLE' });
const roleSchema = new mongoose.Schema({
  role_name: {
    type: String,
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { collection: 'ROLE' });
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
  },
  username: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
  stall_id: {
    type: mongoose.Schema.Types.ObjectId,  // Thêm trường stall_id
    ref: "Stall",
  }
}, { collection: 'USER' });

//THÔNG BÁO
const notificationSchema = new mongoose.Schema({
  oorder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  type: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, { collection: 'NOTIFICATION' });
const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  payment_method: {
    type: String,
  },
  status: {
    type: String,
  },
}, { collection: 'PAYMENT' });
let Customer = mongoose.model("Customer", customerSchema);
let Cart = mongoose.model("Cart", cartSchema);
let Order = mongoose.model("Order", orderSchema);
let Orderdetail = mongoose.model("Orderdetail", orderdetailSchema);
let CartDetail = mongoose.model("CartDetail", cartdetailSchema);
let Category = mongoose.model("Category", categorySchema);
let Foodstall = mongoose.model("Stall", foodstallsSchema);
let Product = mongoose.model("Product", productSchema);
let Review = mongoose.model("Review", reviewSchema);
let Role = mongoose.model("Role", roleSchema);
let User = mongoose.model("User", userSchema);
let Notification = mongoose.model("Notification", notificationSchema);
let Table = mongoose.model("Table", tableSchema);
let Payment = mongoose.model("Payment", paymentSchema);

module.exports = {
  Customer,
  Cart,
  Order,
  CartDetail,
  Category,
  Foodstall,
  Review,
  Orderdetail,
  Order,
  Product,
  Role,
  Notification,
  Payment,
  Table,
  User,
};

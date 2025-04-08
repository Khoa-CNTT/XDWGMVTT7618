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
});
const productSchema = new mongoose.Schema({
  pd_name: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  description: { type: String },
  price: { type: String },
  image: { type: String },
  stall: { type: mongoose.Schema.Types.ObjectId, ref: "Stall" },
  orderdetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orderdetail",
    },
  ],
});
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
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
});
const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  cartdetail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cartdetail",
    },
  ],
});
const cartdetailSchema = new mongoose.Schema({
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  quantity: {
    type: Number,
  },
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
});
const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    // required: true
  },
  cart: [
    {
      type: mongoose.Types.ObjectId,
      // liên kết với bảng cart
      ref: "Cart",
    },
  ],
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
});
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
    type: String,
  },
  od_note: {
    type: String,
  },
  total_amount: {
    type: String,
  },
  od_status: {
    type: String,
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
});
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
    type: String,
  },
  status: {
    type: String,
  },
});
const tableSchema = new mongoose.Schema({
  tb_number: {
    type: Number,
  },
  status: {
    type: String,
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
});
const roleSchema = new mongoose.Schema({
  rl_name: {
    type: String,
  },
  user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});
const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
  },
});
//THÔNG BÁO
const notificationSchema = new mongoose.Schema({
  order: {
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
});
const paymentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: " Order",
  },
  payment_method: {
    type: String,
  },
  status: {
    types: String,
  },
});
let Customer = mongoose.model("Customer", customerSchema);
let Cart = mongoose.model("Cart", cartSchema);
let Order = mongoose.model("Order", orderSchema);
let Orderdetail = mongoose.model("Orderdetail", orderdetailSchema);
let Cartdetail = mongoose.model("CartDetail", cartdetailSchema);
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
  Cartdetail,
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

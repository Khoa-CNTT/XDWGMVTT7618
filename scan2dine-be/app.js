var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
//-------------------------------------------
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const customerRoute = require('./routes/customer');
const cartdetailRoute = require('./routes/cartdetail');
const cartRoute = require('./routes/cart');
const categoryRoute = require('./routes/category');
const productRoute = require('./routes/product');
const tableRoute = require('./routes/table');

const foodstallRoute = require('./routes/foodstall')
const roleRouter = require('./routes/role');
const userRouter = require('./routes/user');
const cors = require('cors');

const dotenv = require('dotenv')
dotenv.config();
const mongodb = require('./config/db');
mongodb();




var app = express();
app.use(cors());

// connection to mongooseDB
// main().catch(err => console.log(err));
// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/QLQuayHang');
//   // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
// }
// app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// khai báo route sử dụng
app.use('/s2d/customer', customerRoute);
app.use('/s2d/cartdetail', cartdetailRoute);
app.use('/s2d/cart', cartRoute);
app.use('/s2d/category', categoryRoute);
app.use('/s2d/product', productRoute);
app.use('/s2d/foodstall', foodstallRoute);
app.use('/s2d/table', tableRoute);
app.use('/s2d/role', roleRouter);
app.use('/s2d/user', userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

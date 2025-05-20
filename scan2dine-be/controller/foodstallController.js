const { default: mongoose } = require("mongoose");
const { Product, Category, Foodstall, User, Orderdetail, Order } = require("../model/model");
const foodstallController = {
  //  GET ALL FOODSTALL
  getAllFoodstall: async (req, res) => {
    try {
      // Lấy danh sách quầy hàng
      const foodstalls = await Foodstall.find();

      // Lấy tất cả sản phẩm của tất cả các quầy hàng
      const allProducts = await Product.find({
        stall_id: { $in: foodstalls.map((stall) => stall._id) },
      });

      // Ghép thông tin quầy hàng với sản phẩm của quầy hàng đó
      const foodstallsWithProducts = foodstalls.map((stall) => {
        const stallProducts = allProducts.filter((product) =>
          product.stall_id.equals(stall._id)
        );
        return {
          ...stall._doc, // sao chép các thông tin quầy hàng
          products: stallProducts, // thêm sản phẩm của quầy hàng vào
        };
      });

      console.log(
        "Đã lấy danh sách quầy hàng với sản phẩm:",
        foodstallsWithProducts
      );

      res.status(200).json(foodstallsWithProducts);
    } catch (err) {
      console.error(" Lỗi khi lấy foodstall:", err);
      res.status(500).json({ error: err.message });
    }
  },
  // ADD

  addFoodstall: async (req, res) => {
    try {
      // Tạo mới Foodstall
      const newStall = new Foodstall(req.body);
      const saveStall = await newStall.save();

      // Kiểm tra nếu có trường user và thực hiện cập nhật stall_id vào User
      if (req.body.user) {
        const userID = await User.findById(req.body.user);
        if (!userID) {
          return res.status(404).json({ message: "User not found" });
        }

        // Cập nhật stall_id vào User
        await userID.updateOne({
          $push: {
            stall_id: saveStall._id,
          },
        });
      }
      return res.status(200).json(saveStall); // Trả về Foodstall vừa tạo
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error", error });
    }
  },
  getFoodstallByUserId: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log("Received userId:", userId); // Add this line

      const user = await User.findById(userId).populate("stall_id");
      console.log("Found user:", user); // Add this line

      if (!user || !user.stall_id) {
        return res
          .status(404)
          .json({ message: "No foodstall found for this user" });
      }

      // ... rest of the code
    } catch (error) {
      console.error("Error getting foodstall by user:", error);
      res.status(500).json({ error: error.message });
    }
  },
  deleteFoodstall: async (req, res) => {
    try {
      // Tìm foodstall cần xóa
      const foodstall = await Foodstall.findById(req.params.id);
      if (!foodstall) {
        return res.status(404).json({ message: "Foodstall not found" });
      }

      // Tìm các sản phẩm liên quan đến foodstall này
      const productsToDelete = await Product.find({ stall_id: req.params.id });
      if (productsToDelete.length > 0) {
        console.log(`Found ${productsToDelete.length} products to delete`);

        // Xóa các sản phẩm liên quan
        await Product.deleteMany({ stall_id: req.params.id });

        // Cập nhật Category để loại bỏ sản phẩm đã xóa khỏi danh sách của Category
        await Category.updateMany(
          { products: { $in: productsToDelete.map((p) => p._id) } },
          { $pull: { products: { $in: productsToDelete.map((p) => p._id) } } }
        );

        console.log("Products and Category updated after deletion");
      }

      // Xóa foodstall
      await foodstall.deleteOne();

      // Gửi phản hồi thành công
      return res.status(200).json({
        message: "Foodstall and related products deleted successfully",
        foodstall: foodstall,
      });
    } catch (error) {
      console.error("Error in deleteFoodstall:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message || error });
    }
  },
  // UPDATE
  updateFoodstall: async (req, res) => {
    try {
      const stallId = req.params.id;
      const {stall_name,user} = req.body;
  
      const updatedStall = await Foodstall.findByIdAndUpdate(
        stallId,
        req.body,
        { new: true }
      );
  
      if (!updatedStall) {
        return res.status(404).json({ message: "Không tìm thấy quầy hàng." });
      }
  
      // Cập nhật stall_id cho user mới (nếu có truyền user)
      if (req.body.user) {
        // Xóa stall_id khỏi user cũ nếu cần (tùy logic hệ thống của bạn)
  
        await User.findByIdAndUpdate(req.body.user, {
          $set: {
            stall_id: stallId,
          },
        });
      }
  
      res.status(200).json({
        message: "Cập nhật quầy hàng thành công!",
        foodstall: updatedStall,
      });
    } catch (error) {
      console.error("Lỗi cập nhật quầy hàng:", error);
      res.status(500).json({ error: "Lỗi máy chủ khi cập nhật quầy hàng." });
    }
  },
  getAStall: async (req, res) => {
    try {
      const showAStall = await Foodstall.findById(req.params.id).populate({
        path: "products",
        select: "pd_name",
      });
      res.status(200).json(showAStall);
    } catch (error) {
      res.status(500).json(error);
    }
  },
  getFoodstallByTableNumber: async (req, res) => {
    try {
      // Lấy stall id từ params
      const { id } = req.params;

      // Tìm quầy theo _id
      const foodstall = await Foodstall.findById(id);
      if (!foodstall) {
        return res.status(404).json({ message: "Không tìm thấy quầy hàng!" });
      }

      // Lấy tất cả sản phẩm thuộc quầy đó
      const products = await Product.find({ stall_id: foodstall._id }).select(
        "pd_name price image description"
      );

      // Trả về thông tin quầy + danh sách sản phẩm
      res.status(200).json({
        stall_id: foodstall._id,
        stallName: foodstall.stall_name,
        location: foodstall.location,
        products: products,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm quầy hàng:", error);
      res.status(500).json({ error: error.message });
    }
  },
  // lấy thông tin đơn hàng của quầy hàng
  getOrderDetailByStall: async (req, res) => {
    try {
      const { id: stall } = req.params;

      const orderDetails = await Orderdetail.find({
        status: { $in: ['2', '3', '4'] }
      }).populate({
        path: "order",
        select: "table od_status od_date",
        populate: {
          path: "table",
          select: "tb_number status",
        },
      }).populate({
        path: "products",
        select: "pd_name price total image stall_id",
        populate: {
          path: "stall_id",
          select: "stall_name",
        },
      });

      const ordersMap = {};

      orderDetails.forEach((od) => {
        const order = od.order;
        const product = od.products;

        // Bỏ qua sản phẩm không thuộc stall cần lọc
        if (product?.stall_id?._id?.toString() !== stall) return;

        const orderId = order._id.toString();

        if (!ordersMap[orderId]) {
          ordersMap[orderId] = {
            order_id: orderId,
            order_status: order.od_status,
            table_number: order.table?.tb_number,
            table_status: order.table?.status,
            order_date: order.od_date,
            orderdetail: [],
          };
        }

        const existing = ordersMap[orderId].orderdetail.find(
          (d) =>
            d.product_name === product.pd_name &&
            d.status === od.status
        );

        if (existing) {
          existing.quantity += od.quantity;
        } else {
          ordersMap[orderId].orderdetail.push({
            orderdetail: od._id,
            product_name: product.pd_name,
            price: product.price,
            quantity: od.quantity,
            status: od.status,
            image: product.image,
            stall: product.stall_id?.stall_name,
          });
        }
      });

      const filteredOrders = Object.values(ordersMap).filter(
        (order) => order.orderdetail.length > 0
      );

      res.status(200).json(filteredOrders);

    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  },
  getNumberOfProduct: async (req, res) => {
    try {
      const { stall_id } = req.body;
      if (!stall_id) {
        return res.status(400).json({ error: "Thiếu stall_id" });
      }

      const objectId = new mongoose.Types.ObjectId(stall_id);

      // Tổng số món đã bán và tổng doanh thu của quầy
      const soldData = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        { $match: { "productInfo.stall_id": objectId } },
        {
          $group: {
            _id: null,
            total_sold: { $sum: "$quantity" },
            total_revenue: {
              $sum: { $multiply: ["$quantity", "$productInfo.price"] }
            }
          }
        }
      ]);

      // Tổng số đơn hàng
      const orderCountData = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        { $match: { "productInfo.stall_id": objectId } },
        {
          $group: {
            _id: "$order"
          }
        },
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 }
          }
        }
      ]);

      // Món bán được nhiều nhất
      const topProductData = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        { $match: { "productInfo.stall_id": objectId } },
        {
          $group: {
            _id: "$productInfo._id",
            pd_name: { $first: "$productInfo.pd_name" },
            total_sold: { $sum: "$quantity" }
          }
        },
        { $sort: { total_sold: -1 } },
        { $limit: 1 }
      ]);

      // Doanh thu theo tuần (7 ngày gần nhất)
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 6); // 6 ngày trước + hôm nay
      startOfWeek.setHours(0, 0, 0, 0);

      const weeklyRevenueData = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $match: {
            "productInfo.stall_id": objectId,
            updatedAt: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" }
            },
            revenue: { $sum: { $multiply: ["$quantity", "$productInfo.price"] } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Lấy thông tin quầy
      const stall = await Foodstall.findById(stall_id).lean();
      if (!stall) {
        return res.status(404).json({ error: "Không tìm thấy quầy" });
      }

      // Kết quả trả về
      const result = {
        stall_id: stall._id,
        stall_name: stall.stall_name,
        total_sold: soldData[0]?.total_sold || 0,
        total_orders: orderCountData[0]?.total_orders || 0,
        total_revenue: soldData[0]?.total_revenue || 0,
        top_product: topProductData[0] || {},
        weekly_revenue: weeklyRevenueData // [{ _id: 'yyyy-mm-dd', revenue: xxx }]
      };

      res.json(result);
    } catch (err) {
      console.error("Lỗi thống kê quầy:", err);
      res.status(500).json({ error: "Lỗi server" });
    }

  },


  getMonthlyRevenue: async (req, res) => {
    try {
      const { stall_id } = req.body;
      if (!stall_id) {
        return res.status(400).json({ error: "Thiếu stall_id" });
      }


      const objectId = new mongoose.Types.ObjectId(stall_id);

      // Tính mốc thời gian đầu và cuối tháng hiện tại
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);


      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);


      // Thống kê doanh thu từng ngày và tổng doanh thu
      const revenueData = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $match: {
            "productInfo.stall_id": objectId
          }
        },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "orderInfo"
          }
        },
        { $unwind: "$orderInfo" },
        {
          $match: {
            "orderInfo.od_date": {
              $gte: startOfMonth,
              $lt: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$orderInfo.od_date" }
            },
            daily_revenue: {
              $sum: { $multiply: ["$quantity", "$productInfo.price"] }
            },
            total_monthly_revenue: {
              $sum: { $multiply: ["$quantity", "$productInfo.price"] } // Tính luôn để cộng dồn về sau
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Tổng doanh thu cả tháng (từ daily_revenue cộng lại)
      const total_month_revenue = revenueData.reduce((sum, day) => sum + day.daily_revenue, 0);


      res.json({
        stall_id,
        month: `${startOfMonth.getMonth() + 1}/${startOfMonth.getFullYear()}`,
        daily_revenue: revenueData.map(item => ({
          date: item._id,
          revenue: item.daily_revenue
        })),
        total_revenue: total_month_revenue
      });
    } catch (err) {
      console.error("Lỗi thống kê doanh thu theo tháng:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  },

  getAllDoanhThu: async (req, res) => {
    try {
      // Lấy thống kê: món bán, số đơn và doanh thu theo stall
      const stats = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "productInfo"
          }
        },
        { $unwind: "$productInfo" },
        {
          $addFields: {
            // Chuyển giá trị price thành số
            price: { $toDouble: "$productInfo.price" }
          }
        },
        {
          $group: {
            _id: {
              stall_id: "$productInfo.stall_id",
              order: "$order"
            },
            total_quantity: { $sum: "$quantity" },
            total_revenue: {
              $sum: { $multiply: ["$quantity", "$price"] }
            }
          }
        },
        {
          $group: {
            _id: "$_id.stall_id",
            total_orders: { $sum: 1 },
            total_sold: { $sum: "$total_quantity" },
            total_revenue: { $sum: "$total_revenue" }
          }
        }
      ]);

      // Lấy danh sách các quầy
      const stalls = await Foodstall.find().lean();

      // Ghép dữ liệu thống kê với danh sách quầy
      const result = stalls.map(stall => {
        const found = stats.find(s => s._id?.toString() === stall._id.toString());
        return {
          stall_id: stall._id,
          stall_name: stall.stall_name,
          total_sold: found?.total_sold || 0,
          total_orders: found?.total_orders || 0,
          total_revenue: found?.total_revenue || 0
        };
      });

      res.json(result);
    } catch (err) {
      console.error("Lỗi thống kê tất cả quầy:", err);
      res.status(500).json({ error: "Lỗi server" });
    }
  },
  /// nội bộ
  deleteFoodstallById: async (stallId) => {
    try {
      const foodstall = await Foodstall.findById(stallId);
      if (!foodstall) {
        return { error: "Foodstall not found" };
      }

      const productsToDelete = await Product.find({ stall_id: stallId });
      if (productsToDelete.length > 0) {
        await Product.deleteMany({ stall_id: stallId });
        await Category.updateMany(
          { products: { $in: productsToDelete.map(p => p._id) } },
          { $pull: { products: { $in: productsToDelete.map(p => p._id) } } }
        );
      }

      await foodstall.deleteOne();
      return { success: true };
    } catch (error) {
      console.error("Error in deleteFoodstallById:", error);
      return { error: error.message || error };
    }
  },
  getStatistics: async (req, res) => {
    try {
      // Lấy ngày hiện tại
      const now = new Date();

      const currentMonth = `Tháng ${now.getMonth() + 1}`;
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1); // Ngày đầu tháng
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ngày cuối tháng

      // Tổng số đơn & tổng doanh thu tháng này
      const orders = await Order.find({
        od_date: { $gte: firstDay, $lte: lastDay }
      }).select("_id total_amount");

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      // Doanh thu theo ngày
      const dailyRevenue = await Order.aggregate([
        { $match: { od_date: { $gte: firstDay, $lte: lastDay } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$od_date" } },
            revenue: { $sum: "$total_amount" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Doanh thu theo quầy
      const stallRevenue = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "product",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $lookup: {
            from: "foodstall",
            localField: "product.stall_id",
            foreignField: "_id",
            as: "stall"
          }
        },
        { $unwind: "$stall" },
        {
          $match: {
            createdAt: { $gte: firstDay, $lte: lastDay }
          }
        },
        {
          $group: {
            _id: "$stall._id",
            stall_name: { $first: "$stall.stall_name" },
            totalRevenue: { $sum: "$total" }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      // Top 5 sản phẩm bán chạy
      const bestProducts = await Orderdetail.aggregate([
        {
          $match: {
            createdAt: { $gte: firstDay, $lte: lastDay }
          }
        },
        {
          $group: {
            _id: "$products",
            quantitySold: { $sum: "$quantity" },
            total: { $sum: "$total" }
          }
        },
        {
          $lookup: {
            from: "product",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.pd_name",
            quantitySold: 1,
            total: 1
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 }
      ]);

      // Sản phẩm bán chạy nhất
      const bestSeller = bestProducts[0] || null;

      // Trả về kết quả thống kê
      res.status(200).json({

        currentMonth,

        totalOrders,
        totalRevenue,
        dailyRevenue,
        stallRevenue,
        bestSeller,
        top5Products: bestProducts
      });
    } catch (err) {
      console.error("Thống kê lỗi:", err);
      res.status(500).json({ error: "Có lỗi xảy ra khi thống kê." });
    }
  },
  getDashboardStats: async (req, res) => {
    try {
      // Lấy ngày hiện tại
      const currentDate = new Date();

      // Tính ngày đầu tháng
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

      // Tính ngày cuối tháng
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Kiểm tra lại các giá trị của firstDay và lastDay
      console.log("Ngày đầu tháng:", firstDay);
      console.log("Ngày cuối tháng:", lastDay);

      // Các truy vấn MongoDB
      const bestProducts = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDay, $lte: lastDay }
          }
        },
        {
          $group: {
            _id: "$products",
            quantitySold: { $sum: "$quantity" },
            total: { $sum: "$total" }
          }
        },
        {
          $lookup: {
            from: "PRODUCT",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.pd_name",
            quantitySold: 1,
            total: 1
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 }
      ]);

      return res.status(200).json({ bestProducts });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Có lỗi khi thống kê." });
    }
  },

  getOrderStats: async (req, res) => {
    try {
      const mongoose = require("mongoose");
      const stallId = req.query.stall_id || req.body.stall_id || req.params.stall_id;
      let objectId = null;
      if (stallId) {
        try {
          objectId = new mongoose.Types.ObjectId(stallId);
        } catch (e) {
          return res.status(400).json({ message: "stall_id không hợp lệ" });
        }
      } else {
        return res.status(400).json({ message: "Thiếu stall_id" });
      }

      const currentDate = new Date();

      // ===== MỐC THỜI GIAN =====
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);

      const firstDayOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      firstDayOfToday.setHours(0, 0, 0, 0);
      const lastDayOfToday = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      lastDayOfToday.setHours(23, 59, 59, 999);

      const firstDayOfWeek = new Date(currentDate);
      const dayOfWeek = currentDate.getDay();
      const diffToMonday = (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
      firstDayOfWeek.setDate(currentDate.getDate() + diffToMonday);
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      // ===== BEST SELLER FOR TODAY =====
      const bestProductTodayArr = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDayOfToday, $lte: lastDayOfToday },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: "$product._id",
            name: { $first: "$product.pd_name" },
            quantitySold: { $sum: "$quantity" },
            total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 1 }
      ]);
      const topProductToday = bestProductTodayArr[0] || null;

      // ===== BEST SELLER FOR THIS WEEK =====
      const bestProductWeekArr = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDayOfWeek, $lte: lastDayOfWeek },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: "$product._id",
            name: { $first: "$product.pd_name" },
            quantitySold: { $sum: "$quantity" },
            total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 1 }
      ]);
      const topProductWeek = bestProductWeekArr[0] || null;

      // ===== BEST SELLER FOR THIS MONTH =====
      const bestProductMonthArr = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: "$product._id",
            name: { $first: "$product.pd_name" },
            quantitySold: { $sum: "$quantity" },
            total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 1 }
      ]);
      const topProductMonth = bestProductMonthArr[0] || null;

      // ===== HÀM DÙNG CHUNG: Thống kê tổng đơn và doanh thu =====
      const getStats = async (startDate, endDate) => {
        const data = await Orderdetail.aggregate([
          {
            $lookup: {
              from: "PRODUCT",
              localField: "products",
              foreignField: "_id",
              as: "product"
            }
          },
          { $unwind: "$product" },
          { $match: { "product.stall_id": objectId } },
          {
            $lookup: {
              from: "ORDER",
              localField: "order",
              foreignField: "_id",
              as: "order"
            }
          },
          { $unwind: "$order" },
          {
            $match: {
              "order.od_date": { $gte: startDate, $lte: endDate },
              "order.od_status": { $in: ['2', '3'] }
            }
          },
          {
            $group: {
              _id: "$order._id",
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } }
            }
          }
        ]);
        const totalOrders = data.length;
        const totalRevenue = data.reduce((sum, o) => sum + (o.total || 0), 0);
        return { totalOrders, totalRevenue };
      };

      const dayStats = await getStats(firstDayOfToday, lastDayOfToday);
      const weekStats = await getStats(firstDayOfWeek, lastDayOfWeek);
      const monthStats = await getStats(firstDayOfMonth, lastDayOfMonth);

      // ===== DOANH THU THEO NGÀY TRONG THÁNG =====
      const dailyRevenueInMonth = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$order.od_date" }
            },
            totalRevenue: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            totalOrders: { $addToSet: "$order._id" }
          }
        },
        {
          $project: {
            totalRevenue: 1,
            totalOrders: { $size: "$totalOrders" }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // ===== DOANH THU THEO THÁNG TRONG NĂM =====
      const monthlyRevenueInYear = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": {
              $gte: new Date(currentDate.getFullYear(), 0, 1),
              $lte: new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
            },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: { $month: "$order.od_date" },
            totalRevenue: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            totalOrders: { $addToSet: "$order._id" }
          }
        },
        {
          $project: {
            month: "$_id",
            totalRevenue: 1,
            totalOrders: { $size: "$totalOrders" },
            _id: 0
          }
        },
        { $sort: { month: 1 } }
      ]);

      // ===== DOANH THU THEO TUẦN TRONG NĂM =====
      const weeklyRevenueInYear = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "PRODUCT",
            localField: "products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        { $match: { "product.stall_id": objectId } },
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": {
              $gte: new Date(currentDate.getFullYear(), 0, 1),
              $lte: new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999)
            },
            "order.od_status": { $in: ['2', '3'] }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$order.od_date" },
              week: { $isoWeek: "$order.od_date" }
            },
            totalRevenue: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            totalOrders: { $addToSet: "$order._id" }
          }
        },
        {
          $project: {
            year: "$_id.year",
            week: "$_id.week",
            totalRevenue: 1,
            totalOrders: { $size: "$totalOrders" },
            _id: 0
          }
        },
        { $sort: { year: 1, week: 1 } }
      ]);

      // ===== TRẢ VỀ KẾT QUẢ =====
      return res.status(200).json({
        dayStats,
        weekStats,
        monthStats,
        dailyRevenueInMonth,
        monthlyRevenueInYear,
        weeklyRevenueInYear,
        topProductToday,
        topProductWeek,
        topProductMonth
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Có lỗi khi thống kê." });
    }
  },


  getInputMonthYear: async (req, res) => {
    try {
      const { month, year } = req.body;

      // Kiểm tra hợp lệ
      if (!month || !year) {
        return res.status(400).json({ message: "Thiếu tháng hoặc năm." });
      }

      // Tính ngày đầu và cuối tháng
      const firstDay = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month, 0, 23, 59, 59, 999);

      console.log(`Thống kê tháng ${month}/${year}: từ ${firstDay.toLocaleString()} đến ${lastDay.toLocaleString()}`);

      // Thống kê sản phẩm bán chạy
      const bestProducts = await Orderdetail.aggregate([
        {
          $lookup: {
            from: "ORDER",
            localField: "order",
            foreignField: "_id",
            as: "order"
          }
        },
        { $unwind: "$order" },
        {
          $match: {
            "order.od_date": { $gte: firstDay, $lte: lastDay },
            "order.od_status": { $in: ["2", "3"] } // Chỉ đơn đã thanh toán
          }
        },
        {
          $group: {
            _id: "$products",
            quantitySold: { $sum: "$quantity" },
            total: { $sum: "$total" }
          }
        },
        {
          $lookup: {
            from: "PRODUCT",
            localField: "_id",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$product._id",
            name: "$product.pd_name",
            quantitySold: 1,
            total: 1
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 }
      ]);

      // Tổng doanh thu
      const totalRevenue = bestProducts.reduce((sum, p) => sum + (p.total || 0), 0);

      return res.status(200).json({
        month: parseInt(month),
        year: parseInt(year),
        totalRevenue,
        bestProducts
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Có lỗi khi thống kê." });
    }
  },
  // thống kê cho hiếu
  getStatisticByDateRange: async (req, res) => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // đầu tháng
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1); // đầu tháng tiếp theo

      const result = await Order.aggregate([
        {
          $match: {
            od_date: {
              $gte: startOfMonth,
              $lt: endOfMonth
            }
          }
        },
        {
          $group: {
            _id: "$customer"
          }
        },
        {
          $count: "customerCount"
        }
      ]);

      const count = result.length > 0 ? result[0].customerCount : 0;

      res.status(200).json({ customerCount: count });
    } catch (error) {
      console.error("Lỗi thống kê khách hàng trong tháng:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  },
  getRevenueByStallInRange: async (req, res) => {
    try {
      const { from, to } = req.body;
      console.log('kết quả nhận đc', from, to);

      if (!from || !to) {
        return res.status(400).json({ message: "Thiếu ngày bắt đầu hoặc kết thúc" });
      }

      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);

      const result = await Order.aggregate([
        {
          $match: {
            od_date: { $gte: start, $lte: end },
            od_status: "3"
          }
        },
        {
          $lookup: {
            from: "ORDERDETAIL",
            localField: "orderdetail",
            foreignField: "_id",
            as: "details"
          }
        },
        { $unwind: "$details" },
        {
          $lookup: {
            from: "PRODUCT",
            localField: "details.products",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.stall_id",
            totalRevenue: { $sum: "$details.total" }
          }
        },
        {
          $lookup: {
            from: "FOODSTALL",
            localField: "_id",
            foreignField: "_id",
            as: "stall"
          }
        },
        { $unwind: "$stall" },
        {
          $lookup: {
            from: "USER",
            localField: "stall.user",
            foreignField: "_id",
            as: "owner"
          }
        },
        {
          $lookup: {
            from: "PRODUCT",
            localField: "_id",
            foreignField: "stall_id",
            as: "products"
          }
        },
        {
          $project: {
            _id: 1,
            totalRevenue: 1,
            stall_name: "$stall.stall_name",
            location: "$stall.location",
            owner_name: { $arrayElemAt: ["$owner.full_name", 0] },
            totalProducts: { $size: "$products" }
          }
        }
      ]);

      res.json(result);
    } catch (err) {
      console.error("Lỗi lấy doanh thu:", err);
      res.status(500).json({ message: "Server error" });
    }
  },
  // thống kê các loại 
  getStatistics113: async (req, res) => {

  try {
    const { type, filter, value } = req.body;

    let startDate, endDate;
    if (filter === "year") {
      const year = value.year;
      startDate = new Date(year, 0, 1);
      endDate = new Date(year + 1, 0, 1);
    } else if (filter === "month") {
      const { year, month } = value;
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    } else if (filter === "range") {
      startDate = new Date(value.startDate);
      endDate = new Date(value.endDate);
    } else {
      return res.status(400).json({ message: "Loại filter không hợp lệ!" });
    }

    // ===== Thống kê theo QUẦY =====
    if (type === "stall") {
      const stalls = await Foodstall.find()
        .populate("products")
        .populate({
          path: "user",
          model: "User"
        });

      const orders = await Order.find({
        od_date: { $gte: startDate, $lt: endDate }
      }).populate({
        path: "orderdetail",
        populate: { path: "products", model: "Product" }
      });

      const result = stalls.map(stall => {
        let revenue = 0;
        let totalOrders = 0;

        orders.forEach(order => {
          const matchedDetails = order.orderdetail.filter(
            od => od.products?.stall_id?.toString() === stall._id.toString()
          );

          if (matchedDetails.length > 0) {
            totalOrders += 1;
            revenue += matchedDetails.reduce((s, d) => s + (d.total || 0), 0);
          }
        });

        return {
          stall_id: stall._id,
          stall_name: stall.stall_name,
          owner_name: Array.isArray(stall.user) && stall.user.length > 0
            ? stall.user[0].full_name
            : "Chưa gán",
          number_of_products: stall.products.length,
          total_orders: totalOrders,
          total_revenue: revenue
        };
      });

      return res.json(result);
    }

    // ===== Thống kê theo ĐƠN HÀNG =====
    if (type === "order") {
      const orders = await Order.find({
        od_date: { $gte: startDate, $lt: endDate }
      })
        .populate("customer")
        .populate("table")
        .populate("orderdetail");

      const result = orders.map(order => ({
        order_id: order._id,
        table_number: order.table?.tb_number || "N/A",
        customer_name: order.customer?.name || "Ẩn danh",
        phone: order.customer?.phone || "Không có",
        order_date: order.od_date,
        total_items: order.orderdetail.length,
        total_amount: order.total_amount || 0
      }));

      return res.json(result);
    }

    // ===== Thống kê theo MÓN ĂN =====
    if (type === "product") {
      const details = await Orderdetail.find({
        createdAt: { $gte: startDate, $lt: endDate }
      }).populate({
        path: "products",
        populate: {
          path: "stall_id",
          model: "Stall",
          populate: {
            path: "user",
            model: "User"
          }
        }
      });

      const productStats = {};

      details.forEach(detail => {
        const product = detail.products;
        if (!product) return;

        const stall = product.stall_id;
        const owner = Array.isArray(stall?.user) ? stall.user[0] : null;

        const id = product._id.toString();
        if (!productStats[id]) {
          productStats[id] = {
            product_id: product._id,
            product_name: product.pd_name,
            image: product.image,
            price: product.price,
            call_count: 0,
            revenue: 0,
            stall_name: stall?.stall_name || "Không rõ",
            owner_name: owner?.full_name || "Chưa gán"
          };
        }

        productStats[id].call_count += detail.quantity;
        productStats[id].revenue += detail.total || 0;
      });

      return res.json(Object.values(productStats));
    }

    return res.status(400).json({ message: "Loại thống kê không hợp lệ!" });

  } catch (err) {
    console.error("Lỗi thống kê:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
},
getMonthlyRevenueAllStalls: async (req, res) => {
    try {
      const { year } = req.body;

      if (!year) {
        return res.status(400).json({ message: 'Thiếu năm cần thống kê (gửi trong body)' });
      }

      const start = new Date(`${year}-01-01`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);

      const result = await Order.aggregate([
        {
          $match: {
            od_date: { $gte: start, $lte: end },
            od_status: { $in: ['2', '3'] } // Chỉ tính đơn đã thanh toán
          }
        },
        {
          $lookup: {
            from: 'ORDERDETAIL',
            localField: 'orderdetail',
            foreignField: '_id',
            as: 'details'
          }
        },
        { $unwind: '$details' },
        {
          $group: {
            _id: { month: { $month: '$od_date' } },
            totalRevenue: { $sum: '$details.total' },
            totalOrders: { $addToSet: '$_id' }
          }
        },
        {
          $project: {
            month: '$_id.month',
            totalRevenue: 1,
            totalOrders: { $size: '$totalOrders' },
            _id: 0
          }
        }
      ]);

      // Bổ sung các tháng chưa có dữ liệu
      const fullStats = Array.from({ length: 12 }, (_, i) => {
        const monthData = result.find(item => item.month === i + 1);
        return {
          month: i + 1,
          totalRevenue: monthData ? monthData.totalRevenue : 0,
          totalOrders: monthData ? monthData.totalOrders : 0
        };
      });

      return res.status(200).json({
        year: parseInt(year),
        monthlyStats: fullStats
      });

    } catch (error) {
      console.error('Lỗi khi thống kê doanh thu theo tháng:', error);
      return res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
  }
}
module.exports = foodstallController;

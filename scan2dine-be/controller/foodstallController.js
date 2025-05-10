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
      const io = req.app.get('io');
            notifyStallAdded(io, saveStall._id, {
                stall: saveStall._id,
                name: saveStall.stall_name, // Giả sử trường trong schema Foodstall là stall_name
                user: req.body.user,
                message: 'Quầy hàng mới đã được thêm',
            });
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

  deleteFoodstall: async (stallId) => {
    try {
      // Tìm foodstall cần xóa
      const foodstall = await Foodstall.findById(stallId);
      if (!foodstall) {
        return { message: "Foodstall not found" };
      }

      // Tìm các sản phẩm liên quan đến foodstall này
      const productsToDelete = await Product.find({ stall_id: stallId });
      if (productsToDelete.length > 0) {
        // Xóa các sản phẩm liên quan
        await Product.deleteMany({ stall_id: stallId });

        // Cập nhật Category để loại bỏ sản phẩm đã xóa khỏi danh sách của Category
        await Category.updateMany(
          { products: { $in: productsToDelete.map((p) => p._id) } },
          { $pull: { products: { $in: productsToDelete.map((p) => p._id) } } }
        );
      }

      // Xóa foodstall
      await foodstall.deleteOne();
      const io = req.app.get('io');
            notifyStallDeleted(io, deleteStall._id, {
                stall: deleteStall._id,
                stall_name: deleteStall.stall_name, // Giả sử trường trong schema Foodstall là stall_name
                message: 'Quầy hàng và các sản phẩm liên quan đã bị xóa',
            });
      return { message: "Foodstall and related products deleted successfully" };
    } catch (error) {
      console.error("Error in deleteFoodstall:", error);
      return { error: error.message || error };
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
      const updateData = req.body;

      const updatedStall = await Foodstall.findByIdAndUpdate(
        stallId,
        updateData,
        { new: true }
      );

      if (!updatedStall) {
        return res.status(404).json({ message: "Không tìm thấy quầy hàng." });
      }
      const io = req.app.get('io');
            notifyStallUpdated(io, updatedStall._id, {
                stall: updatedStall._id,
                stall_name: updatedStall.stall_name, // Giả sử trường trong schema Foodstall là stall_name
                message: 'Thông tin quầy hàng đã được cập nhật',
            });
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
        select: "table od_status",
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
  }
  ,
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
  deleteFoodstallById : async (stallId) => {
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
}
}
module.exports = foodstallController;

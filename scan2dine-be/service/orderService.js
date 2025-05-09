const { Cart, Customer, Table, CartDetail, Orderdetail, Order, Product } = require('../model/model');
const moment = require('moment');
const { mergeDuplicateOrderDetails, calculateTotalOrderPrice } = require('../utils/orderUtils');
const { deleteCartDetailsByCartId } = require('../utils/cartUtils');
const { updateOrderDetailStatus } = require('../utils/orderDetailUtils');
const { notifyTableUpdated, notifyCartUpdated, notifyOrderCreated, notifyOrderUpdated } = require('../utils/socketUtils');

const confirmAllPendingOrderDetails = async (orderId, io) => {
    const order = await Order.findById(orderId).populate('orderdetail');
    if (!order) throw new Error('Order not found');

    const updatedDetails = [];
    for (const detail of order.orderdetail) {
        // duyệt qua từng cái trong mảng orderdetail của order và kiểm tra trạng thái 
        if (detail.status === '1') {
            // Gọi lại hàm bạn đã viết để xử lý từng cái và gộp nếu có
            const result = await updateOrderDetailStatus(orderId, detail._id.toString(), '2');
            updatedDetails.push(result);
        }
    }

    return {
        message: 'Đã chuyển tất cả OrderDetail từ Chờe xác nhận sang xác nhận',
        updates: updatedDetails,
        order: await Order.findById(orderId).populate('orderdetail')
    };
};

const createOrderFromCartService = async (cartId, tableId, io) => {
    // Tìm giỏ hàng theo cartId
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Không tìm thấy giỏ hàng');

    const customerId = cart.customer;

    // Lấy danh sách chi tiết giỏ hàng và populate thông tin sản phẩm
    const cartDetails = await CartDetail.find({ cart: cartId }).populate('products');
    if (cartDetails.length === 0) throw new Error('Giỏ hàng trống!');

    // Tìm đơn hàng chưa thanh toán theo bàn (ưu tiên gộp đơn theo bàn)
    let order = await Order.findOne({
        table: tableId,
        od_status: { $in: ['2', '1'] }
    });
    let isNewOrder = false;
    // Nếu chưa có đơn hàng chưa thanh toán cho bàn → tạo mới
    if (!order) {
        order = new Order({
            customer: customerId,
            table: tableId,
            od_status: '1'
        });
        await order.save();
        // Cập nhật trạng thái bàn : yêu cầu xác nhận món ăn
        await Table.findByIdAndUpdate(tableId, { $set: { status: '1' } });
        notifyTableUpdated(io, tableId, {
            tableId,
            status: '1'
        });
        // Cập nhật mối quan hệ vào bảng Table và Customer
        await Table.findByIdAndUpdate(tableId, { $push: { order: order._id } });
        await Customer.findByIdAndUpdate(customerId, { $push: { order: order._id } });
    }

    const orderDetails = []; // Danh sách các OrderDetail sẽ được xử lý và trả về
    let shouldUpdateTableStatus = false; // Cờ đánh dấu có thêm món mới hay không

    // Lặp qua từng sản phẩm trong giỏ hàng
    for (const item of cartDetails) {
        // Kiểm tra xem sản phẩm này đã có trong OrderDetail với trạng thái "Chờ xác nhận" chưa
        const existingDetail = await Orderdetail.findOne({
            order: order._id,
            products: item.products._id,
            status: '1'
        });

        if (existingDetail) {
            // Nếu đã có thì chỉ cập nhật số lượng và tổng tiền
            existingDetail.quantity += item.quantity;
            existingDetail.total = existingDetail.quantity * item.products.price;
            await existingDetail.save();
            orderDetails.push(existingDetail);
        } else {
            // Nếu chưa có thì tạo mới OrderDetail
            const newDetail = await Orderdetail.create({
                order: order._id,
                foodstall: item.products.stall_id, // Lấy stall từ sản phẩm
                products: item.products._id,
                quantity: item.quantity,
                total: item.products.price * item.quantity,
                status: '1'
            });
            orderDetails.push(newDetail);

            // Cập nhật mối quan hệ giữa Product và OrderDetail
            await Product.findByIdAndUpdate(item.products._id, {
                $push: { orderdetail: newDetail._id }
            });

            // Thêm vào danh sách orderdetail của đơn hàng
            order.orderdetail.push(newDetail._id);

            // Đánh dấu là có thêm món mới cần cập nhật trạng thái bàn
            shouldUpdateTableStatus = true;
        }
    }

    // Cập nhật trạng thái bàn nếu có ít nhất một món mới
    if (shouldUpdateTableStatus) {
        await Table.findByIdAndUpdate(tableId, {
            $set: { status: '1' }
        });
    }
    notifyTableUpdated(io, tableId, { tableId, status: '1' });

    // Lưu lại thay đổi trong đơn hàng
    await order.save();

    // Gộp các OrderDetail trùng sản phẩm và trạng thái
    await mergeDuplicateOrderDetails(order._id);

    // Xoá toàn bộ chi tiết giỏ hàng đã xử lý
    await deleteCartDetailsByCartId(cartId,io);
    notifyCartUpdated(io, cartId, { cartId, message: 'Giỏ hàng đã được xóa sau khi tạo đơn hàng' });
    // tôgnr tiền cho order
    const totalPrice = await calculateTotalOrderPrice(order._id,io);
    // Lấy lại đơn hàng sau khi populate đầy đủ
    const populatedOrder = await Order.findById(order._id)
        .populate('customer', 'name phone')
        .populate('table', 'tb_number')
        .populate('orderdetail', 'products quantity status')
        .populate('orderdetail.products', 'pd_name price');

    // Format lại dữ liệu trả về: sản phẩm, số lượng, trạng thái, giá...
    const orderItems = orderDetails.map(item => ({
        product: item.products,
        price: item.products.price,
        name: item.products.pd_name,
        status: item.status,
        quantity: item.quantity,
        total: item.total
    }));
    // const orderItems = populatedOrder.orderdetail.map(item => ({
    //     product: item.products._id,
    //     price: item.products.price,
    //     name: item.products.pd_name,
    //     status: item.status,
    //     quantity: item.quantity,
    //     total: item.total
    // }));
    

    // Định dạng thời gian tạo đơn
    const formattedCreatedAt = moment(populatedOrder.createdAt).format('DD/MM/YYYY HH:mm:ss');

    // Trả kết quả cho controller sử dụng
    const orderData = {
        _id: populatedOrder._id,
        customer: populatedOrder.customer,
        table: populatedOrder.table,
        orderdetail: orderItems,
        status: populatedOrder.od_status,
        total_amount: totalPrice,
        createdAt: formattedCreatedAt
    };
    if (isNewOrder) {
        notifyOrderCreated(io, order._id, orderData);
    } else {
        notifyOrderUpdated(io, order._id, orderData);
    }

    return {
        message: 'Đơn hàng đã được xử lý thành công!',
        order: orderData,
    };
};

module.exports = {
    confirmAllPendingOrderDetails,
    createOrderFromCartService
};

const notifyOrderCreated = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('order_created', data);
};

const notifyOrderUpdated = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('order_updated', data);
};

const notifyTableUpdated = (io, tableId, data) => {
    io.to(`table_${tableId}`).emit('table_updated', data);
};

const notifyCartUpdated = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cart_updated', data);
};
const notifyCartDetailAdded = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cartdetail_added', data);
};
const notifyCartAdded = (io, cartId, data) => {
    io.emit('cart_added', data); // Phát cho tất cả client vì giỏ hàng là dữ liệu chung
};
const notifyCartDetailUpdated = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cartdetail_updated', data);
};
const notifyCartDeleted = (io, cartId, data) => {
    io.emit('cart_deleted', data);
};

const notifyCartDetailDeleted = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cartdetail_deleted', data);
};

const notifyCartDetailQuantityDecreased = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cartdetail_quantity_decreased', data);
};
const notifyCategoryAdded = (io, categoryId, data) => {
    io.emit('category_added', data); // Phát cho tất cả client vì danh mục là dữ liệu chung
};

const notifyCategoryUpdated = (io, categoryId, data) => {
    io.emit('category_updated', data);
};

const notifyCategoryDeleted = (io, categoryId, data) => {
    io.emit('category_deleted', data);
};

const notifyCustomerAdded = (io, customerId, data) => {
    io.emit('customer_added', data); // Phát cho tất cả client vì khách hàng là dữ liệu chung
};

const notifyCustomerUpdated = (io, customerId, data) => {
    io.emit('customer_updated', data);
};

const notifyCustomerDeleted = (io, customerId, data) => {
    io.emit('customer_deleted', data);
};

const notifyCartCreated = (io, cartId, data) => {
    io.emit('cart_created', data);
};


const notifyStallAdded = (io, stallId, data) => {
    io.emit('stall_added', data); // Phát cho tất cả client vì quầy hàng là dữ liệu chung
};

const notifyStallUpdated = (io, stallId, data) => {
    io.emit('stall_updated', data);
};

const notifyStallDeleted = (io, stallId, data) => {
    io.emit('stall_deleted', data);
};

const notifyOrderAdded = (io, orderId, data) => {
    io.emit('order_added', data);
};


const notifyOrderDeleted = (io, orderId, data) => {
    io.emit('order_deleted', data);
};

const notifyOrderDetailRemoved = (io, orderId, data) => {
    io.emit('orderdetail_removed', data);
};
const notifyOrderConfirmed = (io, orderId, data) => {
    io.emit('order_confirmed', data);
};

const notifyOrderDetailAdded = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('orderdetail_added', data);
};

const notifyOrderDetailUpdated = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('orderdetail_updated', data);
};

const notifyOrderDetailDeleted = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('orderdetail_deleted', data);
};

const notifyOrderDetailQuantityDecreased = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('orderdetail_quantity_decreased', data);
};

// const notifyOrderDetailStatusUpdated = (io, orderId, data) => {
//     io.to(`order_${orderId}`).emit('orderdetail_status_updated', data);
// };

const notifyOrderDetailsMerged = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('orderdetails_merged', data);
};

const notifyOrderTotalUpdated = (io, orderId, data) => {
    io.to(`order_${orderId}`).emit('order_total_updated', data);
};

const notifyCartDetailsDeleted = (io, cartId, data) => {
    io.to(`cart_${cartId}`).emit('cartdetails_deleted', data);
};

module.exports = {
    //---Cart---------
    notifyOrderCreated,
    notifyOrderUpdated,
    notifyTableUpdated,
    notifyCartUpdated,
    notifyCartDetailsDeleted, // Đã có từ trước
    notifyCartAdded,
    notifyCartDeleted,
    // ---Cartdetail-----------
    notifyCartDetailAdded,
    notifyCartDetailUpdated,
    notifyCartDetailDeleted,
    notifyCartDetailQuantityDecreased,
    //---Category-------------
    notifyCategoryAdded,
    notifyCategoryUpdated,
    notifyCategoryDeleted,
    //---Customer----------
    notifyCustomerAdded,
    notifyCustomerUpdated,
    notifyCustomerDeleted,
    notifyCartCreated,
    //---FoodStall---------
    notifyStallAdded,
    notifyStallUpdated,
    notifyStallDeleted,
    //----Order----------
    notifyOrderAdded,
    notifyOrderDeleted,
    notifyOrderDetailRemoved,
    notifyOrderConfirmed,
    //-----Orderdetail---------
    notifyOrderDetailAdded,
    notifyOrderDetailUpdated,
    notifyOrderDetailDeleted,
    notifyOrderDetailQuantityDecreased,
    //--------------
};
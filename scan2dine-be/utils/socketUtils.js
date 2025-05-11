// Hàm tổng quát để gửi thông báo qua Socket.IO
const notifyEvent = (io, rooms, event, data, extraFields = {}) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { ...extraFields, ...validData };
    console.log(`Emitting ${event} with data:`, enrichedData);
    
    if (rooms) {
        if (Array.isArray(rooms)) {
            rooms.forEach(room => io.to(room).emit(event, enrichedData));
        } else {
            io.to(rooms).emit(event, enrichedData);
        }
    } else {
        io.emit(event, enrichedData);
    }
};

// Các hàm thông báo sử dụng notifyEvent
const notifyOrderCreated = (io, orderId, data) => {
    notifyEvent(io, `order_${orderId}`, 'order_created', data, { orderId });
};

const notifyOrderUpdated = (io, orderId, data) => {
    notifyEvent(io, `order_${orderId}`, 'order_updated', data, { orderId });
};

const notifyTableUpdated = (io, tableId, data) => {
    notifyEvent(io, `table_${tableId}`, 'table_updated', data, { tableId });
};

const notifyCartUpdated = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cart_updated', data, { cartId });
};

const notifyCartDetailAdded = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cartdetail_added', data, { cartId });
};

const notifyCartAdded = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cart_added', data, { cartId });
};

const notifyCartDetailUpdated = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cartdetail_updated', data, { cartId });
};

const notifyCartDeleted = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cart_deleted', data, { cartId });
};

const notifyCartDetailDeleted = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cartdetail_deleted', data, { cartId });
};

const notifyCartDetailQuantityDecreased = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cartdetail_quantity_decreased', data, { cartId });
};

const notifyCategoryAdded = (io, categoryId, data) => {
    notifyEvent(io, null, 'category_added', data, { categoryId });
};

const notifyCategoryUpdated = (io, categoryId, data) => {
    notifyEvent(io, null, 'category_updated', data, { categoryId });
};

const notifyCategoryDeleted = (io, categoryId, data) => {
    notifyEvent(io, null, 'category_deleted', data, { categoryId });
};

const notifyCustomerAdded = (io, customerId, data) => {
    notifyEvent(io, null, 'customer_added', data, { customerId });
};

const notifyCustomerUpdated = (io, customerId, data) => {
    notifyEvent(io, null, 'customer_updated', data, { customerId });
};

const notifyCustomerDeleted = (io, customerId, data) => {
    notifyEvent(io, null, 'customer_deleted', data, { customerId });
};

const notifyCartCreated = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cart_created', data, { cartId });
};

const notifyStallAdded = (io, stallId, data) => {
    notifyEvent(io, null, 'stall_added', data, { stallId });
};

const notifyStallUpdated = (io, stallId, data) => {
    notifyEvent(io, null, 'stall_updated', data, { stallId });
};

const notifyStallDeleted = (io, stallId, data) => {
    notifyEvent(io, null, 'stall_deleted', data, { stallId });
};

const notifyOrderAdded = (io, orderId, tableId, data) => {
    notifyEvent(io, [`order_${orderId}`, `table_${tableId}`], 'order_added', data, { orderId, tableId });
};

const notifyOrderDeleted = (io, orderId, tableId, data) => {
    notifyEvent(io, [`order_${orderId}`, `table_${tableId}`], 'order_deleted', data, { orderId, tableId });
};

const notifyOrderConfirmed = (io, orderId, tableId, data) => {
    notifyEvent(io, [`order_${orderId}`, `table_${tableId}`], 'order_confirmed', data, { orderId, tableId });
};

const notifyOrderDetailChanged = (io, orderId, action, data) => {
    notifyEvent(io, `order_${orderId}`, 'orderdetail_changed', data, { orderId, action });
};

const notifyOrderTotalUpdated = (io, orderId, data) => {
    notifyEvent(io, `order_${orderId}`, 'order_total_updated', data, { orderId });
};

const notifyCartDetailsDeleted = (io, cartId, data) => {
    notifyEvent(io, `cart_${cartId}`, 'cartdetails_deleted', data, { cartId });
};

// Xuất các hàm
module.exports = {
    notifyOrderCreated,
    notifyOrderUpdated,
    notifyTableUpdated,
    notifyCartUpdated,
    notifyCartDetailsDeleted,
    notifyCartAdded,
    notifyCartDeleted,
    notifyCartDetailAdded,
    notifyCartDetailUpdated,
    notifyCartDetailDeleted,
    notifyCartDetailQuantityDecreased,
    notifyCategoryAdded,
    notifyCategoryUpdated,
    notifyCategoryDeleted,
    notifyCustomerAdded,
    notifyCustomerUpdated,
    notifyCustomerDeleted,
    notifyCartCreated,
    notifyStallAdded,
    notifyStallUpdated,
    notifyStallDeleted,
    notifyOrderAdded,
    notifyOrderDeleted,
    notifyOrderConfirmed,
    notifyOrderDetailChanged,
    notifyOrderTotalUpdated,
};
const notifyOrderCreated = (io, orderId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, ...validData };
    console.log('Emitting order_created with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_created', enrichedData);
};

const notifyOrderUpdated = (io, orderId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, ...validData };
    console.log('Emitting order_updated with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_updated', enrichedData);
};

const notifyTableUpdated = (io, tableId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { tableId, ...validData };
    console.log('Emitting table_updated with data:', enrichedData);
    io.to(`table_${tableId}`).emit('table_updated', enrichedData);
};

const notifyCartUpdated = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cart_updated with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cart_updated', enrichedData);
};

const notifyCartDetailAdded = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cartdetail_added with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cartdetail_added', enrichedData);
};

const notifyCartAdded = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cart_added with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cart_added', enrichedData);
};

const notifyCartDetailUpdated = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cartdetail_updated with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cartdetail_updated', enrichedData);
};

const notifyCartDeleted = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cart_deleted with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cart_deleted', enrichedData);
};

const notifyCartDetailDeleted = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cartdetail_deleted with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cartdetail_deleted', enrichedData);
};

const notifyCartDetailQuantityDecreased = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cartdetail_quantity_decreased with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cartdetail_quantity_decreased', enrichedData);
};

const notifyCategoryAdded = (io, categoryId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { categoryId, ...validData };
    console.log('Emitting category_added with data:', enrichedData);
    io.emit('category_added', enrichedData);
};

const notifyCategoryUpdated = (io, categoryId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { categoryId, ...validData };
    console.log('Emitting category_updated with data:', enrichedData);
    io.emit('category_updated', enrichedData);
};

const notifyCategoryDeleted = (io, categoryId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { categoryId, ...validData };
    console.log('Emitting category_deleted with data:', enrichedData);
    io.emit('category_deleted', enrichedData);
};

const notifyCustomerAdded = (io, customerId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { customerId, ...validData };
    console.log('Emitting customer_added with data:', enrichedData);
    io.emit('customer_added', enrichedData);
};

const notifyCustomerUpdated = (io, customerId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { customerId, ...validData };
    console.log('Emitting customer_updated with data:', enrichedData);
    io.emit('customer_updated', enrichedData);
};

const notifyCustomerDeleted = (io, customerId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { customerId, ...validData };
    console.log('Emitting customer_deleted with data:', enrichedData);
    io.emit('customer_deleted', enrichedData);
};

const notifyCartCreated = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cart_created with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cart_created', enrichedData);
};

const notifyStallAdded = (io, stallId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { stallId, ...validData };
    console.log('Emitting stall_added with data:', enrichedData);
    io.emit('stall_added', enrichedData);
};

const notifyStallUpdated = (io, stallId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { stallId, ...validData };
    console.log('Emitting stall_updated with data:', enrichedData);
    io.emit('stall_updated', enrichedData);
};

const notifyStallDeleted = (io, stallId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { stallId, ...validData };
    console.log('Emitting stall_deleted with data:', enrichedData);
    io.emit('stall_deleted', enrichedData);
};

const notifyOrderAdded = (io, orderId, tableId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, tableId, ...validData };
    console.log('Emitting order_added with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_added', enrichedData);
    io.to(`table_${tableId}`).emit('order_added', enrichedData);
};

const notifyOrderDeleted = (io, orderId, tableId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, tableId, ...validData };
    console.log('Emitting order_deleted with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_deleted', enrichedData);
    io.to(`table_${tableId}`).emit('order_deleted', enrichedData);
};

const notifyOrderConfirmed = (io, orderId, tableId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, tableId, ...validData };
    console.log('Emitting order_confirmed with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_confirmed', enrichedData);
    io.to(`table_${tableId}`).emit('order_confirmed', enrichedData);
};

const notifyOrderDetailChanged = (io, orderId, action, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, action, ...validData };
    console.log('Emitting orderdetail_changed with data:', enrichedData);
    io.to(`order_${orderId}`).emit('orderdetail_changed', enrichedData);
};

const notifyOrderTotalUpdated = (io, orderId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { orderId, ...validData };
    console.log('Emitting order_total_updated with data:', enrichedData);
    io.to(`order_${orderId}`).emit('order_total_updated', enrichedData);
};

const notifyCartDetailsDeleted = (io, cartId, data) => {
    const validData = data && typeof data === 'object' && data !== null ? data : {};
    const enrichedData = { cartId, ...validData };
    console.log('Emitting cartdetails_deleted with data:', enrichedData);
    io.to(`cart_${cartId}`).emit('cartdetails_deleted', enrichedData);
};

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
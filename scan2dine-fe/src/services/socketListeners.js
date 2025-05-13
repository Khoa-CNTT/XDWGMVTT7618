import socket from './socket';
import debounce from 'lodash/debounce';

const registerSocketListeners = ({
    customer,
    TableUpdated,
    CartUpdated,
    OrderCreated,
    OrderUpdated,
    OrderDetailAdded,
    OrderDetailUpdated,
    OrderDetailDeleted,
    OrderDetailQuantityDecreased,
    OrderConfirmed,
    OrderAdded,
    OrderDeleted,
    CartAdded,
    CartDeleted,
    CartCreated,
    CartDetailAdded,
    CartDetailUpdated,
    CartDetailDeleted,
    CartDetailQuantityDecreased,
    CartDetailsDeleted,
}) => {
    console.log('Đăng ký socket listeners cho customer:', customer);

    // Debounce các callback để tránh xử lý quá nhiều sự kiện cùng lúc
    const debouncedTableUpdated = debounce((data) => TableUpdated && TableUpdated(data), 300);
    const debouncedCartUpdated = debounce((data) => CartUpdated && CartUpdated(data), 300);
    const debouncedOrderCreated = debounce((data) => OrderCreated && OrderCreated(data), 300);
    const debouncedOrderUpdated = debounce((data) => OrderUpdated && OrderUpdated(data), 300);
    const debouncedOrderConfirmed = debounce((data) => OrderConfirmed && OrderConfirmed(data), 300);
    const debouncedOrderAdded = debounce((data) => OrderAdded && OrderAdded(data), 300);
    const debouncedOrderDeleted = debounce((data) => OrderDeleted && OrderDeleted(data), 300);
    const debouncedCartAdded = debounce((data) => CartAdded && CartAdded(data), 300);
    const debouncedCartDeleted = debounce((data) => CartDeleted && CartDeleted(data), 300);
    const debouncedCartCreated = debounce((data) => CartCreated && CartCreated(data), 300);
    const debouncedCartDetailAdded = debounce((data) => CartDetailAdded && CartDetailAdded(data), 300);
    const debouncedCartDetailUpdated = debounce((data) => CartDetailUpdated && CartDetailUpdated(data), 300);
    const debouncedCartDetailDeleted = debounce((data) => CartDetailDeleted && CartDetailDeleted(data), 300);
    const debouncedCartDetailQuantityDecreased = debounce(
        (data) => CartDetailQuantityDecreased && CartDetailQuantityDecreased(data),
        300
    );
    const debouncedCartDetailsDeleted = debounce(
        (data) => CartDetailsDeleted && CartDetailsDeleted(data),
        300
    );

    // Hàm xử lý cho orderdetail_changed
    const handleOrderDetailChanged = (data) => {
        if (!data || typeof data !== 'object' || !data.orderId) {
            console.warn('Dữ liệu orderdetail_changed không hợp lệ:', data);
            return;
        }
        if (data.orderId !== customer?.orderId) return;

        console.log('Chi tiết đơn hàng đã thay đổi:', data);
        switch (data.action) {
            case 'added':
                if (OrderDetailAdded) OrderDetailAdded(data);
                break;
            case 'updated':
                if (OrderDetailUpdated) OrderDetailUpdated(data);
                break;
            case 'deleted':
                if (OrderDetailDeleted) OrderDetailDeleted(data);
                break;
            case 'quantity_decreased':
                if (OrderDetailQuantityDecreased) OrderDetailQuantityDecreased(data);
                break;
            default:
                console.log('Hành động không xác định:', data.action);
        }
    };

    const debouncedOrderDetailChanged = debounce(handleOrderDetailChanged, 300);

    // Kiểm tra kết nối hiện tại và tham gia rooms
const joinRooms = () => {
    if (!socket || !socket.connected) {
        console.warn('Socket chưa kết nối, không thể join room');
        return;
    }

    const rooms = [];

    if (customer?.cart) {
        const room = `cart_${customer.cart}`;
        socket.emit('join', room);
        console.log('✅ Đã tham gia room cart:', room);
        rooms.push(room);
    } else {
        console.warn('⚠️ Không tìm thấy customer.cart');
    }

    if (customer?.idTable) {
        const room = `table_${customer.idTable}`;
        socket.emit('join', room);
        console.log('✅ Đã tham gia room table:', room);
        rooms.push(room);
    } else {
        console.warn('⚠️ Không tìm thấy customer.idTable');
    }

    if (customer?.orderId) {
        const room = `order_${customer.orderId}`;
        socket.emit('join', room);
        console.log('✅ Đã tham gia room order:', room);
        rooms.push(room);
    } else {
        console.warn('⚠️ Không tìm thấy customer.orderId');
    }

    if (rooms.length === 0) {
        console.log('🟡 Không có room nào để tham gia');
    }
};

    if (socket.connected) {
        console.log('Đã kết nối trước đó:', socket.id, new Date().toISOString());
        joinRooms();
    }

    // Đăng ký sự kiện connect
    socket.on('connect', () => {
        console.log('Đã kết nối tới server socket:', socket.id, new Date().toISOString());
        joinRooms();
    });

    socket.on('connect_error', (error) => {
        console.error('Lỗi kết nối socket:', error.message);
    });

    // Lắng nghe các sự kiện
    socket.on('table_updated', (data) => {
        console.log('Dữ liệu nhận được từ sự kiện table_updated:', data);
        if (!data || typeof data !== 'object' || !data.tableId) {
            console.warn('Dữ liệu table_updated không hợp lệ:', data);
            return;
        }
        if (data.tableId === customer?.idTable) {
            console.log('Bàn đã được cập nhật:', data);
            debouncedTableUpdated(data);
        }
    });

    socket.on('cart_updated', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cart_updated không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Giỏ hàng đã cập nhật:', data);
            debouncedCartUpdated(data);
        }
    });

    socket.on('order_created', (data) => {
        console.log('Đơn hàng đã được tạo:', data);
        debouncedOrderCreated(data);
    });

    socket.on('order_updated', (data) => {
        if (!data || typeof data !== 'object' || !data.orderId) {
            console.warn('Dữ liệu order_updated không hợp lệ:', data);
            return;
        }
        if (data.orderId === customer?.orderId) {
            console.log('Đơn hàng đã được cập nhật:', data);
            debouncedOrderUpdated(data);
        }
    });

    socket.on('orderdetail_changed', (data) => {
        debouncedOrderDetailChanged(data);
    });

    socket.on('order_confirmed', (data) => {
        console.log('Dữ liệu nhận được từ sự kiện order_confirmed:', data);
        if (typeof data === 'object' && data !== null) {
            if (
                (data.orderId && data.orderId === customer?.orderId) ||
                (data.tableId && data.tableId === customer?.idTable)
            ) {
                console.log('Đơn hàng đã được xác nhận:', data);
                debouncedOrderConfirmed(data);
            }
        } else {
            console.error('Dữ liệu không phải là đối tượng hợp lệ:', data);
        }
    });

    socket.on('order_added', (data) => {
        if (typeof data === 'object' && data !== null) {
            if (
                (data.orderId && data.orderId === customer?.orderId) ||
                (data.tableId && data.tableId === customer?.idTable)
            ) {
                console.log('Đơn hàng đã được thêm:', data);
                debouncedOrderAdded(data);
            }
        } else {
            console.warn('Dữ liệu order_added không hợp lệ:', data);
        }
    });

    socket.on('order_deleted', (data) => {
        if (typeof data === 'object' && data !== null) {
            if (
                (data.orderId && data.orderId === customer?.orderId) ||
                (data.tableId && data.tableId === customer?.idTable)
            ) {
                console.log('Đơn hàng đã bị xóa:', data);
                debouncedOrderDeleted(data);
            }
        } else {
            console.warn('Dữ liệu order_deleted không hợp lệ:', data);
        }
    });

    socket.on('cart_added', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cart_added không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Giỏ hàng đã được thêm:', data);
            debouncedCartAdded(data);
        }
    });

    socket.on('cart_deleted', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cart_deleted không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Giỏ hàng đã bị xóa:', data);
            debouncedCartDeleted(data);
        }
    });

    socket.on('cart_created', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cart_created không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Giỏ hàng đã được tạo:', data);
            debouncedCartCreated(data);
        }
    });

    socket.on('cartdetail_added', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cartdetail_added không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Chi tiết giỏ hàng đã được thêm:', data);
            debouncedCartDetailAdded(data);
        }
    });

    socket.on('cartdetail_updated', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cartdetail_updated không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Chi tiết giỏ hàng đã được cập nhật:', data);
            debouncedCartDetailUpdated(data);
        }
    });

    socket.on('cartdetail_deleted', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cartdetail_deleted không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Chi tiết giỏ hàng đã bị xóa:', data);
            debouncedCartDetailDeleted(data);
        }
    });

    socket.on('cartdetail_quantity_decreased', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cartdetail_quantity_decreased không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Số lượng chi tiết giỏ hàng đã giảm:', data);
            debouncedCartDetailQuantityDecreased(data);
        }
    });

    socket.on('cartdetails_deleted', (data) => {
        if (!data || typeof data !== 'object' || !data.cartId) {
            console.warn('Dữ liệu cartdetails_deleted không hợp lệ:', data);
            return;
        }
        if (data.cartId === customer?.cart) {
            console.log('Nhiều chi tiết giỏ hàng đã bị xóa:', data);
            debouncedCartDetailsDeleted(data);
        }
    });
};

const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('table_updated');
    socket.off('cart_updated');
    socket.off('order_created');
    socket.off('order_updated');
    socket.off('orderdetail_changed');
    socket.off('order_confirmed');
    socket.off('order_added');
    socket.off('order_deleted');
    socket.off('cart_added');
    socket.off('cart_deleted');
    socket.off('cart_created');
    socket.off('cartdetail_added');
    socket.off('cartdetail_updated');
    socket.off('cartdetail_deleted');
    socket.off('cartdetail_quantity_decreased');
    socket.off('cartdetails_deleted');
};

export { registerSocketListeners, cleanupSocketListeners };
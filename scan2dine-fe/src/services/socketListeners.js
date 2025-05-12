import socket from './socket';
import debounce from 'lodash/debounce';

const registerSocketListeners = (customer, eventCallbacks) => {
    console.log('Đăng ký socket listeners cho customer:', customer);

    // Debounce các callback để tránh xử lý quá nhiều sự kiện cùng lúc
    const debounceEvents = (events) => {
        return Object.fromEntries(
            Object.entries(events).map(([key, callback]) => [
                key, debounce((data) => callback && callback(data), 300)
            ])
        );
    };

    const debouncedEvents = debounceEvents(eventCallbacks);

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
                debouncedEvents.OrderDetailAdded(data);
                break;
            case 'updated':
                debouncedEvents.OrderDetailUpdated(data);
                break;
            case 'deleted':
                debouncedEvents.OrderDetailDeleted(data);
                break;
            case 'quantity_decreased':
                debouncedEvents.OrderDetailQuantityDecreased(data);
                break;
            default:
                console.log('Hành động không xác định:', data.action);
        }
    };

    const debouncedOrderDetailChanged = debounce(handleOrderDetailChanged, 300);

    // Kiểm tra kết nối hiện tại và tham gia rooms
    const joinRooms = () => {
        const rooms = [
            customer?.cart && `cart_${customer.cart}`,
            customer?.idTable && `table_${customer.idTable}`,
            customer?.orderId && `order_${customer.orderId}`
        ].filter(Boolean);

        rooms.forEach(room => {
            socket.emit('join', room);
            console.log(`Đã tham gia room ${room}:`, new Date().toISOString());
        });
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
    const eventMap = [
        { event: 'table_updated', callback: debouncedEvents.TableUpdated, roomKey: 'idTable' },
        { event: 'cart_updated', callback: debouncedEvents.CartUpdated, roomKey: 'cart' },
        { event: 'order_created', callback: debouncedEvents.OrderCreated },
        { event: 'order_updated', callback: debouncedEvents.OrderUpdated, roomKey: 'orderId' },
        { event: 'orderdetail_changed', callback: debouncedOrderDetailChanged },
        { event: 'order_confirmed', callback: debouncedEvents.OrderConfirmed },
        { event: 'order_added', callback: debouncedEvents.OrderAdded },
        { event: 'order_deleted', callback: debouncedEvents.OrderDeleted },
        { event: 'cart_added', callback: debouncedEvents.CartAdded, roomKey: 'cart' },
        { event: 'cart_deleted', callback: debouncedEvents.CartDeleted, roomKey: 'cart' },
        { event: 'cart_created', callback: debouncedEvents.CartCreated, roomKey: 'cart' },
        { event: 'cartdetail_added', callback: debouncedEvents.CartDetailAdded, roomKey: 'cart' },
        { event: 'cartdetail_updated', callback: debouncedEvents.CartDetailUpdated, roomKey: 'cart' },
        { event: 'cartdetail_deleted', callback: debouncedEvents.CartDetailDeleted, roomKey: 'cart' },
        { event: 'cartdetail_quantity_decreased', callback: debouncedEvents.CartDetailQuantityDecreased, roomKey: 'cart' },
        { event: 'cartdetails_deleted', callback: debouncedEvents.CartDetailsDeleted, roomKey: 'cart' }
    ];

    eventMap.forEach(({ event, callback, roomKey }) => {
        socket.on(event, (data) => {
            if (roomKey && customer[roomKey] && data[roomKey] === customer[roomKey]) {
                console.log(`${event} dữ liệu nhận được:`, data);
                callback(data);
            } else if (!roomKey) {
                console.log(`${event} dữ liệu nhận được:`, data);
                callback(data);
            }
        });
    });
};

const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('connect_error');
    // Dừng tất cả các sự kiện đã đăng ký
    const eventNames = [
        'table_updated', 'cart_updated', 'order_created', 'order_updated', 'orderdetail_changed',
        'order_confirmed', 'order_added', 'order_deleted', 'cart_added', 'cart_deleted', 'cart_created',
        'cartdetail_added', 'cartdetail_updated', 'cartdetail_deleted', 'cartdetail_quantity_decreased',
        'cartdetails_deleted'
    ];
    eventNames.forEach(event => socket.off(event));
};

export { registerSocketListeners, cleanupSocketListeners };

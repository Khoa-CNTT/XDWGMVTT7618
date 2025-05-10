// import socket from './socket';
// // Hàm đăng ký các lắng nghe socket

// const registerSocketListeners = ({
//     customer,
//     // cập nhật bàn
//     TableUpdated,
//     // cập nhật giỏ hàng
//     CartUpdated,
//     //cập nhật đơn hàng tạo mới 
//     OrderCreated,
//     // cập nhạta lại đơn hàng 
//     OrderUpdated,

// }) => {
//     console.log('Đăng ký socket listeners cho customer:', customer?.cart);
//     // Lắng nghe kết nối socket
//     socket.on('connect_error', (error) => {
//         console.error('Lỗi kết nối socket:', error.message);
//     });
//     socket.on('connect', () => {
//         console.log('Đã kết nối tới server socket:', socket.id, new Date().toISOString());
//     });

//     // lắng nghe cập nhật bàn 
//     socket.on("table_updated", (data) =>{
//         if(data.tableId === customer.idTable){
//             console.log('Bàn đã được cập nhật:', data);
//             TableUpdated(data);
//         };
//     });
//     // lắng nghe cập nhật giỏ hàng 
//     socket.on("cart_updated", (data) =>{
//         if(data.cartId === customer.cart){
//             console.log('Giỏ hàng đã cập nhật:', data);
//             CartUpdated(data);
//         };
//     })
//     // lắng nghe tạo đơn hàng mới
//     socket.on('order_created', (orderData)=>{
//         console.log('Đơn hàng đã được tạo:', orderData);
//         OrderCreated(orderData);
//     })
//     // lắng nghe cập nhật đơn hàng 
//     socket.on('order_updated', (orderData) => {
//         console.log('Đơn hàng đã được cập nhật:', orderData);
//         OrderUpdated(orderData);
//     })
// }; 

// // Hàm dọn dẹp tất cả các lắng nghe socket
// const cleanupSocketListeners = () =>{
//     socket.off('connect');
//     socket.off('table_updated');
//     socket.off('cart_updated');
//     socket.off('order_created');
//     socket.off('order_updated');
// };


// export { registerSocketListeners, cleanupSocketListeners };

import socket from './socket';

const registerSocketListeners = ({
    customer,
    TableUpdated,
    CartUpdated,
    OrderCreated,
    OrderUpdated,
}) => {
    console.log('Đăng ký socket listeners cho customer:', customer?.cart);

    // Kiểm tra trạng thái kết nối hiện tại
    if (socket.connected) {
        console.log('Đã kết nối trước đó:', socket.id, new Date().toISOString());
        // Tham gia các room ngay lập tức nếu đã kết nối
        if (customer?.cart) {
            socket.emit('join', `cart_${customer.cart}`);
            console.log('Đã tham gia room cart:', `cart_${customer.cart}`);
        }
        if (customer?.idTable) {
            socket.emit('join', `table_${customer.idTable}`);
            console.log('Đã tham gia room table:', `table_${customer.idTable}`);
        }
    }

    // Đăng ký sự kiện connect
    socket.on('test_connect', (data) => {
    console.log('Nhận được test_connect:', data);
});
    socket.on('connect', () => {
        console.log('Đã kết nối tới server socket:', socket.id, new Date().toISOString());
        // Tham gia các room khi kết nối
        if (customer?.cart) {
            socket.emit('join', `cart_${customer.cart}`);
            console.log('Đã tham gia room cart:', `cart_${customer.cart}`);
        }
        if (customer?.idTable) {
            socket.emit('join', `table_${customer.idTable}`);
            console.log('Đã tham gia room table:', `table_${customer.idTable}`);
        }
    });

    socket.on('connect_error', (error) => {
        console.error('Lỗi kết nối socket:', error.message);
    });

    // Lắng nghe các sự kiện
    socket.on('table_updated', (data) => {
        if (data.tableId === customer.idTable) {
            console.log('Bàn đã được cập nhật:', data);
            TableUpdated(data);
        }
    });
    socket.on('cart_updated', (data) => {
        if (data.cartId === customer.cart) {
            console.log('Giỏ hàng đã cập nhật:', data);
            CartUpdated(data);
        }
    });
    socket.on('order_created', (orderData) => {
        console.log('Đơn hàng đã được tạo:', orderData);
        OrderCreated(orderData);
    });
    socket.on('order_updated', (orderData) => {
        console.log('Đơn hàng đã được cập nhật:', orderData);
        OrderUpdated(orderData);
    });
};

const cleanupSocketListeners = () => {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('table_updated');
    socket.off('cart_updated');
    socket.off('order_created');
    socket.off('order_updated');
};

export { registerSocketListeners, cleanupSocketListeners };
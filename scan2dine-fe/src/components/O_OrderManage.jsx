import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import api from '../server/api';

const statusMap = {
    '2': { label: "Đã xác nhận", color: "text-blue-600" },
    '3': { label: "Đang chuẩn bị", color: "text-orange-500" },
    '4': { label: "Đã hoàn thành", color: "text-green-600" },
    completed: { label: "Đã hoàn thành", color: "text-blue-600" },
    processing: { label: "Đang chế biến", color: "text-orange-500" },
};

const O_OrderManage = ({ stallId }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (stallId) fetchOrders();
    }, [stallId]);

    const fetchOrders = async () => {
        try {
            // Gọi API backend lấy danh sách đơn hàng theo stallId
            const response = await api.get(`/s2d/foodstall/orderstall/${stallId}`);
            console.log("API data:", response.data);
            // Lọc các đơn hàng đã được nhân viên xác nhận (ví dụ: order_status === 'processing')
            const confirmedOrders = Array.isArray(response.data)
                ? response.data.filter(order => order.order_status === '2')
                : [];
            setOrders(confirmedOrders);
            setSelectedOrder(confirmedOrders.length > 0 ? confirmedOrders[0] : null);
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        }
    };

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString() + 'đ';
    };

    const renderStatusBadge = (status) => {
        const map = statusMap[status] || { label: status, color: "text-gray-500" };
        return <span className={`font-semibold ${map.color}`}>{map.label}</span>;
    };
    // Merge duplicate items by product_name and price
    const mergeOrderDetails = (orderdetail) => {
        const merged = [];
        const map = {};
        orderdetail.forEach(item => {
            const key = item.product_name + '_' + item.price;
            if (!map[key]) {
                map[key] = { ...item };
            } else {
                map[key].quantity += item.quantity;
            }
        });
        return Object.values(map);
    };

    // Use merged items for total calculation
    const getTotal = (items) => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const updateOrderItemStatus = async (orderdetailId, newStatus) => {
        try {
            await api.patch(`/s2d/orderdetails/newStatus/${orderdetailId}`, {
                status: newStatus
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating item status:', error);
        }
    };

    // Use merged items for completion check
    const allItemsCompleted = selectedOrder
        ? mergeOrderDetails(selectedOrder.orderdetail).every(item => item.status === 'completed')
        : false;

    const confirmOrderCompleted = async (orderId) => {
        try {
            await api.patch(`/s2d/orders/${orderId}`, {
                od_status: '4'
            });
            fetchOrders();
        } catch (error) {
            console.error('Error confirming order status:', error);
        }
    };

    const filteredOrders = orders.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateTime = (dateString) => {
        let date;
        if (!dateString) {
            date = new Date(); // Use current time if missing
        } else {
            date = new Date(dateString);
            if (isNaN(date.getTime())) date = new Date(); // Use current time if invalid
        }
        // Format: dd - mm - yyyy hh:mm
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours} : ${minutes} - ${day}/${month}/${year} `;
    };

    return (
        <div className="flex gap-6 bg-white p-6">
            {/* Sidebar Order List */}
            <div className="w-1/3">
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <div className="space-y-2">
                    {filteredOrders.map((order) => (
                        <div
                            key={order.order_id}
                            onClick={() => setSelectedOrder(order)}
                            className={`p-3 border rounded-lg cursor-pointer ${selectedOrder?.order_id === order.order_id ? 'bg-red-100 border-red-400' : 'hover:bg-gray-100'}`}
                        >
                            <div>Đơn #{order.order_id.slice(-6)}</div>
                            <div className="text-sm text-gray-500">Bàn: {order.table_number}</div>
                            <div className="text-sm">{renderStatusBadge(order.order_status)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Order Detail */}
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                {selectedOrder ? (
                    <>
                        <div className="text-center mb-4 text-xl font-bold text-red-600 uppercase">Tất cả đơn hàng</div>

                        <div className="flex justify-between mb-2 text-sm">
                            <div>
                                <div>Đơn hàng: <span className="text-red-600 font-semibold">#{selectedOrder.order_id}</span></div>
                                <div>Giờ bắt đầu: {formatDateTime(selectedOrder.start_time)}</div>
                            </div>
                            <div className="text-right">
                                <div>Nhân viên:{selectedOrder.staff?.full_name || selectedOrder.staff_name || "--"}</div>
                                <div>Giờ kết thúc:</div>
                            </div>
                        </div>

                        <hr className="my-2" />

                        <div className="text-center font-bold text-lg mb-4 uppercase">Bàn {selectedOrder.table_number}</div>

                        <div className="space-y-4">
                            {mergeOrderDetails(selectedOrder.orderdetail).map((item, idx) => (
                                <div key={idx} className="flex gap-4 bg-white rounded-lg p-4 items-start shadow-sm">
                                    <img
                                        src={item.products?.image || ""}
                                        alt={item.products?.pd_name || ""}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold">{item.product_name}</div>
                                                <div className="text-sm text-gray-600">Ghi chú: {item.note || "Không có"}</div>
                                            </div>
                                            {item.status === "completed" ? (
                                                <div className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded font-medium">
                                                    Đã hoàn thành
                                                </div>
                                            ) : item.status === "confirmed" ? (
                                                <button
                                                    disabled
                                                    className="ml-2 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded cursor-default"
                                                >
                                                    Đã xác nhận
                                                </button>
                                            ) : (
                                                <select
                                                    value={item.status}
                                                    onChange={(e) => updateOrderItemStatus(item._id, e.target.value)}
                                                    className="ml-2 px-2 py-1 text-sm border rounded bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <option value="preparing">Đang chuẩn bị</option>
                                                    <option value="completed">Đã hoàn thành</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-sm text-gray-700">x{item.quantity}</div>
                                            <div className="font-semibold text-red-600">{formatPrice(item.price)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>



                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {allItemsCompleted && selectedOrder?.order_status !== '4' && (
                                <button
                                    onClick={() => confirmOrderCompleted(selectedOrder.order_id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    Hoàn thành đơn hàng
                                </button>
                            )}
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Sửa đơn</button>
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Xem hóa đơn</button>
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Xuất PDF</button>
                            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Đánh giá</button>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-500">Chọn đơn hàng để xem chi tiết</div>
                )}
            </div>

        </div>
    );
};

export default O_OrderManage;
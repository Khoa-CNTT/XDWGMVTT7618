import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import api from '../server/api';
import axios from 'axios';


const statusMap = {
    '1': { label: "Chờ xác nhận", color: "text-gray-600" },
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

    // const fetchOrders = async () => {
    //     try {
    //         const prevSelectedOrderId = selectedOrder?.order_id;
    //         const response = await api.get(`/s2d/foodstall/orderstall/${stallId}`);
    //         const confirmedOrders = Array.isArray(response.data)
    //             ? response.data.filter(order => ['2'].includes(order.order_status))
    //             : [];
    //         setOrders(confirmedOrders);
    //         setSelectedOrder(confirmedOrders.length > 0 ? confirmedOrders[0] : null);
    //         if (confirmedOrders.length > 0) {
    //             const found = confirmedOrders.find(order => order.order_id === prevSelectedOrderId);
    //             setSelectedOrder(found || confirmedOrders[0]);
    //             if ((found || confirmedOrders[0]).orderdetail) {
    //                 console.log("DEBUG orderdetail:", (found || confirmedOrders[0]).orderdetail);
    //             }
    //         } else {
    //             setSelectedOrder(null);
    //         }
    //     } catch (error) {
    //         console.error('Lỗi khi tải đơn hàng:', error);
    //     }
    // };

    const fetchOrders = async () => {
        try {
            const prevSelectedOrderId = selectedOrder?.order_id;
            const response = await api.get(`/s2d/foodstall/orderstall/${stallId}`);
            let confirmedOrders = Array.isArray(response.data)
                ? response.data.filter(order => ['2'].includes(order.order_status))
                : [];

            // Update order_status based on orderdetail statuses
            confirmedOrders = confirmedOrders.map(order => {
                if (Array.isArray(order.orderdetail) && order.orderdetail.length > 0) {
                    const allCompleted = order.orderdetail.every(item => item.status === '4' || item.status === 'completed');
                    const anyPreparing = order.orderdetail.some(item => item.status === '3');
                    if (allCompleted) {
                        return { ...order, order_status: '4' };
                    } else if (anyPreparing) {
                        return { ...order, order_status: '3' };
                    }
                }
                return order;
            });

            setOrders(confirmedOrders);
            if (confirmedOrders.length > 0) {
                const found = confirmedOrders.find(order => order.order_id === prevSelectedOrderId);
                setSelectedOrder(found || confirmedOrders[0]);
                if ((found || confirmedOrders[0]).orderdetail) {
                    console.log("DEBUG orderdetail:", (found || confirmedOrders[0]).orderdetail);
                }
            } else {
                setSelectedOrder(null);
            }
        } catch (error) {
            console.error('Lỗi khi tải đơn hàng:', error);
        }
    };

    const formatPrice = (price) => parseInt(price).toLocaleString() + 'đ';

    const renderStatusBadge = (status) => {
        const map = statusMap[status] || { label: status, color: "text-gray-500" };
        return <span className={`font-semibold ${map.color}`}>{map.label}</span>;
    };

    const getTotal = (items) => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const updateOrderItemStatus = async (orderdetailId, newStatus, orderId) => {
        try {
            if (!orderdetailId || !orderId) {
                console.error("❌ ID is undefined");
                return;
            }

            if (newStatus === '3') {
                // Đang chuẩn bị
                await api.patch(`/s2d/orderdetail/confirm/prepare/${orderdetailId}`, {
                    order: orderId,
                });
            } else if (newStatus === '4') {
                // Đã hoàn thành - gọi đúng API như backend bạn gửi
                await api.patch(`/s2d/orderdetail/confirm/complete/${orderdetailId}`, {
                    order: orderId,
                });
            } else {
                // Các trạng thái khác (nếu có)
                await api.patch(`/s2d/orderdetail/newStatus/${orderdetailId}`, {
                    status: newStatus
                });
            }

            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error.response?.data || error.message);
        }
    };
    
    const filteredOrders = orders.filter(order =>
        order.order_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    

    const formatDateTime = (dateString) => {
        let date;
        if (!dateString) {
            date = new Date();
        } else {
            date = new Date(dateString);
            if (isNaN(date.getTime())) date = new Date();
        }
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours} : ${minutes} - ${day}/${month}/${year}`;
    };

    return (
        <div className="flex gap-6 bg-white p-6">
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
                            {selectedOrder.orderdetail.map((item, idx) => {
                                // Try to get the ID from possible fields
                                const itemId = item.orderdetail || item._id || item.id || item.orderdetail;

                                return (
                                    <div key={itemId || idx} className="flex gap-4 bg-white rounded-lg p-4 items-start shadow-sm">
                                        {item.image ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}/${item.image}`}
                                                alt={item.product_name || "Sản phẩm"}
                                                className="w-20 h-20 object-cover rounded-md"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "";
                                                    e.target.parentNode.innerHTML = '<div class="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">No Image</div>';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                                                No Image
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-semibold">{item.product_name}</div>
                                                    <div className="text-sm text-gray-600">Ghi chú: {item.note || "Không có"}</div>
                                                    {/* Show ID for debugging */}
                                                </div>
                                                {item.status === '2' ? (
                                                    <button
                                                        onClick={() => {
                                                            if (itemId) {
                                                                updateOrderItemStatus(itemId, '3', selectedOrder.order_id);
                                                            } else {
                                                                alert("Không tìm thấy ID của món ăn này!");
                                                            }
                                                        }}
                                                        className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                                    // disabled={!itemId}
                                                    >
                                                        Đã xác nhận
                                                    </button>
                                                ) : item.status === '3' ? (
                                                    <button
                                                        onClick={() => {
                                                            if (itemId) {
                                                                updateOrderItemStatus(itemId, '4', selectedOrder.order_id);
                                                            } else {
                                                                alert("Không tìm thấy ID của món ăn này!");
                                                            }
                                                        }}
                                                        className="ml-2 px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                                                        disabled={!itemId}
                                                    >
                                                        Đang chuẩn bị
                                                    </button>
                                                ) : item.status === '4' || item.status === 'completed' ? (
                                                    <div className="ml-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
                                                        Đã hoàn thành
                                                    </div>
                                                ) : (
                                                    <div className="ml-2 px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded">
                                                        Không xác định
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center mt-2">
                                                <div className="text-sm text-gray-700">x{item.quantity}</div>
                                                <div className="font-semibold text-red-600">{formatPrice(item.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex justify-end mt-6">
                            <div className="text-lg font-bold text-gray-700">
                                Tổng tiền ({selectedOrder.orderdetail.length} món):&nbsp;
                                <span className="text-red-600">
                                    {formatPrice(getTotal(selectedOrder.orderdetail))}
                                </span>
                            </div>
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

import React, { useState, useEffect } from 'react';
import { MdAccessAlarms, MdRestaurant } from "react-icons/md";
import { GoVerified } from "react-icons/go";
import { FaSearch } from 'react-icons/fa';
import api from '../server/api';

const O_OrderManage = ({ stallId }) => {
    const [activeTab, setActiveTab] = useState('processing');
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, [activeTab, stallId]);

    const fetchOrders = async () => {
        try {
            const response = await api.get(`/s2d/orders/stall/${stallId}`, {
                params: { status: activeTab }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const updateOrderItemStatus = async (orderId, itemId, newStatus) => {
        try {
            await api.patch(`/s2d/orders/${orderId}/items/${itemId}`, {
                status: newStatus
            });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order item:', error);
        }
    };

    const completeOrder = async (orderId) => {
        try {
            await api.patch(`/s2d/orders/${orderId}`, {
                status: 'completed'
            });
            fetchOrders();
            setSelectedOrder(null);
        } catch (error) {
            console.error('Error completing order:', error);
        }
    };

    return (
        <div className="flex-1 bg-white p-6">
            <h2 className="text-3xl font-bold text-primary text-center mb-8">QUẢN LÝ ĐƠN HÀNG</h2>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6">
                <button
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 ${activeTab === 'processing' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('processing')}
                >
                    <MdAccessAlarms /> Đang chế biến
                </button>
                <button
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 ${activeTab === 'completed' ? 'bg-primary text-white' : 'bg-gray-200'}`}
                    onClick={() => setActiveTab('completed')}
                >
                    <GoVerified /> Hoàn thành
                </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
            </div>

            <div className="flex gap-6">
                {/* Orders List */}
                <div className="w-1/3 bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Danh sách đơn hàng</h3>
                    <div className="space-y-3">
                        {orders.map(order => (
                            <div
                                key={order._id}
                                className={`p-4 rounded-lg cursor-pointer ${selectedOrder?._id === order._id ? 'bg-primary text-white' : 'bg-white'}`}
                                onClick={() => setSelectedOrder(order)}
                            >
                                <div className="font-semibold">Đơn #{order.orderNumber}</div>
                                <div className="text-sm">Bàn: {order.table}</div>
                                <div className="text-sm">Thời gian: {new Date(order.createdAt).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Details */}
                {selectedOrder && (
                    <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-4">Chi tiết đơn hàng #{selectedOrder.orderNumber}</h3>
                        <div className="space-y-4">
                            {selectedOrder.items.map(item => (
                                <div key={item._id} className="bg-white p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">{item.product.name}</div>
                                        <div className="text-sm text-gray-600">Số lượng: {item.quantity}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={item.status}
                                            onChange={(e) => updateOrderItemStatus(selectedOrder._id, item._id, e.target.value)}
                                            className="p-2 rounded border"
                                        >
                                            <option value="processing">Đang chế biến</option>
                                            <option value="completed">Hoàn thành</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {activeTab === 'processing' && (
                            <button
                                onClick={() => completeOrder(selectedOrder._id)}
                                className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-red-600"
                            >
                                Xác nhận hoàn thành đơn hàng
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default O_OrderManage;
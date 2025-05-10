import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const statusMap = {
    '2': { label: 'Đã xác nhận', color: 'text-blue-600' },
    '3': { label: 'Đang chuẩn bị', color: 'text-orange-500' },
    '4': { label: 'Đã hoàn thành', color: 'text-green-600' },
    completed: { label: 'Đã hoàn thành', color: 'text-blue-600' },
    processing: { label: 'Đang chế biến', color: 'text-orange-500' },
};

const O_OrderManage = ({ stallId }) => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch orders with debounce
    const fetchOrders = useCallback(
        debounce(async () => {
            if (!stallId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await api.get(`/s2d/foodstall/orderstall/${stallId}`);
                const confirmedOrders = Array.isArray(response.data)
                    ? response.data.filter((order) => order.order_status === '2')
                    : [];
                setOrders(confirmedOrders);
                setSelectedOrder(confirmedOrders.length > 0 ? confirmedOrders[0] : null);
            } catch (error) {
                console.error('Lỗi khi tải đơn hàng:', error);
                setError('Không thể tải danh sách đơn hàng');
                toast.error('Không thể tải danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        }, 500),
        [stallId]
    );

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Socket listeners
    // useEffect(() => {
    //     if (!stallId) return;

    //     registerSocketListeners({
    //         customer: { stallId },
    //         OrderCreated: () => {
    //             fetchOrders();
    //             toast.info('Đơn hàng mới được tạo, danh sách đã được cập nhật!');
    //         },
    //         OrderUpdated: (data) => {
    //             fetchOrders();
    //             toast.info('Đơn hàng đã được cập nhật, danh sách đã được cập nhật!');
    //         },
    //         OrderDeleted: () => {
    //             fetchOrders();
    //             toast.info('Đơn hàng đã bị xóa, danh sách đã được cập nhật!');
    //         },
    //         OrderDetailChanged: () => {
    //             fetchOrders();
    //             toast.info('Chi tiết đơn hàng đã thay đổi, danh sách đã được cập nhật!');
    //         },
    //     });

    //     return () => {
    //         cleanupSocketListeners();
    //     };
    // }, [fetchOrders, stallId]);
// O_OrderManage.js (đoạn liên quan đến socket)
useEffect(() => {
    if (!stallId) return;

    registerSocketListeners({
        customer: { stallId },
        OrderCreated: () => {
            fetchOrders();
            toast.info('Đơn hàng mới được tạo, danh sách đã được cập nhật!');
        },
        OrderUpdated: (data) => {
            fetchOrders();
            toast.info('Đơn hàng đã được cập nhật, danh sách đã được cập nhật!');
        },
        OrderDeleted: () => {
            fetchOrders();
            toast.info('Đơn hàng đã bị xóa, danh sách đã được cập nhật!');
        },
        OrderDetailChanged: () => {
            fetchOrders();
            toast.info('Chi tiết đơn hàng đã thay đổi, danh sách đã được cập nhật!');
        },
    });

    return () => {
        cleanupSocketListeners();
    };
}, [fetchOrders, stallId]);
    // Format price
    const formatPrice = useCallback((price) => {
        return parseInt(price).toLocaleString() + 'đ';
    }, []);

    // Render status badge
    const renderStatusBadge = useCallback((status) => {
        const map = statusMap[status] || { label: status, color: 'text-gray-500' };
        return <span className={`font-semibold ${map.color}`}>{map.label}</span>;
    }, []);

    // Merge duplicate items
    const mergeOrderDetails = useCallback((orderdetail) => {
        const merged = [];
        const map = {};
        orderdetail.forEach((item) => {
            const key = item.product_name + '_' + item.price;
            if (!map[key]) {
                map[key] = { ...item };
            } else {
                map[key].quantity += item.quantity;
            }
        });
        return Object.values(map);
    }, []);

    // Calculate total
    const getTotal = useCallback((items) => {
        return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, []);

    // Update order item status
    const updateOrderItemStatus = useCallback(async (orderdetailId, newStatus) => {
        try {
            setLoading(true);
            await api.patch(`/s2d/orderdetails/newStatus/${orderdetailId}`, { status: newStatus });
            fetchOrders();
            toast.success('Cập nhật trạng thái món thành công!');
        } catch (error) {
            console.error('Error updating item status:', error);
            toast.error('Cập nhật trạng thái món thất bại!');
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    // Check if all items are completed
    const allItemsCompleted = useMemo(() => {
        return selectedOrder
            ? mergeOrderDetails(selectedOrder.orderdetail).every((item) => item.status === 'completed')
            : false;
    }, [selectedOrder, mergeOrderDetails]);

    // Confirm order completion
    const confirmOrderCompleted = useCallback(async (orderId) => {
        try {
            setLoading(true);
            await api.patch(`/s2d/orders/${orderId}`, { od_status: '4' });
            fetchOrders();
            toast.success('Đơn hàng đã được hoàn thành!');
        } catch (error) {
            console.error('Error confirming order status:', error);
            toast.error('Không thể hoàn thành đơn hàng!');
        } finally {
            setLoading(false);
        }
    }, [fetchOrders]);

    // Export order to PDF
    const exportOrderToPDF = useCallback(() => {
        if (!selectedOrder) return;

        try {
            const doc = new jsPDF();
            doc.text(`Hóa đơn đơn hàng #${selectedOrder.order_id}`, 20, 10);
            doc.autoTable({
                head: [['Tên món', 'Số lượng', 'Giá (VND)', 'Ghi chú', 'Trạng thái']],
                body: mergeOrderDetails(selectedOrder.orderdetail).map((item) => [
                    item.product_name,
                    item.quantity,
                    item.price.toLocaleString(),
                    item.note || 'Không có',
                    statusMap[item.status]?.label || item.status,
                ]),
                startY: 20,
            });
            doc.text(`Tổng cộng: ${getTotal(mergeOrderDetails(selectedOrder.orderdetail)).toLocaleString()}đ`, 20, doc.lastAutoTable.finalY + 10);
            doc.save(`HoaDon_${selectedOrder.order_id}_${new Date().toISOString()}.pdf`);
            toast.success('Xuất PDF thành công!');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            toast.error('Xuất PDF thất bại!');
        }
    }, [selectedOrder, mergeOrderDetails, getTotal]);

    // Filter orders
    const filteredOrders = useMemo(() => {
        return orders.filter((order) =>
            order.order_id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);

    // Format date time
    const formatDateTime = useCallback((dateString) => {
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
    }, []);

    return (
        <div className="flex gap-6 bg-white p-6">
            {/* Sidebar Order List */}
            <div className="w-1/3">
                <div className="mb-4 relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                {loading ? (
                    <div className="text-center p-4 text-gray-500 animate-pulse">Đang tải...</div>
                ) : error ? (
                    <div className="text-center p-4 text-red-500">{error}</div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">Không có đơn hàng nào.</div>
                ) : (
                    <div className="space-y-2">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.order_id}
                                onClick={() => setSelectedOrder(order)}
                                className={`p-3 border rounded-lg cursor-pointer ${
                                    selectedOrder?.order_id === order.order_id
                                        ? 'bg-red-100 border-red-400'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <div>Đơn #{order.order_id.slice(-6)}</div>
                                <div className="text-sm text-gray-500">Bàn: {order.table_number}</div>
                                <div className="text-sm">{renderStatusBadge(order.order_status)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Detail */}
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                {selectedOrder ? (
                    <>
                        <div className="text-center mb-4 text-xl font-bold text-red-600 uppercase">
                            Tất cả đơn hàng
                        </div>

                        <div className="flex justify-between mb-2 text-sm">
                            <div>
                                <div>
                                    Đơn hàng:{' '}
                                    <span className="text-red-600 font-semibold">
                                        #{selectedOrder.order_id}
                                    </span>
                                </div>
                                <div>Giờ bắt đầu: {formatDateTime(selectedOrder.start_time)}</div>
                            </div>
                            <div className="text-right">
                                <div>
                                    Nhân viên:{' '}
                                    {selectedOrder.staff?.full_name || selectedOrder.staff_name || '--'}
                                </div>
                                <div>
                                    Giờ kết thúc:{' '}
                                    {selectedOrder.end_time
                                        ? formatDateTime(selectedOrder.end_time)
                                        : '--'}
                                </div>
                            </div>
                        </div>

                        <hr className="my-2" />

                        <div className="text-center font-bold text-lg mb-4 uppercase">
                            Bàn {selectedOrder.table_number}
                        </div>

                        <div className="space-y-4">
                            {mergeOrderDetails(selectedOrder.orderdetail).map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex gap-4 bg-white rounded-lg p-4 items-start shadow-sm"
                                >
                                    <img
                                        src={
                                            item.products?.image
                                                ? `${process.env.REACT_APP_API_URL}/${item.products.image}`
                                                : ''
                                        }
                                        alt={item.products?.pd_name || ''}
                                        className="w-20 h-20 object-cover rounded-md"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML = `<div class="w-20 h-20 flex items-center justify-center text-gray-400"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M352 144c0-44.1 35.9-80 80-80s80 35.9 80 80-35.9 80-80 80-80-35.9-80-80zm128 237.8c0 11-9 20.2-20 20.2h-28c17.9-26.4 28-60.5 28-96 0-19.1-3.2-38.2-9.5-56.7C439.7 255.8 448 237.6 448 216.9c0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 11.7 3.2 22.8 8.4 32.4-19.9-5-41.1-7.4-63.4-7.4-0.5 0-1 0.1-1.6 0.1 0.7-5.3 1.6-10.7 1.6-16 0-44.1-35.9-80-80-80s80 35.9-80 80c0 5.3 0.9 10.7 1.6 16-0.5 0-1-0.1-1.6-0.1-22.3 0-43.5 2.5-63.4 7.4 5.3-9.7 8.4-20.7 8.4-32.4 0-30.4-21.9-55.3-48-55.3s-48 24.9-48 55.3c0 20.7 8.3 38.9 21.5 52.4C3.2 218.6 0 237.7 0 256.9c0 35.5 10.1 69.6 28 96H0c-11 0-20 9.2-20 20.2-0.1 11.5 9.1 20.8 19.9 20.8h346c0.1 0.2 0.3 0.2 0.4 0.4 5.7 9.9 12.9 18.8 22.9 18.8h88c11 0 20-9.2 20-20.2V381.8h2.8zM240 71.9c22.1 0 40 17.9 40 40s-17.9 40-40 40-40-17.9-40-40 17.9-40 40-40zm-128 168c18 0 34.7-9 42.4-23.3 14.7-6 49.1-20.1 85.6-20.1s70.9 14.1 85.6 20.1c7.7 14.4 24.4 23.3 42.4 23.3 26.5 0 48-20.6 48-45.9s-21.5-45.9-48-45.9-48 20.6-48 45.9c0 4.9 0.8 9.5 2.1 13.9-20.3-9-46.4-17.9-82.1-17.9-35.7 0-61.9 8.9-82.1 17.9 1.3-4.4 2.1-9 2.1-13.9 0-25.2-21.5-45.9-48-45.9s-48 20.6-48 45.9 21.5 45.9 48 45.9z"></path></svg></div>`;
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-semibold">{item.product_name}</div>
                                                <div className="text-sm text-gray-600">
                                                    Ghi chú: {item.note || 'Không có'}
                                                </div>
                                            </div>
                                            {item.status === 'completed' ? (
                                                <div className="ml-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded font-medium">
                                                    Đã hoàn thành
                                                </div>
                                            ) : item.status === 'confirmed' ? (
                                                <button
                                                    disabled
                                                    className="ml-2 px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded cursor-default"
                                                >
                                                    Đã xác nhận
                                                </button>
                                            ) : (
                                                <select
                                                    value={item.status}
                                                    onChange={(e) =>
                                                        updateOrderItemStatus(item._id, e.target.value)
                                                    }
                                                    className="ml-2 px-2 py-1 text-sm border rounded bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                                    disabled={loading}
                                                >
                                                    <option value="processing">Đang chế biến</option>
                                                    <option value="completed">Đã hoàn thành</option>
                                                </select>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-sm text-gray-700">x{item.quantity}</div>
                                            <div className="font-semibold text-red-600">
                                                {formatPrice(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {allItemsCompleted && selectedOrder?.order_status !== '4' && (
                                <button
                                    onClick={() => confirmOrderCompleted(selectedOrder.order_id)}
                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                    disabled={loading}
                                >
                                    Hoàn thành đơn hàng
                                </button>
                            )}
                            <button
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                Sửa đơn
                            </button>
                            <button
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                Xem hóa đơn
                            </button>
                            <button
                                onClick={exportOrderToPDF}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                Xuất PDF
                            </button>
                            <button
                                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                                disabled={loading}
                            >
                                Đánh giá
                            </button>
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
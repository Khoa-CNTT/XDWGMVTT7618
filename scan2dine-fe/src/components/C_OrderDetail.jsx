import React, { useEffect, useState, useCallback } from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaStore, FaPlus, FaMinus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';
import { Footer } from './Footer';
import { C_OrderDetailItem } from './C_OrderDetailItem';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';
import { C_ConfirmCallStaff } from './C_ConfirmCallStaff';
// hoặc nếu default export:
// import C_ConfirmCallStaff from './C_ConfirmCallStaff';

const OrderDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orderDetails, setOrderDetails] = useState({
        orderNumber: '',
        startTime: '',
        endTime: '',
        phone: '',
        customerName: '',
        table: '',
        items: [],
        totalAmount: 0,
        totalItems: 0,
    });
const [showPaymentForm, setShowPaymentForm] = useState(false);
const cancelCallPayment = () => {
    setShowPaymentForm(false);
};

    const location = useLocation();
    const orderData = location.state?.orderData;

    // Debounce thông báo để tránh spam
    const debouncedToast = useCallback(
        debounce((message, type = 'info') => {
            toast[type](message);
        }, 1000),
        []
    );

    const fetchOrderDetails = useCallback(async (orderData) => {
        if (!orderData?.order?._id) {
            setError('Không có dữ liệu đơn hàng.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const { data: orderRes } = await api.get(`/s2d/order/${orderData.order._id}`);
            if (!orderRes) throw new Error('Không tìm thấy đơn hàng');

            const { data: products } = await api.get('/s2d/product');
            

            const items = orderRes.orderdetail || [];
            let totalItems = 0;
            let totalAmount = 0;

            const flatItemsList = items.map((item) => {
                const product = item.products || {};
                const quantity = item.quantity || 0;
                const price = parseInt(product.price) || 0;

                totalItems += quantity;
                totalAmount += price * quantity;

                return {
                    id: product._id || item.productId || 'unknown',
                    name: product.pd_name || 'Sản phẩm không xác định',
                    image: product.image ? `${process.env.REACT_APP_API_URL}/${product.image}` : '',
                    quantity,
                    price,
                    note: item.note || '',
                    status: item.status || '1',
                };
            });

            setOrderDetails({
                orderNumber: orderRes._id || '#12345',
                startTime: orderRes.od_date ? new Date(orderRes.od_date).toLocaleString() : '',
                endTime: orderRes.updatedAt ? new Date(orderRes.updatedAt).toLocaleString() : '',
                phone: orderRes.customer?.phone || '',
                customerName: orderRes.customer?.name || '',
                table: orderRes.table?.tb_number || '',
                items: flatItemsList,
                totalAmount,
                totalItems,
            });
            sessionStorage.setItem('orderStartTime', orderRes.od_date ? new Date(orderRes.od_date).toLocaleString() : '');

        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            setError('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleRequestMore = useCallback(() => {
        navigate('/menu');
    }, [navigate]);

    const handlePayment = useCallback(async () => {
        if (!orderData?.order?._id) {
            debouncedToast('Không tìm thấy đơn hàng để thanh toán!', 'error');
            return;
        }

        try {
            await api.patch(`/s2d/order/${orderData.order._id}`, { od_status: '5' });
            await api.patch(`/s2d/table/${orderData.order.table?._id}`, { status: '5' });
            fetchOrderDetails(orderData);
            debouncedToast('Yêu cầu thanh toán đã được gửi thành công!', 'success');
        } catch (error) {
            console.error('Lỗi khi yêu cầu thanh toán:', error);
            debouncedToast('Yêu cầu thanh toán thất bại!', 'error');
        }
    }, [orderData, debouncedToast, fetchOrderDetails]);

    const renderStatusBadge = useCallback((status) => {
        let bgColor = 'bg-gray-200 text-gray-700';

        switch (status) {
            case '2':
                bgColor = 'bg-purple-100 text-purple-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Đã xác nhận
                    </span>
                );
            case '3':
                bgColor = 'bg-blue-100 text-blue-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Đang chuẩn bị
                    </span>
                );
            case '4':
                bgColor = 'bg-green-100 text-green-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Hoàn tất
                    </span>
                );
            default:
                bgColor = 'bg-gray-100 text-gray-700';
                return (
                    <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>
                        Chờ xác nhận
                    </span>
                );
        }
    }, []);

    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }, []);

    useEffect(() => {
        fetchOrderDetails(orderData);
    }, [orderData, fetchOrderDetails]);

    useEffect(() => {
        if (!orderData?.order?._id) return;

        const customer = {
            orderId: orderData.order._id,
            idTable: orderData.order.table?._id,
        };

        registerSocketListeners({
            customer,
            OrderUpdated: (data) => {
                if (data && typeof data === 'object' && data.orderId === orderData.order._id) {
                    fetchOrderDetails(orderData);
                    debouncedToast('Đơn hàng đã được cập nhật!', 'info');
                } else {
                    console.error('Dữ liệu không hợp lệ từ OrderUpdated:', data);
                }
            },
            OrderDetailChanged: (data) => {
                if (data && typeof data === 'object' && data.orderId === orderData.order._id) {
                    switch (data.action) {
                        case 'added':
                            if (data.item) {
                                setOrderDetails((prev) => {
                                    const newItems = [...prev.items, data.item];
                                    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
                                    const totalAmount = newItems.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );
                                    return {
                                        ...prev,
                                        items: newItems,
                                        totalItems,
                                        totalAmount,
                                    };
                                });
                                debouncedToast('Đã thêm món mới vào đơn hàng!', 'success');
                            }
                            break;
                        case 'updated':
                            if (data.item) {
                                setOrderDetails((prev) => {
                                    const newItems = prev.items.map((item) =>
                                        item.id === data.item.id ? { ...item, ...data.item } : item
                                    );
                                    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
                                    const totalAmount = newItems.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );
                                    return {
                                        ...prev,
                                        items: newItems,
                                        totalItems,
                                        totalAmount,
                                    };
                                });
                                debouncedToast('Chi tiết đơn hàng đã được cập nhật!', 'info');
                            }
                            break;
                        case 'deleted':
                            if (data.itemId) {
                                setOrderDetails((prev) => {
                                    const newItems = prev.items.filter((item) => item.id !== data.itemId);
                                    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
                                    const totalAmount = newItems.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );
                                    return {
                                        ...prev,
                                        items: newItems,
                                        totalItems,
                                        totalAmount,
                                    };
                                });
                                debouncedToast('Đã xóa món khỏi đơn hàng!', 'info');
                            }
                            break;
                        case 'quantity_decreased':
                            if (data.itemId && data.quantity) {
                                setOrderDetails((prev) => {
                                    const newItems = prev.items.map((item) =>
                                        item.id === data.itemId ? { ...item, quantity: data.quantity } : item
                                    );
                                    const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
                                    const totalAmount = newItems.reduce(
                                        (sum, item) => sum + item.price * item.quantity,
                                        0
                                    );
                                    return {
                                        ...prev,
                                        items: newItems,
                                        totalItems,
                                        totalAmount,
                                    };
                                });
                                debouncedToast('Số lượng món đã được giảm!', 'info');
                            }
                            break;
                        default:
                            fetchOrderDetails(orderData);
                    }
                } else {
                    console.error('Dữ liệu không hợp lệ từ OrderDetailChanged:', data);
                }
            },
            OrderConfirmed: (data) => {
                console.log('Dữ liệu nhận được từ sự kiện order_confirmed:', data); // Log giá trị data
                if (data && typeof data === 'object' && (data.orderId === customer.orderId || data.tableId === customer.idTable)) {
                    console.log('Đơn hàng đã được xác nhận:', data);
                    fetchOrderDetails(orderData);
                    debouncedToast('Đơn hàng đã được xác nhận!', 'success');
                } else {
                    console.error('Dữ liệu không phải là đối tượng hợp lệ từ OrderConfirmed:', data);
                }
            },
            OrderDeleted: (data) => {
                if (data && typeof data === 'object' && data.orderId === orderData.order._id) {
                    setError('Đơn hàng đã bị xóa.');
                    setOrderDetails({
                        orderNumber: '',
                        startTime: '',
                        endTime: '',
                        phone: '',
                        customerName: '',
                        table: '',
                        items: [],
                        totalAmount: 0,
                        totalItems: 0,
                    });
                    debouncedToast('Đơn hàng đã bị xóa!', 'info');
                } else {
                    console.error('Dữ liệu không hợp lệ từ OrderDeleted:', data);
                }
            },
        });

        return () => {
            cleanupSocketListeners();
        };
    }, [orderData, debouncedToast, fetchOrderDetails]);

    return (
        <div className="min-h-screen bg-white flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl">
            <div className="bg-primary text-white p-4 relative">
                <button onClick={() => navigate(-2)} className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-center">Đơn hàng của tôi</h1>
            </div>

            <div className="p-4">
                <div className="text-lg font-bungee font-extrabold">
                    SCAN<span className="text-primary">2</span>DINE
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                    <FaMapMarkerAlt className="mt-1" />
                    <p>23 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse bg-gray-200 h-8 w-48 rounded-full mb-2"></div>
                </div>
            ) : error ? (
                <div className="text-center p-4 text-gray-500">{error}</div>
            ) : (
                <>
                    <div className="border-t border-b p-4 space-y-2">
                        <div className="flex justify-between">
                            <span>Đơn hàng:</span>
                            <span className="text-primary font-medium uppercase">
                                {orderDetails.orderNumber}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Giờ bắt đầu:</span>
                            <span>{orderDetails.startTime}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Số điện thoại:</span>
                            <span>{orderDetails.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tên khách hàng:</span>
                            <span>{orderDetails.customerName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Bàn:</span>
                            <span>{orderDetails.table}</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-medium">Danh sách món ăn</h3>
                            <span className="text-sm text-gray-500">{orderDetails.totalItems} món</span>
                        </div>

                        {orderDetails.items.length === 0 ? (
                            <div className="text-center p-4 text-gray-500">
                                Chưa có món ăn nào trong đơn hàng
                            </div>
                        ) : (
                            <div className="divide-y">
                                {orderDetails.items.map((item) => (
                                    <C_OrderDetailItem
                                        key={item.id}
                                        item={item}
                                        renderStatusBadge={renderStatusBadge}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-medium">
                                Tổng tiền ({orderDetails.totalItems} món):
                            </span>
                            <span className="text-primary font-bold text-xl">
                                {formatCurrency(orderDetails.totalAmount)}
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleRequestMore}
                                className="flex-1 bg-red-100 text-primary py-3 rounded-full font-medium"
                            >
                                Yêu cầu thêm món
                            </button>
                            <button
                                onClick={handlePayment}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium"
                            >
                                Yêu cầu thanh toán
                            </button>
                        </div>
                    </div>
                </>
            )}


            {showPaymentForm && (
                <C_ConfirmCallStaff
                    title="Đã gửi yêu cầu thanh toán"
                    message="Nhân viên đang đến bạn hãy chờ một lát ..."
                    onConfirm={() => setShowPaymentForm(false)}
                    onCancel={() => cancelCallPayment(orderData.order.table._id)}
                />
            )

            }

            <Footer />

        </div>
    );
};

export default OrderDetail;
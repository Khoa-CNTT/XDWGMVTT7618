import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaStore, FaPlus, FaMinus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../server/api';

const formatPrice = (price) => {
    return parseInt(price).toLocaleString() + 'đ';
};

const OrderDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [editingCounter, setEditingCounter] = useState(null);
    const [expandedCounters, setExpandedCounters] = useState([]);

    const [orderDetails, setOrderDetails] = useState({
        orderNumber: '',
        startTime: '',
        endTime: '',
        phone: '',
        customerName: '',
        table: '',
        items: [],
        totalAmount: 0,
        totalItems: 0
    });

    const location = useLocation();
    const orderData = location.state?.orderData;

    useEffect(() => {
        console.log('Order detail:', orderData);
    }, [orderData]);

    const customer = JSON.parse(sessionStorage.getItem('customer'));

    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            // Lấy dữ liệu foodstalls từ API
            const foodstallsRes = await api.get('/s2d/foodstall');
            const foodstalls = foodstallsRes.data;

            // Dữ liệu đơn hàng
            const items = orderData.order.orderdetail;
            console.log("đơn hàng", items);

            // Nếu cần thêm thông tin sản phẩm (vd: pd_name, image, price),
            // bạn cần fetch dữ liệu từ API sản phẩm
            const productsRes = await api.get('/s2d/product');
            const products = productsRes.data;

            // Tạo bản đồ để tra cứu chi tiết sản phẩm
            const productMap = {};
            products.forEach(prod => {
                productMap[prod._id] = prod;
            });

            // Tạo danh sách phẳng các sản phẩm
            const flatItemsList = items.map(item => {
                const product = productMap[item.product];
                return {
                    id: item.product,
                    name: product?.pd_name || 'Sản phẩm không xác định',
                    image: product?.image ? `${process.env.REACT_APP_API_URL}/${product.image}` : '',
                    quantity: item.quantity,
                    price: product?.price || 0,
                    note: item.note,
                    status: item.status
                };
            });

            // Tính tổng
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = items.reduce((sum, item) => {
                const product = productMap[item.product];
                return sum + (parseInt(product?.price || 0) * item.quantity);
            }, 0);

            // Cập nhật state
            setOrderDetails({
                orderNumber: orderData.order.orderCode || '#12345',
                startTime: new Date(orderData.order.createdAt).toLocaleString(),
                endTime: '',
                phone: localStorage.getItem('phone') || '',
                customerName: localStorage.getItem('customerName') || '',
                table: localStorage.getItem('tableId') || '',
                items: flatItemsList,
                totalAmount,
                totalItems
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setLoading(false);
        }
    };

    const adjustQuantity = (itemId, delta) => {
        setOrderDetails(prev => {
            const updatedItems = prev.items.map(item =>
                item.id === itemId
                    ? { ...item, quantity: Math.max(item.quantity + delta, 1) }
                    : item
            );

            const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTotalAmount = updatedItems.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);

            return {
                ...prev,
                items: updatedItems,
                totalItems: newTotalItems,
                totalAmount: newTotalAmount
            };
        });
    };

    const removeItem = (itemId) => {
        setOrderDetails(prev => {
            const updatedItems = prev.items.filter(item => item.id !== itemId);

            const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            const newTotalAmount = updatedItems.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0);

            return {
                ...prev,
                items: updatedItems,
                totalItems: newTotalItems,
                totalAmount: newTotalAmount
            };
        });
    };

    const handleRequestMore = () => navigate('/menu');
    const handlePayment = () => console.log('Processing payment...');

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    // Status badge renderer
    const renderStatusBadge = (status) => {
        let bgColor = 'bg-gray-200 text-gray-700';

        switch (status) {
            case 'pending':
                bgColor = 'bg-yellow-100 text-yellow-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đang xử lý</span>;
            case 'preparing':
                bgColor = 'bg-blue-100 text-blue-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đang chuẩn bị</span>;
            case 'ready':
                bgColor = 'bg-green-100 text-green-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Sẵn sàng</span>;
            case 'delivered':
                bgColor = 'bg-purple-100 text-purple-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đã giao</span>;
            case 'cancelled':
                bgColor = 'bg-red-100 text-red-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đã hủy</span>;
            default:
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Chờ xác nhận</span>;
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col w-full sm:max-w-[800px] mx-auto">
            <div className="bg-primary text-white p-4 flex items-center">
                <button onClick={() => navigate(-1)} className="mr-4">
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold">Đơn hàng của tôi</h1>
            </div>

            <div className="p-4">
                <div className="text-lg font-bungee font-extrabold">SCAN<span className='text-primary'>2</span>DINE</div>
                <div className="flex items-start gap-2 text-gray-600">
                    <FaMapMarkerAlt className="mt-1" />
                    <p>23 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng</p>
                </div>
            </div>

            <div className="border-t border-b p-4 space-y-2">
                <div className="flex justify-between"><span>Đơn hàng:</span><span className="text-primary font-medium uppercase">{orderData.order._id}</span></div>
                <div className="flex justify-between"><span>Giờ bắt đầu:</span><span>{orderData.order.createdAt}</span></div>
                <div className="flex justify-between"><span>Số điện thoại:</span><span>{orderData.order.customer.phone}</span></div>
                <div className="flex justify-between"><span>Tên khách hàng:</span><span>{orderData.order.customer.name}</span></div>
                <div className="flex justify-between"><span>Bàn:</span><span>{orderData.order.table.tb_number}</span></div>
            </div>

            {/* Danh sách sản phẩm phẳng */}
            <div className="flex-1 overflow-auto">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-medium">Danh sách món ăn</h3>
                    <span className="text-sm text-gray-500">{orderDetails.totalItems} món</span>
                </div>

                <div className="divide-y">
                    {orderDetails.items.map((item) => (
                        <div key={item.id} className="p-4 flex items-center gap-3">
                            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                                {item.image ? (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No image</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h4 className="font-medium">{item.name}</h4>
                                    <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                                </div>

                                <div className="flex justify-between items-center mt-2">
                                    <div className="flex items-center">
                                        <span className="text-sm">SL: {item.quantity}</span>
                                        <span className="mx-2 text-gray-400">|</span>
                                        {renderStatusBadge(item.status)}
                                    </div>

                                    <span className="font-medium">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>

                                {item.note && (
                                    <div className="mt-1 text-sm italic text-gray-600">
                                        <span className="font-medium">Ghi chú:</span> {item.note}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Tổng tiền ({orderDetails.totalItems} món):</span>
                    <span className="text-primary font-bold text-xl">
                        {orderDetails.totalAmount.toLocaleString()}đ
                    </span>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleRequestMore} className="flex-1 bg-red-100 text-primary py-3 rounded-full font-medium">Yêu cầu thêm món</button>
                    <button onClick={handlePayment} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium">Thanh toán</button>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-500 border-t">
                <p>© 2025 SCAN2DINE - Ứng dụng đặt món thông minh</p>
                <p className="mt-1">Mọi thắc mắc xin liên hệ: support@scan2dine.vn</p>
            </div>
        </div>
    );
};

export default OrderDetail;
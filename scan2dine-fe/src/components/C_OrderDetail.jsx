import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaStore, FaPlus, FaMinus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../server/api';
import { Footer } from './Footer'

const formatPrice = (price) => {
    return parseInt(price).toLocaleString() + 'đ';
};

const OrderDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
        console.log('order data', orderData);

    }, [orderData]);

    useEffect(() => {
        fetchOrderDetails(orderData);
    }, [orderData]);

    const fetchOrderDetails = async (orderData) => {
        if (!orderData?.order?._id) return;

        try {
            setLoading(true);

            // 1. Lấy thông tin đơn hàng từ server theo ID
            const { data: orderRes } = await api.get(`/s2d/order/${orderData.order._id}`);
            console.log('Order Response:', orderRes);

            if (!orderRes) throw new Error('Không tìm thấy đơn hàng');

            // 2. Lấy danh sách sản phẩm từ server
            const { data: products } = await api.get('/s2d/product');
            const productMap = Object.fromEntries(products.map(p => [p._id, p]));

            // 3. Xử lý danh sách món ăn trong đơn hàng
            const items = orderRes.orderdetail || [];
            let totalItems = 0;
            let totalAmount = 0;

            const flatItemsList = items.map(item => {
                const product = item.products || {};
                const quantity = item.quantity || 0;
                const price = parseInt(product.price) || 0;

                totalItems += quantity;
                totalAmount += price * quantity;

                return {
                    id: product._id || item.productId || 'unknown',
                    name: product.pd_name || 'Sản phẩm không xác định',
                    image: `${process.env.REACT_APP_API_URL}/${product.image}` ? `${process.env.REACT_APP_API_URL}/${product.image}` : '',
                    quantity,
                    price,
                    note: item.note || '',
                    status: item.status || 'pending'
                };
            });

            // 4. Cập nhật state với thông tin đơn hàng
            setOrderDetails({
                orderNumber: orderRes._id || '#12345',
                startTime: orderRes.od_date ? new Date(orderRes.od_date).toLocaleString() : '',
                endTime: orderRes.updatedAt ? new Date(orderRes.updatedAt).toLocaleString() : '',
                phone: orderRes.customer?.phone || '',
                customerName: orderRes.customer?.name || '',
                table: orderRes.table?.tb_number || '',
                items: flatItemsList,
                totalAmount,
                totalItems
            });


        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            alert('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };



    const handleRequestMore = () => navigate('/menu');
    const handlePayment = () => console.log('Processing payment...');

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

    // Custom status
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
                <div className="flex justify-between"><span>Đơn hàng:</span><span className="text-primary font-medium uppercase">{orderDetails.orderNumber}</span></div>
                <div className="flex justify-between"><span>Giờ bắt đầu:</span><span>{orderDetails.startTime}</span></div>
                <div className="flex justify-between"><span>Số điện thoại:</span><span>{orderDetails.phone}</span></div>
                <div className="flex justify-between"><span>Tên khách hàng:</span><span>{orderDetails.customerName}</span></div>
                <div className="flex justify-between"><span>Bàn:</span><span>{orderDetails.table}</span></div>
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
                                {`${process.env.REACT_APP_API_URL}/${item.image}` ? (
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
            <Footer></Footer>
        </div>
    );
};

export default OrderDetail;
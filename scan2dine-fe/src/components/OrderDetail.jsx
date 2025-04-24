import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FaStore } from 'react-icons/fa';
import api from '../server/api';

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
        items: {},
        totalAmount: 0,
        totalItems: 0
    });

    const customer = JSON.parse(sessionStorage.getItem('customer'));


    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
            const [orderDetails, foodstalls] = await Promise.all([
                api.get('/s2d/orderdetail'),//phải get từ orderdetail 
                api.get('/s2d/foodstall')
            ]);

            const items = orderDetails.data.filter(item => item.cart._id === customer.cart);

            const stallMap = foodstalls.data.reduce((acc, stall) => {
                acc[stall._id] = {
                    name: stall.stall_name,
                    location: stall.location
                };
                return acc;
            }, {});

            const groupedItems = items.reduce((acc, item) => {
                const stallId = item.products.stall_id;
                const stallInfo = stallMap[stallId] || { name: 'Quầy chưa phân loại', location: '' };

                if (!acc[stallId]) {
                    acc[stallId] = {
                        name: stallInfo.name,
                        location: stallInfo.location,
                        items: []
                    };
                }

                acc[stallId].items.push(item);
                return acc;
            }, {});

            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = items.reduce((sum, item) =>
                sum + (parseInt(item.products.price) * item.quantity), 0
            );

            setOrderDetails({
                orderNumber: '#12345',
                startTime: new Date().toLocaleString(),
                endTime: '',
                phone: localStorage.getItem('phone') || '',
                customerName: localStorage.getItem('customerName') || '',
                table: localStorage.getItem('tableId') || '',
                items: groupedItems,
                totalAmount,
                totalItems
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setLoading(false);
        }
    };

    const handleRequestMore = () => navigate('/menu');
    const handlePayment = () => console.log('Processing payment...');

    if (loading) return <div className="min-h-screen flex justify-center items-center">Loading...</div>;

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
                <div className="flex justify-between">
                    <span>Đơn hàng:</span>
                    <span className="text-primary font-medium">{orderDetails.orderNumber}</span>
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
                    <span>BÀN:</span>
                    <span>{orderDetails.table}</span>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                {Object.entries(orderDetails.items).map(([stallId, stall]) => (
                    <div key={stallId} className="border-b">
                        <div className="p-4">
                            <h3 className="font-medium mb-2 flex items-center">
                                <FaStore className="mr-2" />
                                {stall.name} ({stall.items.length} món)
                                {stall.location && <span className="ml-2 text-sm text-gray-500">- {stall.location}</span>}
                            </h3>
                            {stall.items.map((item) => (
                                <div key={item._id} className="flex items-center gap-4 mb-4">
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}/${item.products.image}`}
                                        alt={item.products.pd_name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-medium">{item.products.pd_name}</h4>
                                        {item.note && <p className="text-sm text-gray-500">Ghi chú: {item.note}</p>}
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-primary">
                                                {parseInt(item.products.price).toLocaleString()}đ x {item.quantity}
                                            </span>
                                            <span className={item.status === 'completed' ? 'text-blue-500' : 'text-orange-500'}>
                                                {item.status === 'completed' ? 'Đã hoàn thành' : 'Đang chuẩn bị'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Tổng tiền ({orderDetails.totalItems} món):</span>
                    <span className="text-primary font-bold text-xl">
                        {orderDetails.totalAmount.toLocaleString()}đ
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
                        Thanh toán
                    </button>
                </div>
            </div>

            <div className="text-center p-4 text-gray-500 text-sm">
                Được phát triển bởi SCAN2DINE
            </div>
        </div>
    );
};

export default OrderDetail;
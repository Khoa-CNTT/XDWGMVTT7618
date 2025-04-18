import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../server/api';

const OrderDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState({
        orderNumber: '#12345',
        startTime: '',
        endTime: '',
        phone: '',
        customerName: '',
        table: '',
        items: [],
        totalAmount: 0
    });


    useEffect(() => {
        fetchOrderDetails();
    }, []);

    const fetchOrderDetails = async () => {
        try {
          const cartId = localStorage.getItem('cartId');
          const cartDetails = await api.get('/s2d/cartdetail');
          const items = cartDetails.data.filter(item => item.cart._id === cartId);
      
          // Group items by counter
          const groupedItems = items.reduce((acc, item) => {
            const counter = item.products.counter || 'Quầy A';
            if (!acc[counter]) {
              acc[counter] = [];
            }
            acc[counter].push(item);
            return acc;
          }, {});
      
          setOrderDetails({
            orderNumber: '#12345',
            startTime: new Date().toLocaleString(),
            endTime: '',
            phone: localStorage.getItem('phone') || '',
            customerName: localStorage.getItem('customerName') || '',
            table: localStorage.getItem('tableId') || '',
            items: groupedItems,
            totalAmount: items.reduce((sum, item) => 
              sum + (parseInt(item.products.price) * item.quantity), 0
            )
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching order details:', error);
          setLoading(false);
        }
      };

    if (loading || !orderDetails) return <div>Loading...</div>;

    const handleRequestMore = () => {
        navigate('/menu');
    };

    const handlePayment = () => {
        // Implement payment logic here
        console.log('Processing payment...');
    };

    if (loading) return <div>Loading...</div>;

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
                {Object.entries(orderDetails.items).map(([counter, items]) => (
                    <div key={counter} className="border-b">
                        <div className="p-4">
                            <h3 className="font-medium mb-2">{counter} ({items.length} món)</h3>
                            {items.map((item) => (
                                <div key={item._id} className="flex items-center gap-4 mb-4">
                                    <img
                                        src={`http://localhost:5000/${item.products.image}`}
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
                    <span className="font-medium">Tổng tiền ({Object.values(orderDetails.items).flat().length} món):</span>
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
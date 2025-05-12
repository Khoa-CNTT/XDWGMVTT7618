import React, { useEffect, useState } from 'react';
import { FaArrowLeft, FaMapMarkerAlt, FaStore, FaPlus, FaMinus } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../server/api';
import { Footer } from './Footer'
import { C_OrderDetailItem } from './C_OrderDetailItem';
import { C_ConfirmCallStaff } from '../components/C_ConfirmCallStaff';


const OrderDetail = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [showPaymentForm, setShowPaymentForm] = useState(false);


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
            sessionStorage.setItem('orderStartTime', orderRes.od_date ? new Date(orderRes.od_date).toLocaleString() : '');


        } catch (error) {
            console.error('Lỗi khi lấy chi tiết đơn hàng:', error);
            alert('Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const cancelCallPayment = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '2',
            })
            setShowPaymentForm(false)
        } catch (error) {

        }
    }

    const callPayment = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '5',
            })

        } catch (error) {

        }
    }

    const handleRequestMore = () => navigate('/menu');
    // Custom status
    const renderStatusBadge = (status) => {
        let bgColor = 'bg-gray-200 text-gray-700';

        switch (status) {
            case '2':
                bgColor = 'bg-purple-100 text-purple-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đã xác nhận</span>;
            case '3':
                bgColor = 'bg-blue-100 text-blue-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Đang chuẩn bị</span>;
            case '4':
                bgColor = 'bg-green-100 text-green-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Hoàn tất</span>;
            default:
                bgColor = 'bg-gray-100 text-gray-700';
                return <span className={`${bgColor} px-2 py-1 rounded-full text-xs font-medium`}>Chờ xác nhận</span>;

        }
    };

    //custom fortmat giá tiền
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl">
            <div className="bg-primary text-white p-4 relative">
                <button onClick={() => navigate(-2)} className="absolute left-4 top-1/2 -translate-y-1/2">
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-center">Đơn hàng của tôi</h1>
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
                        <C_OrderDetailItem key={item.id} item={item} renderStatusBadge={renderStatusBadge} />
                    ))}
                </div>
            </div>

            <div className="border-t p-4">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Tổng tiền ({orderDetails.totalItems} món):</span>
                    <span className="text-primary font-bold text-xl">
                        {formatCurrency(orderDetails.totalAmount)}
                    </span>
                </div>
                <div className="flex gap-4">
                    <button onClick={handleRequestMore} className="flex-1 bg-red-100 text-primary py-3 rounded-full font-medium">Yêu cầu thêm món</button>
                    <button onClick={() => {
                        setShowPaymentForm(true);
                        callPayment(orderData.order.table._id)
                    }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-full font-medium">Yêu cầu thanh toán</button>
                </div>
            </div>

            {/* Footer */}
            <Footer></Footer>

            {showPaymentForm && (
                <C_ConfirmCallStaff
                    title="Đã gửi yêu cầu thanh toán"
                    message="Nhân viên đang đến bạn hãy chờ một lát ..."
                    onConfirm={() => setShowPaymentForm(false)}
                    onCancel={() => cancelCallPayment(orderData.order.table._id)}
                />
            )

            }
        </div>

    );
};

export default OrderDetail;

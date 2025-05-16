import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../server/api';
import { FaStar, FaArrowLeft } from 'react-icons/fa';
import { MdOutlinePlace } from "react-icons/md";
import { Footer } from './Footer';

const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

const ReviewProduct = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderIdx, setSelectedOrderIdx] = useState(null);
    const [anonymous, setAnonymous] = useState(false);
    const [reviewData, setReviewData] = useState({});
    const [reviewedOrders, setReviewedOrders] = useState(() => {
        // Lấy từ localStorage khi load lại trang
        const saved = localStorage.getItem('reviewedOrders');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const customer = JSON.parse(sessionStorage.getItem("customer"));
        if (!customer || !customer._id) {
            setOrders([]);
            setLoading(false);
            return;
        }
        const fetchPaidOrders = async () => {
            try {
                const response = await api.post('/s2d/order/dathanhtoan', { customerId: customer._id });
                console.log(response.data);

                if (response.data && response.data.data) {
                    setOrders(response.data.data);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                setOrders([]);
            }
            setLoading(false);
        };
        fetchPaidOrders();
    }, []);

    // Xử lý đánh giá từng món
    const handleStarClick = (orderId, productId, rating) => {
        setReviewData(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [productId]: {
                    ...prev[orderId]?.[productId],
                    rating
                }
            }
        }));
    };

    const handleCommentChange = (orderId, productId, value) => {
        setReviewData(prev => ({
            ...prev,
            [orderId]: {
                ...prev[orderId],
                [productId]: {
                    ...prev[orderId]?.[productId],
                    comment: value
                }
            }
        }));
    };

    const handleSendReview = async () => {
        if (!selectedOrder) return;
        const customer = JSON.parse(sessionStorage.getItem("customer"));
        const orderId = selectedOrder._id;
        const reviews = reviewData[orderId] || {};
    
        for (const item of selectedOrder.orderdetail) {
            const productId = item._id;
            const review = reviews[productId];
            if (review && review.rating) {
                try {
                    await api.post('s2d/review/', {
                        customer: customer._id,
                        products: item.products?._id,
                        rating: review.rating,
                        comment: review.comment || "",
                        anonymous,
                        order: orderId,
                    });
                } catch (error) {
                    alert("Có lỗi khi gửi đánh giá cho món: " + (item.products?.pd_name || "Không xác định"));
                    return;
                }
            }
        }
        // Lưu trạng thái đã đánh giá
        const updated = [...reviewedOrders, orderId];
        setReviewedOrders(updated);
        localStorage.setItem('reviewedOrders', JSON.stringify(updated));
        alert('Đã gửi đánh giá!');
        setSelectedOrderIdx(null);
    };

    // Lấy thông tin đơn hàng đang chọn
    const selectedOrder = selectedOrderIdx !== null ? orders[selectedOrderIdx] : null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            {/* Header */}
            <div className="w-full sm:max-w-[800px] bg-primary text-white flex items-center px-4 py-3 rounded-b-lg shadow mx-auto">
                <button onClick={() => selectedOrderIdx === null ? navigate(-1) : setSelectedOrderIdx(null)}>
                    <FaArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center font-bold text-lg">Đánh giá món ăn</span>
            </div>

            {/* Địa chỉ quán */}
            <div className="w-full sm:max-w-[800px] bg-white px-4 pt-3 pb-2 border-b border-gray-200 mx-auto">
                <div className="font-bungee text-xl font-extrabold">SCAN<span className="text-primary">2</span>DINE</div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                    <MdOutlinePlace size={15}    />
                    23 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng
                </div>
            </div>

            {/* Danh sách đơn hàng hoặc chi tiết đơn hàng */}
            <div className="w-full sm:max-w-[800px] flex-1 overflow-y-auto pb-4 mx-auto">
                {loading ? (
                    <div className="text-center py-8">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8">Không có đơn hàng nào để đánh giá.</div>
                ) : selectedOrderIdx === null ? (
                    // Danh sách đơn hàng
                    <div className="space-y-4 mt-4">
                        {orders.map((order, idx) => (
                            <div
                                key={order._id || idx}
                                className="bg-white rounded-xl shadow border border-gray-200 cursor-pointer hover:shadow-lg transition"
                                onClick={() => setSelectedOrderIdx(idx)}
                            >
                                <div className="flex items-center justify-between p-4 border-b">
                                    <div>
                                        <div className="font-semibold text-base text-primary">Mã đơn: <span className="text-black">{order._id}</span></div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Ngày: {order.od_date ? new Date(order.od_date).toLocaleString() : ''}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-green-600 font-semibold text-sm mb-1">Hoàn thành</span>
                                        <span className="text-xs text-gray-400">{order.orderdetail?.length || 0} món</span>
                                    </div>
                                </div>
                                <div className="p-4 flex justify-between items-center">
                                    <div className="font-semibold">Tổng tiền:</div>
                                    <div className="font-bold text-lg text-primary">{formatCurrency(order.total_amount || order.total || 0)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Chi tiết đơn hàng và đánh giá
                    <div className="bg-white rounded-xl shadow border border-gray-200 mt-4">
                        <div className="px-4 pt-4 pb-2 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="font-semibold">Đơn hàng: </span>
                                    <span className="text-primary font-bold">#{selectedOrder._id?.slice(-6) || ''}</span>
                                </div>
                                <span className="text-xs text-gray-700">BÀN: {selectedOrder.table?.tb_number || 'A1'}</span>
                            </div>
                            <div className="text-xs text-gray-700 mt-1">
                                Giờ bắt đầu: <span className="font-bold text-red-600">{selectedOrder.od_date ? new Date(selectedOrder.od_date).toLocaleString() : ''}</span>
                            </div>
                        </div>
                        {/* Danh sách món ăn */}
                        <div className="divide-y">
                            {selectedOrder.orderdetail?.map((item, i) => (
                                <div key={item._id || i} className="flex gap-3 p-4">
                                    <div className="w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-white border">
                                        {item.products?.image ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}${item.products.image}`}
                                                alt={item.products?.pd_name || "Product"}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="font-semibold">{item.products?.pd_name || 'Tên món'}</div>
                                            <div className="text-xs text-gray-500">Ghi chú: <span className="text-black">{item.note || 'Không có'}</span></div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">Đánh giá món ăn:</span>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FaStar
                                                    key={star}
                                                    className={`cursor-pointer ${reviewData[selectedOrder._id]?.[item._id]?.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                                    onClick={() => handleStarClick(selectedOrder._id, item._id, star)}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-1">
                                            <textarea
                                                className="w-full border rounded p-2 text-xs"
                                                rows={2}
                                                placeholder="Hãy chia sẻ nhận xét cho món ăn này bạn nhé!"
                                                value={reviewData[selectedOrder._id]?.[item._id]?.comment || ''}
                                                onChange={e => handleCommentChange(selectedOrder._id, item._id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between">
                                        <div className="font-semibold text-primary">{formatCurrency(item.total)}</div>
                                        <div className="text-xs text-gray-500">x{item.quantity}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Tổng tiền */}
                        <div className="flex justify-end items-center px-4 py-3 border-t">
                            <span className="font-semibold mr-2">Tổng tiền ({selectedOrder.orderdetail?.length || 0} món ăn):</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(selectedOrder.total_amount || selectedOrder.total || 0)}</span>
                        </div>
                        {/* Ẩn danh, Hủy, Gửi đánh giá */}
                        <div className="px-4 py-3 border-t flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={anonymous}
                                        onChange={() => setAnonymous(val => !val)}
                                        className="accent-primary"
                                    />
                                    Đánh ẩn danh
                                </label>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    className="flex-1 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100"
                                    onClick={() => setSelectedOrderIdx(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="flex-1 py-2 bg-primary text-white rounded font-semibold hover:bg-red-700"
                                    onClick={handleSendReview}
                                >
                                    Gửi đánh giá
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Footer */}
            <div className="w-full sm:max-w-[800px] mx-auto">
                <Footer />
            </div>
        </div>
    );
};

export default ReviewProduct;
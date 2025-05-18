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
    const [submitting, setSubmitting] = useState(false);
    const [selectedOrderIdx, setSelectedOrderIdx] = useState(null);
    const [anonymous, setAnonymous] = useState(false);
    const [reviewData, setReviewData] = useState({});
    const [customerReviews, setCustomerReviews] = useState([]);
    const [reviewedOrders, setReviewedOrders] = useState(() => {
        const saved = localStorage.getItem('reviewedOrders');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        const customer = JSON.parse(sessionStorage.getItem("customer"));
        if (!customer || !customer._id) {
            setOrders([]);
            setLoading(false);
            alert("Vui lòng đăng nhập để xem đơn hàng!");
            navigate('/login');
            return;
        }
        const fetchPaidOrders = async () => {
            try {
                const response = await api.post('/s2d/order/dathanhtoan', { customerId: customer._id });
                if (response.data && response.data.data) {
                    setOrders(response.data.data);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                setOrders([]);
                alert("Không thể tải đơn hàng. Vui lòng thử lại!");
            }
            setLoading(false);
        };
        fetchPaidOrders();
    }, [navigate]);

    useEffect(() => {
        const customer = JSON.parse(sessionStorage.getItem("customer"));
        if (!customer || !customer._id) {
            setCustomerReviews([]);
            alert("Vui lòng đăng nhập để xem đánh giá!");
            return;
        }

        const fetchCustomerReviews = async () => {
            // Lấy đơn hàng đang được chọn để lấy đánh giá, nếu không thì bỏ qua
            const selectedOrder = selectedOrderIdx !== null ? orders[selectedOrderIdx] : null;
            if (!selectedOrder || !selectedOrder._id) {
                setCustomerReviews([]);
                return;
            }

            try {
                const response = await api.post('/s2d/review/danhgia', { orderId: selectedOrder._id, customerId: customer._id });
                console.log("Dữ liệu đánh giá cũ trả về từ backend:", response.data);
                if (response.status === 200) {
                    setCustomerReviews(response.data || []);
                } else {
                    throw new Error("Unexpected response status: " + response.status);
                }
            } catch (error) {
                console.error("Error fetching reviews:", error);
                if (error.response?.status === 400) {
                    alert("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại orderId!");
                } else if (error.response?.status === 404) {
                    setCustomerReviews([]);
                } else {
                    alert("Có lỗi xảy ra khi lấy đánh giá. Vui lòng thử lại!");
                    setCustomerReviews([]);
                }
            }
        };

        fetchCustomerReviews();
    }, [orders, reviewedOrders, selectedOrderIdx]);

    // Xử lý đánh giá sao
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

    // Xử lý thay đổi nội dung comment
    const handleCommentChange = (orderId, productId, value) => {
        if (value.length > 500) return;
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

        const orderId = selectedOrder._id;
        const reviews = reviewData[orderId] || {};
        const customer = JSON.parse(sessionStorage.getItem("customer"));
        if (!customer || !customer._id) {
            alert("Vui lòng đăng nhập để gửi đánh giá!");
            return;
        }

        const validReviews = Object.keys(reviews).filter(
            productId => reviews[productId]?.rating > 0
        );
        if (validReviews.length === 0) {
            alert("Vui lòng đánh giá ít nhất một món ăn!");
            return;
        }

        setSubmitting(true);
        let hasError = false;

        try {
            for (const productId of validReviews) {
                const item = selectedOrder.orderdetail.find(i => i._id === productId);
                const review = reviews[productId];
                const payload = {
                    customer: customer._id,
                    product: item.products?._id || item.products,
                    rating: review.rating,
                    content: review.comment?.trim() || "",
                    anonymous,
                    od_date: review.Date,
                    order: orderId,
                };
                // Always create new review (POST)
                await api.post('/s2d/review/', payload);
            }
            const updated = [...reviewedOrders, orderId];
            setReviewedOrders(updated);
            localStorage.setItem('reviewedOrders', JSON.stringify(updated));
            alert("Đã gửi đánh giá thành công!");
            setSelectedOrderIdx(null);
            setReviewData(prev => ({ ...prev, [orderId]: {} }));
        } catch (error) {
            console.error("Error submitting reviews:", error);
            alert("Có lỗi khi gửi đánh giá. Vui lòng thử lại!");
            hasError = true;
        } finally {
            setSubmitting(false);
        }

        if (hasError) return;
    };

    // Lấy đánh giá cũ của người dùng cho đơn hàng đã chọn
    useEffect(() => {
        if (selectedOrderIdx !== null) {
            const selectedOrder = orders[selectedOrderIdx];
            const customer = JSON.parse(sessionStorage.getItem("customer"));
            if (!customer || !customer._id) return;
            // Gọi API mới
            api.post('/s2d/review/danhgia', { orderId: selectedOrder._id, customerId: customer._id })
                .then(res => {
                    console.log("Dữ liệu đánh giá cũ trả về từ backend:", res.data);
                    const oldReviews = res.data;     // Mỗi phần tử là 1 sản phẩm, có trường reviews (mảng)
                    const reviewDataForOrder = {};
                    selectedOrder.orderdetail.forEach(item => {
                        const productId = (item.products?._id || item.products || "").toString();
                        const productInfo = oldReviews.find(p =>
                            (p._id?.toString() === productId)
                        );
                        // Lấy review đầu tiên của khách hàng cho sản phẩm này (nếu có)
                        const review = productInfo?.reviews?.[0];
                        reviewDataForOrder[item._id] = {
                            rating: review?.rating || 0,
                            comment: review?.content || "",
                            _id: review?._id || null,
                            date: review?.date || null
                        };
                    });
                    setReviewData(prev => ({
                        ...prev,
                        [selectedOrder._id]: reviewDataForOrder
                    }));
                });
        }
    }, [selectedOrderIdx, orders]);

    const selectedOrder = selectedOrderIdx !== null ? orders[selectedOrderIdx] : null;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center">
            <div className="w-full sm:max-w-[800px] bg-primary text-white flex items-center px-4 py-3 rounded-b-lg shadow mx-auto">
                <button onClick={() => selectedOrderIdx === null ? navigate(-1) : setSelectedOrderIdx(null)}>
                    <FaArrowLeft size={20} />
                </button>
                <span className="flex-1 text-center font-bold text-lg">Đánh giá món ăn</span>
            </div>

            <div className="w-full sm:max-w-[800px] bg-white px-4 pt-3 pb-2 border-b border-gray-200 mx-auto">
                <div className="font-bungee text-xl font-extrabold">SCAN<span className="text-primary">2</span>DINE</div>
                <div className="text-xs text-gray-600 flex items-center gap-1">
                    <MdOutlinePlace size={15} />
                    23 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng
                </div>
            </div>

            <div className="w-full sm:max-w-[800px] flex-1 overflow-y-auto pb-4 mx-auto">
                {loading ? (
                    <div className="text-center py-8">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8">Không có đơn hàng nào để đánh giá.</div>
                ) : selectedOrderIdx === null ? (
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
                                        <span className="text-green-600 font-semibold text-sm mb-1">
                                            {reviewedOrders.includes(order._id) ? 'Đã đánh giá' : 'Hoàn thành'}
                                        </span>
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
                                            {reviewData[selectedOrder._id]?.[item._id]?.date && (
                                                <div className="text-xs text-blue-500 mt-1">
                                                    Ngày đánh giá: {new Date(reviewData[selectedOrder._id][item._id].date).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-gray-500">Đánh giá món ăn:</span>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <FaStar
                                                    key={star}
                                                    className={`cursor-pointer ${reviewData[selectedOrder._id]?.[item._id]?.rating >= star ? 'text-yellow-400' : 'text-gray-300'} ${reviewedOrders.includes(selectedOrder._id) ? 'cursor-not-allowed' : ''}`}
                                                    onClick={() => {
                                                        if (!reviewedOrders.includes(selectedOrder._id)) {
                                                            handleStarClick(selectedOrder._id, item._id, star)
                                                        }
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="mt-1">
                                            <textarea
                                                className={`w-full border rounded p-2 text-xs ${reviewedOrders.includes(selectedOrder._id) ? 'text-gray-400 bg-gray-100' : ''}`}
                                                rows={2}
                                                placeholder="Hãy chia sẻ nhận xét cho món ăn này bạn nhé! (Tối đa 500 ký tự)"
                                                value={reviewData[selectedOrder._id]?.[item._id]?.comment || ''}
                                                onChange={e => {
                                                    if (!reviewedOrders.includes(selectedOrder._id)) {
                                                        handleCommentChange(selectedOrder._id, item._id, e.target.value)
                                                    }
                                                }}
                                                maxLength={500}
                                                disabled={reviewedOrders.includes(selectedOrder._id)}
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
                        <div className="flex justify-end items-center px-4 py-3 border-t">
                            <span className="font-semibold mr-2">Tổng tiền ({selectedOrder.orderdetail?.length || 0} món ăn):</span>
                            <span className="font-bold text-primary text-lg">{formatCurrency(selectedOrder.total_amount || selectedOrder.total || 0)}</span>
                        </div>
                        <div className="px-4 py-3 border-t flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={anonymous}
                                        onChange={() => setAnonymous(val => !val)}
                                        className="accent-primary"
                                        disabled={reviewedOrders.includes(selectedOrder._id)}
                                    />
                                    Đánh giá ẩn danh
                                </label>
                            </div>
                            <div className="flex gap-3 mt-2">
                                <button
                                    className="flex-1 py-2 border border-gray-400 rounded text-gray-700 hover:bg-gray-100"
                                    onClick={() => setSelectedOrderIdx(null)}
                                    disabled={submitting}
                                >
                                    Hủy
                                </button>
                                <button
                                    className="flex-1 py-2 bg-primary text-white rounded font-semibold hover:bg-red-700 disabled:bg-gray-400"
                                    onClick={handleSendReview}
                                    disabled={submitting || reviewedOrders.includes(selectedOrder._id)}
                                >
                                    {reviewedOrders.includes(selectedOrder._id) ? "Đã đánh giá" : (submitting ? "Đang gửi..." : "Gửi đánh giá")}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="w-full sm:max-w-[800px] mx-auto">
                <Footer />
            </div>
        </div>
    );
};

export default ReviewProduct;
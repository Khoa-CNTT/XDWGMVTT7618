import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../server/api';

const MAX_COMMENT_LENGTH = 500;

const C_ProductReviewForm = ({
    customerId,
    onSuccess,
    onCancel,
}) => {
    const [step, setStep] = useState(1); // 1: select order, 2: select product, 3: review
    const [paidOrders, setPaidOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    // Review states
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Fetch paid orders when step 1 and customerId is available
    useEffect(() => {
        const fetchPaidOrders = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/s2d/order/paid/${customerId}`);
                setPaidOrders(res.data || []);
            } catch (err) {
                setPaidOrders([]);
            }
            setLoading(false);
        };
        if (step === 1 && customerId) fetchPaidOrders();
    }, [customerId, step]);

    // Filter orders by search
    const filteredOrders = paidOrders
        .sort((a, b) => new Date(b.od_date) - new Date(a.od_date))
        .filter(order =>
            (order.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (order.table?.tb_number || '').toString().includes(search) ||
            (order._id || '').toLowerCase().includes(search.toLowerCase())
        );

    // Handle review submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (rating < 1 || rating > 5) {
            setError('Vui lòng chọn số sao từ 1 đến 5.');
            return;
        }
        if (comment.length > MAX_COMMENT_LENGTH) {
            setError('Nhận xét không được vượt quá 500 ký tự.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/s2d/review', {
                products: selectedProduct._id,
                customer: customerId,
                rating,
                comment,
            });
            setSuccess('Đánh giá đã được gửi!');
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 1200);
        } catch (err) {
            setError('Đã có lỗi xảy ra, vui lòng thử lại.');
        }
        setLoading(false);
    };

    // Reset when going back
    const handleBackToOrders = () => {
        setSelectedOrder(null);
        setStep(1);
    };
    const handleBackToProducts = () => {
        setSelectedProduct(null);
        setStep(2);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 border border-gray-200 relative">
                <button
                    className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
                    onClick={onCancel}
                    disabled={loading}
                >
                    &times;
                </button>
                {/* Show error if no customerId */}
                {!customerId && (
                    <div className="text-center text-red-500 mb-4">
                        Không tìm thấy thông tin khách hàng. Vui lòng đăng nhập lại.
                    </div>
                )}

                {/* Step 1: Select paid order */}
                {customerId && step === 1 && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-primary text-center">Chọn đơn hàng đã thanh toán</h2>
                        <input
                            type="text"
                            className="w-full mb-4 p-2 border rounded focus:ring-2 focus:ring-primary"
                            placeholder="Tìm kiếm theo tên khách, số bàn, mã đơn..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                        <div className="max-h-[350px] overflow-y-auto space-y-3">
                            {loading ? (
                                <div className="text-center text-gray-500">Đang tải...</div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-gray-500 text-center">Không tìm thấy đơn hàng phù hợp.</div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div
                                        key={order._id}
                                        className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setStep(2);
                                        }}
                                    >
                                        <div>
                                            <div className="font-semibold text-primary">Đơn #{order._id.slice(-6).toUpperCase()}</div>
                                            <div className="text-sm text-gray-700">
                                                Khách: <span className="font-medium">{order.customer?.name || 'Ẩn danh'}</span>
                                            </div>
                                            <div className="text-sm text-gray-700">
                                                Bàn: <span className="font-medium">{order.table?.tb_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                                            Ngày: {(order.od_date || order.updatedAt)?.slice(0, 10)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <button
                            className="mt-6 w-full py-2 bg-gray-200 rounded hover:bg-gray-300"
                            onClick={onCancel}
                        >
                            Đóng
                        </button>
                    </>
                )}

                {/* Step 2: Select product */}
                {customerId && step === 2 && selectedOrder && (
                    <>
                        <h2 className="text-xl font-bold mb-4 text-primary text-center">Chọn món để đánh giá</h2>
                        <div className="max-h-[350px] overflow-y-auto space-y-3">
                            {selectedOrder.orderdetail && selectedOrder.orderdetail.length > 0 ? (
                                selectedOrder.orderdetail.map((item) => (
                                    <div
                                        key={item._id}
                                        className="border rounded-lg p-4 flex items-center gap-4 hover:bg-gray-50 transition cursor-pointer"
                                        onClick={() => {
                                            setSelectedProduct(item.products);
                                            setStep(3);
                                        }}
                                    >
                                        <img
                                            src={item.products.image}
                                            alt={item.products.pd_name}
                                            className="w-16 h-16 object-cover rounded-full border-2 border-primary shadow"
                                        />
                                        <div>
                                            <div className="font-semibold text-primary">{item.products.pd_name}</div>
                                            <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center">Đơn hàng này không có món nào để đánh giá.</div>
                            )}
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button
                                className="w-1/2 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={handleBackToOrders}
                            >
                                Quay lại
                            </button>
                            <button
                                className="w-1/2 py-2 bg-gray-100 rounded hover:bg-gray-200"
                                onClick={onCancel}
                            >
                                Đóng
                            </button>
                        </div>
                    </>
                )}

                {/* Step 3: Review form */}
                {customerId && step === 3 && selectedProduct && (
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col items-center mb-4">
                            {selectedProduct.image && (
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.pd_name}
                                    className="w-20 h-20 object-cover rounded-full border-2 border-primary mb-2 shadow"
                                />
                            )}
                            <h2 className="text-xl font-bold text-primary mb-1">{selectedProduct.pd_name}</h2>
                        </div>
                        <div className="flex items-center justify-center mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    type="button"
                                    key={star}
                                    className="focus:outline-none"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHover(star)}
                                    onMouseLeave={() => setHover(0)}
                                >
                                    <FaStar
                                        size={36}
                                        className={`transition-colors duration-150 ${star <= (hover || rating)
                                            ? 'text-yellow-400 drop-shadow'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-primary focus:outline-none transition"
                            rows={4}
                            maxLength={MAX_COMMENT_LENGTH}
                            placeholder="Nhận xét của bạn (tối đa 500 ký tự)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <div className="flex justify-between items-center mt-2">
                            <button
                                type="button"
                                className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                                onClick={handleBackToProducts}
                                disabled={loading}
                            >
                                Quay lại
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-red-600 transition"
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                        {error && <div className="text-red-500 mt-3 text-center">{error}</div>}
                        {success && <div className="text-green-600 mt-3 text-center">{success}</div>}
                    </form>
                )}
            </div>
        </div>
    );
};

export default C_ProductReviewForm;
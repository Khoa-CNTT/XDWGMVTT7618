import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import api from '../server/api';

const MAX_COMMENT_LENGTH = 500;

const C_ProductReviewForm = ({ product, orderId, customerId, onSuccess, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                products: product._id,
                customer: customerId,
                rating,
                comment,
            });
            setSuccess('Đánh giá đã được gửi!');
            if (onSuccess) onSuccess();
        } catch (err) {
            setError('Đã có lỗi xảy ra, vui lòng thử lại.');
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-2">Đánh giá món: {product.pd_name}</h2>
            <div className="flex items-center mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                        key={star}
                        size={28}
                        className={`cursor-pointer ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    />
                ))}
            </div>
            <textarea
                className="w-full border rounded p-2 mb-2"
                rows={4}
                maxLength={MAX_COMMENT_LENGTH}
                placeholder="Nhận xét của bạn (tối đa 500 ký tự)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            <div className="flex justify-between items-center">
                <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600"
                    disabled={loading}
                >
                    Gửi đánh giá
                </button>
            </div>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
        </form>
    );
};

export default C_ProductReviewForm;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import FlyItem from './C_FlyItem';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';
import { registerSocketListeners, cleanupSocketListeners } from '../services/socketListeners';
import { useNavigate } from 'react-router-dom';

function ProductDetail({ product, onClose, fetchCart, setShowDetail }) {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [flyingItems, setFlyingItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const buttonRef = useRef(null);

    // Lấy dữ liệu của người dùng hiện tại một cách an toàn
    const customer = sessionStorage.getItem('customer')
        ? JSON.parse(sessionStorage.getItem('customer'))
        : null;

    // Debounce thông báo để tránh spam
    const debouncedToast = useCallback(
        debounce((message, type = 'info') => {
            toast[type](message);   
        }, 1000),
        []
    );

    // Tăng số lượng
    const handleIncrement = useCallback(() => {
        setQuantity((prev) => prev + 1);
    }, []);

    // Giảm số lượng
    const handleDecrement = useCallback(() => {
        setQuantity((prev) => Math.max(1, prev - 1));
    }, []);

    // Thêm vào giỏ hàng với số lượng và ghi chú
    const handleAddToCartInDetail = useCallback(async () => {
        if (!customer || !customer.cart) {
            debouncedToast('Vui lòng đăng nhập để thêm vào giỏ hàng!', 'error');
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/s2d/cartdetail', {
                cart: customer.cart,
                products: product._id,
                quantity: quantity,
                note: note || undefined, // Gửi note nếu có, nếu không để undefined
            });
            fetchCart();
            setShowDetail(false);

            // Thêm hiệu ứng fly item (giả định lấy tọa độ từ buttonRef)
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const startPosition = {
                x: buttonRect.left + buttonRect.width / 2,
                y: buttonRect.top + buttonRect.height / 2,
            };
            const endPosition = { x: window.innerWidth * 0.2, y: window.innerHeight * 0.2 }; // Giả định vị trí giỏ hàng
            setFlyingItems((prev) => [
                ...prev,
                { id: Date.now(), imageUrl: `${process.env.REACT_APP_API_URL}/${product.image}`, startPosition, endPosition },
            ]);

            debouncedToast('Thêm vào giỏ hàng thành công!', 'success');
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            debouncedToast('Thêm vào giỏ hàng thất bại. Vui lòng thử lại!', 'error');
        } finally {
            setLoading(false);
        }
    }, [customer, product._id, quantity, note, fetchCart, setShowDetail, debouncedToast, navigate]);

    // Xóa item bay khi hoàn thành hiệu ứng
    useEffect(() => {
        if (flyingItems.length > 0) {
            const timer = setTimeout(() => {
                setFlyingItems((prev) => prev.filter((item) => item.id !== flyingItems[0].id));
            }, 1000); // Thời gian hiệu ứng (1 giây)
            return () => clearTimeout(timer);
        }
    }, [flyingItems]);

    // Đăng ký socket listeners
    useEffect(() => {
        if (!customer || !customer.cart) {
            return;
        }

        registerSocketListeners({
            customer: { cart: customer.cart },
            CartDetailAdded: (data) => {
                if (data.cartId === customer.cart) {
                    fetchCart();
                    debouncedToast('Đã thêm món mới vào giỏ hàng!', 'success');
                }
            },
            CartDetailUpdated: (data) => {
                if (data.cartId === customer.cart) {
                    fetchCart();
                    debouncedToast('Chi tiết giỏ hàng đã được cập nhật!', 'info');
                }
            },
            CartDetailDeleted: (data) => {
                if (data.cartId === customer.cart) {
                    fetchCart();
                    debouncedToast('Đã xóa món khỏi giỏ hàng!', 'info');
                }
            },
        });

        return () => {
            cleanupSocketListeners();
        };
    }, [customer, fetchCart, debouncedToast]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-3xl w-[90%] max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-black text-xl font-medium capitalize">{product.pd_name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
                        <FaTimes size={20} />
                    </button>
                </div>

                <img
                    src={`${process.env.REACT_APP_API_URL}/${product.image}`}
                    alt={product.pd_name}
                    className="product-detail-image w-[250px] h-[250px] object-cover rounded-3xl mx-auto mb-4"
                />

                <div className="mb-4">
                    <p className="text-primary text-xl font-medium mb-2">
                        {(parseInt(product.price) * quantity).toLocaleString()}đ
                    </p>
                    {product.description && (
                        <p className="text-gray-600 mb-3">{product.description}</p>
                    )}
                    <div className="text-gray-600">
                        <p>Bạn có nhắc gì với nhà bếp không?</p>
                        <textarea
                            className="w-full mt-2 p-3 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            rows="3"
                            placeholder="Ghi chú món ăn..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDecrement}
                            className="w-10 h-10 flex items-center justify-center border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-white transition-colors text-xl"
                            disabled={loading}
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-lg">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-xl"
                            disabled={loading}
                        >
                            +
                        </button>
                    </div>
                    <button
                        ref={buttonRef}
                        onClick={handleAddToCartInDetail}
                        className={`bg-primary text-white px-8 py-2.5 rounded-full hover:bg-primary/90 transition-colors ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loading}
                    >
                        {loading ? 'Đang xử lý...' : 'Thêm giỏ hàng'}
                    </button>
                </div>
            </div>
            {flyingItems.map((item) => (
                <FlyItem
                    key={item.id}
                    id={item.id}
                    imageUrl={item.imageUrl}
                    startPosition={item.startPosition}
                    endPosition={item.endPosition}
                />
            ))}
        </div>
    );
}

export default ProductDetail;
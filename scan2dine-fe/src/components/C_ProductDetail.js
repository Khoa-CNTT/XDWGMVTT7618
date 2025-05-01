import React, { useState, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import FlyItem from './C_FlyItem';
// import { addToCartDetail } from '../server/cartService';
import api from '../server/api';

function ProductDetail({ product, onClose, fetchCart, setShowDetail }) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [flyingItems, setFlyingItems] = useState([]);
    const buttonRef = useRef(null);

    //Lấy dữ liệu của người dùng hiện tại
    const customer = JSON.parse(sessionStorage.getItem("customer"));

    //Tăng số lượng
    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    //giảm số lượng
    const handleDecrement = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    //Thêm vào giỏ hàng vs số lượng đã chọn
    const handleAddToCartInDetail = async () => {
        try {
            const response = await api.post('/s2d/cartdetail', {
                cart: customer.cart,
                products: product._id,
                quantity: quantity
            });
            fetchCart();
            setShowDetail(false)

            console.log('Thêm vào giỏ hàng thành công:', response.data);
            // Optional: Hiển thị thông báo thành công cho người dùng
        } catch (error) {
            console.error('Lỗi khi thêm vào giỏ hàng:', error);
            // Optional: Hiển thị thông báo lỗi cho người dùng
        }
    };

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
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-lg">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-xl"
                        >
                            +
                        </button>
                    </div>
                    <button
                        ref={buttonRef}
                        onClick={handleAddToCartInDetail}
                        className="bg-primary text-white px-8 py-2.5 rounded-full hover:bg-primary/90 transition-colors">
                        Thêm giỏ hàng
                    </button>
                </div>
            </div>
            {flyingItems.map(item => (
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
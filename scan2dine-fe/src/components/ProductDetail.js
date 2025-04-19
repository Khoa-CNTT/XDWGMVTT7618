import React, { useState, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import FlyItem from './FlyItem';
import { addToCartDetail } from '../server/cartService';

function ProductDetail({ item, product, onClose, onAddToCart }) {
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [flyingItems, setFlyingItems] = useState([]);
    const buttonRef = useRef(null);

    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };

    const handleDecrement = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    const handleRemoveFlyingItem = (id) => {
        setFlyingItems(prev => prev.filter(item => item.id !== id));
    };

    const createFlyingEffect = async () => {
        const productImage = document.querySelector('.product-detail-image');
        const cartIcon = document.querySelector('.cart-icon');

        if (productImage && cartIcon) {

            try {
                // Add to cart once with the total quantity
                await addToCartDetail(product._id, quantity);

                // Create flying effect
                const imgRect = productImage.getBoundingClientRect();
                const cartRect = cartIcon.getBoundingClientRect();

                const startPosition = {
                    x: imgRect.left + (imgRect.width / 4),
                    y: imgRect.top + (imgRect.height / 4)
                };

                const endPosition = {
                    x: cartRect.left + (cartRect.width / 2),
                    y: cartRect.top + (cartRect.height / 2)
                };

                const id = Date.now();
                setFlyingItems(prev => [...prev, {
                    id,
                    imageUrl: `${process.env.REACT_APP_API_URL}/${product.image}`,
                    startPosition,
                    endPosition
                }]);

                setTimeout(() => {
                    onClose();
                }, 800);
            } catch (error) {
                console.error('Error adding to cart:', error);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-3xl w-[90%] max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[#C5A880] text-xl font-medium capitalize">{product.pd_name}</h3>
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
                        onClick={createFlyingEffect}
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
                    onAnimationEnd={handleRemoveFlyingItem}
                />
            ))}
        </div>
    );
}

export default ProductDetail;
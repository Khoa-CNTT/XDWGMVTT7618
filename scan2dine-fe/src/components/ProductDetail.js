import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

function ProductDetail({ product, onClose, onAddToCart }) {
    const [quantity, setQuantity] = useState(1);

    //Hàm cộng thêm số lượng
    const handleIncrement = () => {
        setQuantity(prev => prev + 1);
    };
    //Hàm trừ đi số lượng
    const handleDecrement = () => {
        setQuantity(prev => Math.max(1, prev - 1));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg w-[90%] max-w-md p-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-medium">{product.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                />

                <div className="mb-4">
                    <p className="text-primary text-xl font-medium mb-2">
                        {(product.price * quantity).toLocaleString()}đ
                    </p>
                    <div className="text-gray-600">
                        <p>Bạn có nhắc gì với nhà bếp không?</p>
                        <textarea
                            className="w-full mt-2 p-2 border rounded-lg resize-none"
                            rows="3"
                            placeholder="Ghi chú món ăn..."
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleDecrement}
                            className="w-8 h-8 flex items-center justify-center border border-primary text-primary rounded-full"
                        >
                            -
                        </button>
                        <span className="w-8 text-center">{quantity}</span>
                        <button
                            onClick={handleIncrement}
                            className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={() => {
                            onAddToCart({ ...product, quantity }, true); // Pass true to set exact quantity
                            onClose();
                        }}
                        className="bg-primary text-white px-6 py-2 rounded-lg"
                    >
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
import React from 'react';
import { FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const CartBar = ({ cart, totalItems, totalPrice }) => {
    const navigate = useNavigate();
    
    return (
        <div className="fixed bottom-4 left-4 z-40">
            <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4">
                <div className="bg-white border-t border-gray-200 shadow-lg p-4 flex items-center justify-between w-full max-w-[800px] rounded-t-lg">
                    <div className="cart-icon flex items-center gap-2">
                        <FaShoppingCart id="cart-icon" className="text-primary relative" />
                        <span className="text-sm font-medium">{totalItems} món</span>
                        <span className="text-sm font-semibold text-primary">
                            {totalPrice.toLocaleString()}đ
                        </span>
                    </div>
                    <button 
                        onClick={() => navigate('/cartdetail')}
                        className="bg-primary text-white rounded-full px-4 py-2 shadow-md"
                    >
                        Xem giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartBar;
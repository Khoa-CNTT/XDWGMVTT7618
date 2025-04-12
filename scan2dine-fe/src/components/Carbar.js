import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const CartBar = ({ cart, totalItems, totalPrice }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-100 flex justify-center px-4">
            <div className="bg-white border-t border-gray-200 shadow-lg p-4 flex items-center justify-between w-full max-w-[800px] rounded-t-lg">
                <div className="flex items-center gap-2">
                    <FaShoppingCart className="text-primary" />
                    <span className="text-sm font-medium">{totalItems} món</span>
                    <span className="text-sm font-semibold text-primary">
                        {totalPrice.toLocaleString()}đ
                    </span>
                </div>
                <button className="bg-primary text-white px-4 py-1.5 rounded-full text-sm hover:bg-primary/90">
                    Xem giỏ hàng
                </button>
            </div>
        </div>
    );
};

export default CartBar;

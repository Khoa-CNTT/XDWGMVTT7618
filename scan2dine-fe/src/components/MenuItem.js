import React, { useState } from 'react'
import ProductDetail from './ProductDetail'
import { FaPlus } from "react-icons/fa";

export const MenuItem = ({ item, quantity, onRemoveFromCart, onAddToCart }) => {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <>
            <div className="bg-white p-2 relative mt-2 transition duration-300 hover:shadow-lg hover:scale-[1.02] rounded-lg">
                <div className="cursor-pointer p-3" onClick={() => setShowDetail(true)}>
                    <img
                        src={"http://localhost:5000/" + item.image}
                        alt={item.pd_name}
                        className="w-[127px] h-[127px] object-cover mx-auto rounded-md"
                    />

                    {/* Bọc phần text trong flex column để căn dưới */}
                    <div className="mt-2 flex flex-col justify-between h-[72px]">
                        <h3 className="font-medium text-sm capitalize line-clamp-2 leading-snug">
                            {item.pd_name}
                        </h3>

                        <p className="text-primary text-sm font-medium mt-auto">
                            {parseInt(item.price).toLocaleString()}đ
                        </p>
                    </div>
                </div>


                <button
                    className="w-6 h-6 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-primary flex items-center justify-center shadow-sm absolute bottom-3 right-3 hover:bg-primary/90 transition-colors"
                    onClick={() => onAddToCart(item)}

                >
                    <FaPlus className="text-white w-[60%] h-[60%]" />
                </button>
            </div>

            {showDetail && (
                <div className="fixed inset-1 z-50 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
                    <ProductDetail
                        product={item}
                        onClose={() => setShowDetail(false)}
                        onAddToCart={onAddToCart}
                    />
                </div>
            )}
        </>
    )
}

export default MenuItem
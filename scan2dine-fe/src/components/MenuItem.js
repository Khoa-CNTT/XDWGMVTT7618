import React, { useState } from 'react'
import ProductDetail from './ProductDetail'

export const MenuItem = ({ item, quantity, onRemoveFromCart, onAddToCart }) => {
    const [showDetail, setShowDetail] = useState(false);

    return (
        <>
            <div className="bg-white rounded-lg p-2 relative mt-2">
                <div className="cursor-pointer p-3" onClick={() => setShowDetail(true)}>
                    <img
                        src="http://localhost:5000/image/1744203202617-IMG_0050.JPG"
                        alt={item.pd_name}
                    />

                    <h3 className="font-medium mb-0.5 text-sm">{item.pd_name}</h3>
                    <p className="text-primary text-sm">
                        {parseInt(item.price).toLocaleString()}đ
                    </p>
                    {item.description && (
                        <p className="text-gray-500 text-xs">{item.description}</p>
                    )}
                </div>

                <div className="absolute bottom-2 right-2 flex items-center gap-2">
                    {quantity > 0 ? (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemoveFromCart(item);
                                }}
                                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center border border-primary text-primary rounded-full"
                            >
                                -
                            </button>
                            <span className="text-primary font-medium">{quantity}</span>
                        </>
                    ) : null}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(item, false);
                        }}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center bg-primary text-white rounded-full"
                    >
                        +
                    </button>
                </div>
            </div>

            {showDetail && (
                <ProductDetail
                    product={item}
                    onClose={() => setShowDetail(false)}
                    onAddToCart={onAddToCart}
                />
            )}
        </>
    )
}

export default MenuItem
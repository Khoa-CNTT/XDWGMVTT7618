import React from 'react'

const formatPrice = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const C_OrderDetailItem = ({ item, renderStatusBadge }) => {
    const imageUrl = item.image;
    return (
        <div className="p-4 flex items-center gap-3">
            <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                    </div>
                )}
            </div>

            <div className="flex-1">
                <div className="flex justify-between">
                    <h4 className="font-medium">{item.name}</h4>
                    <span className="font-semibold text-primary">{formatPrice(item.price)}</span>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                        <span className="text-sm">SL: {item.quantity}</span>
                        <span className="mx-2 text-gray-400">|</span>
                        {renderStatusBadge(item.status)}
                    </div>

                    <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                    </span>
                </div>

                {item.note && (
                    <div className="mt-1 text-sm italic text-gray-600">
                        <span className="font-medium">Ghi chú:</span> {item.note}
                    </div>
                )}
            </div>
        </div>
    );
};

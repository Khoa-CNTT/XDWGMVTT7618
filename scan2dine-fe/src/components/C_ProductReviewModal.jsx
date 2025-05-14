import React, { useState } from 'react';
import C_ProductReviewForm from './C_ProductReviewForm';

const C_ProductReviewModal = ({ completedItems, orderId, customerId, onClose }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Chọn món để đánh giá</h2>
        {!selectedProduct ? (
          <>
            {completedItems.length === 0 ? (
              <div>Bạn chưa có món nào để đánh giá.</div>
            ) : (
              <ul>
                {completedItems.map((item) => (
                  <li key={item.id} className="mb-2">
                    <button
                      className="px-4 py-2 bg-primary text-white rounded hover:bg-red-600"
                      onClick={() => setSelectedProduct(item)}
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="mt-4 px-4 py-2 bg-gray-200 rounded" onClick={onClose}>
              Đóng
            </button>
          </>
        ) : (
          <C_ProductReviewForm
            product={selectedProduct}
            orderId={orderId}
            customerId={customerId}
            onSuccess={() => setSelectedProduct(null)}
            onCancel={() => setSelectedProduct(null)}
          />
        )}
      </div>
    </div>
  );
};

export default C_ProductReviewModal;
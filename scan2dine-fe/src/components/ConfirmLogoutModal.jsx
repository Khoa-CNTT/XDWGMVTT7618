// src/components/ConfirmLogoutModal.jsx
import React from 'react';

const ConfirmLogoutModal = ({ onCancel, onConfirm }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm transform scale-95 animate-zoomIn">
                <div className="flex flex-col items-center">
                    {/* Icon cảnh báo */}
                    {/* <div className="text-red-500 mb-3 text-4xl">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 5.07l13.86 13.86M12 2a10 10 0 100 20 10 10 0 000-20z" />
                        </svg>
                    </div> */}

                    {/* Tiêu đề */}
                    <h2 className="text-lg font-bold text-center mb-4 text-gray-800">
                        Bạn có chắc chắn muốn thoát?
                    </h2>

                    {/* Nút hành động */}
                    <div className="flex justify-center gap-4 w-full">
                        <button
                            className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg transition duration-150"
                            onClick={onCancel}
                        >
                            Huỷ
                        </button>
                        <button
                            className="w-1/2 bg-primary hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition duration-150"
                            onClick={onConfirm}
                        >
                            Thoát
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ConfirmLogoutModal;

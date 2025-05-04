import React from 'react'

export const C_ConfirmCallStaff = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-lg p-6 w-96 max-w-full">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Đã hiểu
                    </button>
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primaryHover"
                    >
                        Hủy yêu cầu
                    </button>
                </div>
            </div>
        </div>
    )
}

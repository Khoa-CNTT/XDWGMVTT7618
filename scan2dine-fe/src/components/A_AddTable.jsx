import React from 'react';

export const A_AddTable = ({ newTable, setNewTable, setShowAddModal, handleAddTable }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Thêm bàn mới</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowAddModal(false)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên bàn</label>
                        <input
                            type="text"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={newTable.name}
                            onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vị trí</label>
                        <select
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={newTable.location}
                            onChange={(e) => setNewTable({ ...newTable, location: e.target.value })}
                        >
                            <option value="">Chọn khu vực</option>
                            <option value="Khu vực A">Khu vực A</option>
                            <option value="Khu vực B">Khu vực B</option>
                            <option value="Khu vực C">Khu vực C</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                            onClick={() => setShowAddModal(false)}
                        >
                            Hủy
                        </button>
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            onClick={handleAddTable}
                        >
                            Thêm bàn
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

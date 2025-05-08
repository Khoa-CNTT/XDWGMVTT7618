import React, { useEffect, useState } from 'react'
import { FaEdit, FaCheck } from 'react-icons/fa';
import api from '../server/api';

export const A_ModalCUUser = ({
    isEditing,
    currentUser,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
}) => {

    //hàm chứa dữ liệu role
    const roles = [{ _id: "67fccd928de55697fbc965a9", role_name: "1" }, { _id: "67fdd1582dea67c40c432609", role_name: "2" }, { _id: "6801d910e28d9b75cccdeffa", role_name: "3" }]


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                        <FaEdit size={20} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            name="full_name"
                            value={currentUser.full_name}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={currentUser.email}
                            onChange={handleInputChange}
                            placeholder="Nhập email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            name="username"
                            value={currentUser.username}
                            onChange={handleInputChange}
                            placeholder="Nhập username"
                            disabled={isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            value={currentUser.password}
                            onChange={handleInputChange}
                            placeholder="Nhập mật khẩu"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>



                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                            name="role_id"
                            value={currentUser?.role_id || ""}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {roles.map((role, index) => (
                                <option key={index}
                                    name="role_id"
                                    value={role._id}>
                                    {role.role_name === "1"
                                        ? "Nhân viên"
                                        : role.role_name === "2"
                                            ? "Chủ quầy"
                                            : role.role_name === "3"
                                                ? "Quản trị viên"
                                                : "Không xác định"}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                            <FaCheck size={18} className="mr-1" />
                            {isEditing ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}

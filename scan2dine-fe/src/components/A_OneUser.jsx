import React from 'react'
import { FaEdit, FaTrash } from 'react-icons/fa';

export const A_OneUser = ({ user, userToDelete, index, handleOpenModal, handleDelete, getRoleInfo, setShowConfirm, setUserToDelete }) => {
    return (
        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
            {/* STT */}
            <td className="py-3 px-4">{index + 1}</td>

            {/* ID */}
            <td className="py-3 px-4 uppercase">{user._id}</td>

            {/* Họ và tên */}
            <td className="py-3 px-4">{user.full_name}</td>

            {/* Tên đăng nhập */}
            <td className="py-3 px-4">{user.username}</td>
            {/* Email */}
            <td className="py-3 px-4">{user.email}</td>

            {/* Vai trò */}
            <td className="py-3 px-4">
                {(() => {
                    const role = getRoleInfo(user.role_id?.role_name);

                    return (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${role.color}`}>
                            {role.text}
                        </span>
                    );
                })()}
            </td>


            {/* Thao tác */}
            <td className="py-3 px-4">
                <div className="flex space-x-2">
                    <button
                        onClick={() => {
                            if (user.role_id?.role_name != 3) {
                                handleOpenModal(true, user);
                            }
                        }}
                        className={`${user.role_id?.role_name == 3
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800'
                            }`}
                        title="Chỉnh sửa"
                        disabled={user.role_id?.role_name == 3}
                    >
                        <FaEdit size={18} />
                    </button>

                    <button
                        onClick={() => {
                            if (user.role_id?.role_name != 3) {
                                // setUserToDelete(user);
                                // setShowConfirm(true);
                                handleDelete(user._id)
                            }
                        }}
                        className={`${user.role_id?.role_name == 3
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                            }`}
                        title="Xóa"
                        disabled={user.role_id?.role_name == 3}
                    >
                        <FaTrash size={18} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

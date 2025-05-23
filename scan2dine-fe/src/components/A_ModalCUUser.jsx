import React, { useEffect, useState } from 'react'
import { FaCheck } from 'react-icons/fa';
import { MdClose } from "react-icons/md";
import api from '../server/api';

export const A_ModalCUUser = ({
    isEditing,
    currentUser,
    handleCloseModal,
    handleInputChange,
    handleSubmit,
}) => {
    // State để lưu trữ thông báo lỗi
    const [errors, setErrors] = useState({});
    const [listUsername, setListUsername] = useState([]);

    useEffect(() => {
        const fetchListUsername = async () => {
            try {
                const getList = await api.get('/s2d/user/username');
                setListUsername(getList.data)

            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchListUsername();
    }, []);
    // Hàm chứa dữ liệu role
    const roles = [
        { _id: "67fccd928de55697fbc965a9", role_name: "1" },
        { _id: "67fdd1582dea67c40c432609", role_name: "2" },
        // { _id: "6801d910e28d9b75cccdeffa", role_name: "3" }
    ];

    // Hàm kiểm tra dữ liệu đầu vào
    const validateForm = () => {
        const newErrors = {};
        //họ và tên
        const fullName = currentUser.full_name?.trim() || '';
        if (!fullName) {
            newErrors.full_name = "Họ và tên là bắt buộc";
        } else if (fullName.length < 2 || fullName.length > 50) {
            newErrors.full_name = "Họ và tên phải từ 2 đến 50 ký tự";
        } else if (/\d/.test(fullName)) {
            newErrors.full_name = "Họ và tên không được chứa số";
        }

        //email
        if (!currentUser.email?.trim()) {
            newErrors.email = "Email là bắt buộc";
        } else if (currentUser.email.length > 40) {
            newErrors.email = "Email không được vượt quá 40 ký tự";
        } else if (!/\S+@\S+\.\S+/.test(currentUser.email)) {
            newErrors.email = "Email không hợp lệ";
        }


        //username
        const username = currentUser.username?.trim() || '';

        if (!isEditing && !username) {
            newErrors.username = "Tên đăng nhập là bắt buộc";
        } else if (username.length < 4 || username.length > 30) {
            newErrors.username = "Tên đăng nhập phải từ 4 đến 30 ký tự";
        } else if (/\s/.test(username)) {
            newErrors.username = "Tên đăng nhập không được chứa khoảng trắng";
        } else if (!/^[a-zA-Z0-9._]+$/.test(username)) {
            newErrors.username = "Tên đăng nhập không được chứa ký tự đặc biệt";
        } else if (/^\d+$/.test(username)) {
            newErrors.username = "Tên đăng nhập không được phép chỉ gồm số";
        } else if (!isEditing && listUsername.includes(username)) {
            newErrors.username = "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác";
        }


        if (!isEditing && !currentUser.password?.trim()) {
            newErrors.password = "Mật khẩu là bắt buộc";
        }
        if (!currentUser.role_id) {
            newErrors.role_id = "Vui lòng chọn một vai trò";
        }
        return newErrors;
    };

    // Hàm xử lý khi submit
    const onSubmit = () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setErrors({});
        handleSubmit();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isEditing ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
                    </h2>
                    <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                        <MdClose size={25} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className='text-red-600'>*</span></label>
                        <input
                            type="text"
                            name="full_name"
                            value={currentUser.full_name || ''}
                            onChange={handleInputChange}
                            placeholder="Nhập họ và tên"
                            className={`w-full px-3 py-2 border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className='text-red-600'>*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={currentUser.email || ''}
                            onChange={handleInputChange}
                            placeholder="Nhập email"
                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập <span className='text-red-600'>*</span></label>
                        <input
                            type="text"
                            name="username"
                            value={currentUser.username || ''}
                            onChange={handleInputChange}
                            placeholder="Nhập username"
                            disabled={isEditing}
                            className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className='text-red-600'>*</span></label>
                        <input
                            type="password"
                            name="password"
                            value={currentUser.password || ''}
                            onChange={handleInputChange}
                            placeholder="Nhập mật khẩu"
                            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò <span className='text-red-600'>*</span></label>
                        <select
                            name="role_id"
                            value={currentUser?.role_id || ""} onChange={handleInputChange}
                            className={`w-full px-3 py-2 border ${errors.role_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="">Chọn vai trò</option>
                            {roles.map((role, index) => (
                                <option key={index} value={role._id}>
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
                        {errors.role_id && <p className="text-red-500 text-sm mt-1">{errors.role_id}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={handleCloseModal}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={onSubmit}
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
import { useEffect, useState } from 'react';
import {
    FaTrash,
    FaEdit,
    FaUserPlus,
    FaSearch,
    FaTimes,
    FaCheck,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import api from '../server/api';



export default function UserManagementSystem() {
    const [users, setUsers] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({ _id: null, full_name: '', username: '', role_name: 'User' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');

    const availableRoles = ['Admin', 'Editor', 'User'];

    //Lấy dữ liệu từ data User
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const getUsers = await api.get('/s2d/user');
                setUsers(getUsers.data);

            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchUser();
    }, []);


    const resetForm = () => {
        setCurrentUser({ _id: null, full_name: '', username: '', role_name: 'User' });
        setIsEditing(false);
    };

    const handleOpenModal = (editing = false, user = null) => {
        if (editing && user) {
            setCurrentUser({ ...user });
            setIsEditing(true);
        } else {
            resetForm();
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentUser({ ...currentUser, [name]: value });
    };

    const handleSubmit = () => {
        if (!currentUser.fullName || !currentUser.username) return;

        if (isEditing) {
            setUsers(users.map(user => user.id === currentUser.id ? currentUser : user));
        } else {
            const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
            setUsers([...users, { ...currentUser, id: newId }]);
        }

        handleCloseModal();
    };

    const handleDelete = (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            setUsers(users.filter(user => user.id !== id));
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortField === 'id') {
            return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
        } else {
            const valueA = a[sortField].toLowerCase();
            const valueB = b[sortField].toLowerCase();
            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }
    });

    return (
        <div className="bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý người dùng</h1>

                    {/* Search and Add */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
                        <div className="relative w-full md:w-64">
                            <input
                                type="text"
                                placeholder="Tìm kiếm người dùng..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute left-3 top-2.5 text-gray-400">
                                <FaSearch size={18} />
                            </div>
                        </div>
                        <button
                            onClick={() => handleOpenModal()}
                            className="w-full md:w-auto flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FaUserPlus size={18} className="mr-2" />
                            Thêm người dùng
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200">
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center">
                                            STT
                                            {sortField === 'id' && (
                                                sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('fullName')}
                                    >
                                        <div className="flex items-center">
                                            Họ Và Tên
                                            {sortField === 'full_name' && (
                                                sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('username')}
                                    >
                                        <div className="flex items-center">
                                            Tên Đăng Nhập
                                            {sortField === 'username' && (
                                                sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                            )}
                                        </div>
                                    </th>
                                    <th
                                        className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                        onClick={() => handleSort('role')}
                                    >
                                        <div className="flex items-center">
                                            Vai Trò
                                            {sortField === 'role' && (
                                                sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                            )}
                                        </div>
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedUsers.length > 0 ? (
                                    sortedUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
                                            <td className="py-3 px-4">{user._id}</td>
                                            <td className="py-3 px-4">{user.full_name}</td>
                                            <td className="py-3 px-4">{user.username}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role_name === '3'
                                                    ? 'bg-red-100 text-red-800'
                                                    : user.role === '2'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role_name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleOpenModal(true, user)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FaEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Xóa"
                                                    >
                                                        <FaTrash size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-gray-500">
                                            Không tìm thấy người dùng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
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
                                    name="fullName"
                                    value={currentUser.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Nhập họ và tên"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={currentUser.username}
                                    onChange={handleInputChange}
                                    placeholder="Nhập username"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    name="role"
                                    value={currentUser.role}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {availableRoles.map(role => (
                                        <option key={role} value={role}>{role}</option>
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
            )}
        </div>
    );
}
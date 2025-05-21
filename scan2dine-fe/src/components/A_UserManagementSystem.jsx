import { useEffect, useState } from 'react';
import {
    FaUserPlus,
    FaSearch,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import api from '../server/api';
import { A_OneUser } from './A_OneUser';
import { A_ModalCUUser } from './A_ModalCUUser';
import ConfirmModal from './ConfirmModal';



export default function UserManagementSystem() {
    const [users, setUsers] = useState([]);

    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState({ full_name: '', username: '', role_id: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('id');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showConfirm, setShowConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);





    //Lấy dữ liệu từ data User
    useEffect(() => {
        fetchUser();
    }, []);
    const fetchUser = async () => {
        try {
            const getUsers = await api.get('/s2d/user');
            setUsers(getUsers.data);
        } catch (error) {
            console.error('Lỗi khi tải danh mục sản phẩm:', error);
        }
    };


    const resetForm = () => {
        setCurrentUser({ full_name: '', email: '', password: '', username: '', role_id: '' });
        setIsEditing(false);
    };

    const handleOpenModal = (editing = false, user = null) => {
        if (editing && user) {
            setCurrentUser({
                ...user,
                role_id: typeof user.role_id === 'object' ? user.role_id._id : user.role_id,
            }); setIsEditing(true);
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

        setCurrentUser((prev) => ({
            ...prev,
            [name]: value, // luôn là string
        }));
    };



    //
    const handleSubmit = async () => {
        if (!currentUser.full_name || !currentUser.username) return;

        try {
            if (isEditing) {
                await api.patch(`/s2d/user/${currentUser._id}`, currentUser);
            } else {
                await api.post('/s2d/user/register', currentUser);
            }

            fetchUser();
            handleCloseModal();
        } catch (error) {
            console.error('Lỗi khi lưu người dùng:', error);
        }
    };


    const handleDelete = async (id) => {
        try {
            await api.delete(`/s2d/user/${id}`);
            fetchUser()
        } catch (error) {

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
        user.role_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedUsers = [...filteredUsers].sort((a, b) => {
        if (sortField === 'id') {
            return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
        }
        else {
            const valueA = a[sortField].toLowerCase();
            const valueB = b[sortField].toLowerCase();
            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }
    });

    //custom roll name
    const getRoleInfo = (roleName) => {
        const roleMap = {
            '1': { text: 'Nhân Viên', color: 'bg-blue-100 text-blue-800' },
            '2': { text: 'Chủ Quầy', color: 'bg-green-100 text-green-800' },
            '3': { text: 'Quản Trị Viên', color: 'bg-red-100 text-red-800' },
        };

        return roleMap[roleName] || { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    };


    return (
        <div className=" mx-auto bg-white rounded-lg shadow">
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
                        className="w-full md:w-auto flex items-center justify-center bg-primary hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FaUserPlus size={18} className="mr-2" />
                        Thêm người dùng
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="w-full border-collapse shadow-xl">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        STT

                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('_id')}
                                >
                                    <div className="flex items-center">
                                        UID
                                        {sortField === '_id' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                    onClick={() => handleSort('full_name')}
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
                                    onClick={() => handleSort('email')}
                                >
                                    <div className="flex items-center">
                                        Email
                                        {sortField === 'email' && (
                                            sortDirection === 'asc' ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />
                                        )}
                                    </div>
                                </th>
                                <th
                                    className="text-left py-3 px-4 font-semibold text-sm text-gray-600 cursor-pointer"
                                >
                                    <div className="flex items-center">
                                        Vai Trò
                                    </div>
                                </th>
                                <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.length > 0 ? (
                                sortedUsers.map((user, index) => (
                                    <A_OneUser
                                        key={user._id}
                                        user={user}
                                        index={index}
                                        handleOpenModal={handleOpenModal}
                                        handleDelete={handleDelete}
                                        getRoleInfo={getRoleInfo}
                                        setShowConfirm={setShowConfirm}
                                        setUserToDelete={setUserToDelete}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-gray-500">
                                        Không tìm thấy người dùng nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </table>
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <A_ModalCUUser
                    isEditing={isEditing}
                    currentUser={currentUser}
                    handleCloseModal={handleCloseModal}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                />)}
            {showConfirm && (
                <ConfirmModal
                    title="Xóa user"
                    message="Bạn có chắc chắn muốn xóa user này không?"
                    onConfirm={() => {
                        if (userToDelete) {
                            handleDelete(userToDelete._id);
                            setShowConfirm(false);
                        }
                    }}
                    onCancel={() => setShowConfirm(false)}
                />
            )

            }
        </div>


    );
}
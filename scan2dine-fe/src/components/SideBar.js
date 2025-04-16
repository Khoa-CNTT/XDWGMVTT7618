import React from 'react'
import {
    FaChevronDown,
    FaUser,
    FaSignInAlt,
    FaFileAlt,
    FaHome,
    FaList
} from 'react-icons/fa';
export const SideBar = ({ currentPage, setCurrentPage }) => {
    return (
        <div className="w-64 bg-gray-900 text-white">
            <div className="p-4 flex items-center">
                <span className="text-xl font-extrabold">Quản trị <br /> <span className="text-white font-bungee">SCAN<span className='text-primary'>2</span><span>DINE</span> </span></span>
            </div>

            <div className="mt-6">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400">TỔNG QUAN</div>
                <div className="mt-2">
                    <a
                        href="#"
                        className={`flex items-center px-4 py-3 ${currentPage === 'tổng quan hệ thống' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        onClick={() => setCurrentPage('tổng quan hệ thống')}
                    >
                        <FaHome size={16} className="mr-3" />
                        <span>Tổng quan hệ thống</span>
                    </a>
                </div>

                <div className="mt-6 px-4 py-2 text-xs font-semibold text-gray-400">QUẢN LÝ</div>
                <div className="mt-2">
                    <a
                        href="#"
                        className={`flex items-center px-4 py-3 ${currentPage === 'quản lý bàn' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        onClick={() => setCurrentPage('quản lý bàn')}
                    >
                        <FaFileAlt size={16} className="mr-3" />
                        <span>Bàn</span>
                    </a>
                    <a href="#" className={`flex items-center px-4 py-3 ${currentPage === 'Quản Lý Bàn' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <FaFileAlt size={16} className="mr-3" />
                        <span>Nhân viên</span>
                    </a>
                    <a href="#" className={`flex items-center px-4 py-3 ${currentPage === 'Quản Lý Bàn' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <FaUser size={16} className="mr-3" />
                        <span>Chủ quầy</span>
                    </a>
                    <a href="#" className={`flex items-center px-4 py-3 ${currentPage === 'Quản Lý Bàn' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <FaSignInAlt size={16} className="mr-3" />
                        <span>Login</span>
                    </a>
                    <a href="#" className={`flex items-center px-4 py-3 ${currentPage === 'quản lý bàn' ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`}>
                        <div className="flex items-center">
                            <FaList size={16} className="mr-3" />
                            <span>Submenus</span>
                        </div>
                        <FaChevronDown size={12} />
                    </a>
                </div>
            </div>
        </div >
    )
}

import React from 'react';
import {
    FaUser,
    FaSignInAlt,
    FaHome, FaStore, FaCoins
} from 'react-icons/fa';
import { MdTableRestaurant, MdFastfood } from "react-icons/md";
import { IoMdCash } from "react-icons/io";

import { NavLink, useNavigate } from 'react-router-dom';

export const A_SideBar = ({ setCurrentPage }) => {

    const navigate = useNavigate();

    const linkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 ${isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-gray-800'}`;


    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="w-64 bg-gray-900 text-white h-screen overflow-y-auto">
            <div className="p-4 flex items-center">
                <span className="text-xl font-extrabold">
                    Quản trị <br />
                    <span className="text-white font-bungee">
                        SCAN<span className='text-primary'>2</span><span>DINE</span>
                    </span>
                </span>
            </div>

            <div className="mt-6">
                {/* TỔNG QUAN */}
                <div className="px-4 py-2 text-xs font-semibold text-gray-400">TỔNG QUAN</div>
                <div className="mt-2">
                    <NavLink to="/admin/dashboard" className={linkClass}>
                        <FaHome size={16} className="mr-3" />
                        <span>Tổng Quan Hệ Thống</span>
                    </NavLink>
                </div>

                {/* QUẢN LÝ */}
                <div className="mt-4 px-4 py-2 text-xs font-semibold text-gray-400">QUẢN LÝ</div>
                <div className="mt-2">
                    <NavLink to="/admin/tables-management" className={linkClass}>
                        <MdTableRestaurant size={19} className="mr-3" />
                        <span>Bàn</span>
                    </NavLink>

                    <NavLink to="/admin/users-management" className={linkClass}>
                        <FaUser size={16} className="mr-3" />
                        <span>Người Dùng</span>
                    </NavLink>

                    <NavLink to="/admin/customers-management" className={linkClass}>
                        <IoMdCash size={16} className="mr-3" />
                        <span>Khách Hàng</span>
                    </NavLink>
                </div>

                {/* THỐNG KÊ */}
                <div className="mt-4 px-4 py-2 text-xs font-semibold text-gray-400">THỐNG KÊ</div>
                <div className="mt-2">
                    <NavLink to="/admin/statistic-counter" className={linkClass}>
                        <FaStore size={16} className="mr-3" />
                        <span>Theo Quầy</span>
                    </NavLink>

                    <NavLink to="/admin/statistic-dish" className={linkClass}>
                        <MdFastfood size={16} className="mr-3" />
                        <span>Theo Món Ăn</span>
                    </NavLink>
                    <NavLink to="/admin/statistic-revenue" className={linkClass}>
                        <FaCoins size={16} className="mr-3" />
                        <span>Doanh Thu</span>
                    </NavLink>
                </div>

                {/* HỆ THỐNG */}
                <div className="mt-4 px-4 py-2 text-xs font-semibold text-gray-400">HỆ THỐNG</div>
                <div className="mt-2">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                    >
                        <FaSignInAlt size={16} className="mr-3" />
                        <span>Đăng Xuất</span>
                    </button>
                </div>
            </div>
        </div>

    );
};

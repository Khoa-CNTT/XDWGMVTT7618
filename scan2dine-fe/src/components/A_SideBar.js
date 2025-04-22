import React from 'react';
import {
    FaUser,
    FaSignInAlt,
    FaHome
} from 'react-icons/fa';
import { MdTableRestaurant } from "react-icons/md";
import { IoMdCash } from "react-icons/io";

import { Navigate, NavLink } from 'react-router-dom';

export const A_SideBar = ({ setCurrentPage }) => {

    const linkClass = ({ isActive }) =>
        `flex items-center px-4 py-3 ${isActive ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-800'}`;


    const handleLogout = () => {
        localStorage.removeItem('user');
        Navigate('/login');
    };

    return (
        <div className="w-64 bg-gray-900 text-white">
            <div className="p-4 flex items-center">
                <span className="text-xl font-extrabold">
                    Quản trị <br />
                    <span className="text-white font-bungee">
                        SCAN<span className='text-primary'>2</span><span>DINE</span>
                    </span>
                </span>
            </div>

            <div className="mt-6">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400">TỔNG QUAN</div>
                <div className="mt-2">
                    <NavLink to="/admin/dashboard" className={linkClass}>
                        <FaHome size={16} className="mr-3" />
                        <span>Tổng Quan Hệ Thống</span>
                    </NavLink>
                </div>

                <div className="mt-6 px-4 py-2 text-xs font-semibold text-gray-400">QUẢN LÝ</div>
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

                    <NavLink to="" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={handleLogout}
                    >
                        <FaSignInAlt size={16} className="mr-3" />
                        <span>Đang Xuất</span>
                    </NavLink>
                </div>
            </div>
        </div >
    );
};

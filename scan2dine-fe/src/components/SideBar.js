import React from 'react';
import {
    FaUser,
    FaSignInAlt,
    FaFileAlt,
    FaHome
} from 'react-icons/fa';
import { Navigate, NavLink } from 'react-router-dom';

export const SideBar = () => {

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
                        <span>Tổng quan hệ thống</span>
                    </NavLink>
                </div>

                <div className="mt-6 px-4 py-2 text-xs font-semibold text-gray-400">QUẢN LÝ</div>
                <div className="mt-2">
                    <NavLink to="/admin/tables" className={linkClass}>
                        <FaFileAlt size={16} className="mr-3" />
                        <span>Bàn</span>
                    </NavLink>

                    <NavLink to="/admin/employees" className={linkClass}>
                        <FaFileAlt size={16} className="mr-3" />
                        <span>Nhân viên</span>
                    </NavLink>

                    <NavLink to="/admin/owners" className={linkClass}>
                        <FaUser size={16} className="mr-3" />
                        <span>Chủ quầy</span>
                    </NavLink>

                    <NavLink to="" className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white"
                        onClick={handleLogout}
                    >
                        <FaSignInAlt size={16} className="mr-3" />
                        <span>Logout</span>
                    </NavLink>
                </div>
            </div>
        </div >
    );
};

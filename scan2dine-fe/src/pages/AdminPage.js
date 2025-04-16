import React, { useState } from 'react'
// import {
//     FaSearch,
//     FaBars,
//     FaChevronDown,
//     FaEye,
//     FaTrash,
//     FaSync,
//     FaUser,
//     FaSignInAlt,
//     FaFileAlt,
//     FaHome,
//     FaInfoCircle,
//     FaList,
//     FaGithub
// } from 'react-icons/fa';
import { SideBar } from '../components/SideBar';
import { Breadcrumb } from '../components/Breadcrumb';
import Dashboard from '../components/DashBoard';
export const AdminPage = () => {

    // Trạng thái để theo dõi trang đang được hiển thị
    const [currentPage, setCurrentPage] = useState('tổng quan hệ thống');

    // Render nội dung dựa trên trang hiện tại
    const renderContent = () => {
        switch (currentPage) {
            case 'tổng quan hệ thống':
                return <Dashboard></Dashboard>
            case 'quản lý bàn':
            // return renderTablesContent();
            default:
            // return <DashBoard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <SideBar currentPage={currentPage} setCurrentPage={setCurrentPage}></SideBar>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Đường dẫn điều hướng */}
                <Breadcrumb currentPage={currentPage}></Breadcrumb>

                {/* Nội dung chính của các trang*/}
                <main className="flex-1 overflow-y-auto bg-gray-100">
                    {renderContent()}
                </main>
            </div>

        </div>

    )
}

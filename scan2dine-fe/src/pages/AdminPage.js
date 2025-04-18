import React, { useState } from 'react'

import { SideBar } from '../components/SideBar';
import { Breadcrumb } from '../components/Breadcrumb';
import Dashboard from '../components/DashBoard';
import TableManagementSystem from '../components/A_TableManager';
import { Navigate, Route, Routes } from 'react-router-dom';
export const AdminPage = () => {

    // Trạng thái để theo dõi trang đang được hiển thị
    const [currentPage, setCurrentPage] = useState('tổng quan hệ thống');

    return (
        <div className="flex h-screen bg-gray-100">
            <SideBar currentPage={currentPage} setCurrentPage={setCurrentPage}></SideBar>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Đường dẫn điều hướng */}
                <Breadcrumb currentPage={currentPage}></Breadcrumb>

                {/* Nội dung chính của các trang*/}
                <main className="flex-1 overflow-y-auto bg-gray-100">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="tables" element={<TableManagementSystem />} />
                        {/* Add more routes if needed */}
                    </Routes>
                </main>
            </div>

        </div>

    )
}

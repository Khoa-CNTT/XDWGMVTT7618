import React, { useState } from 'react'

import { A_SideBar } from '../components/A_SideBar';
import { A_Breadcrumb } from '../components/A_Breadcrumb';
import Dashboard from '../components/DashBoard';
import TableManagementSystem from '../components/A_TableManagementSystem';
import { Navigate, Route, Routes } from 'react-router-dom';
import UserManagementSystem from '../components/A_UserManagementSystem';
import CustomerManagement from '../components/A_CustomerManagement';
export const AdminPage = () => {

    // Trạng thái để theo dõi trang đang được hiển thị
    const [currentPage, setCurrentPage] = useState('tổng quan hệ thống');



    return (
        <div className="flex h-screen bg-gray-100">
            <A_SideBar currentPage={currentPage} setCurrentPage={setCurrentPage}></A_SideBar>
            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Đường dẫn điều hướng */}
                <A_Breadcrumb currentPage={currentPage}></A_Breadcrumb>

                {/* Nội dung chính của các trang*/}
                <main className="flex-1 overflow-y-auto bg-gray-100">
                    <Routes>
                        <Route path="/" element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="tables-management" element={<TableManagementSystem />} />
                        <Route path="users-management" element={<UserManagementSystem />} />
                        <Route path="customers-management" element={<CustomerManagement />} />

                    </Routes>
                </main>
            </div>

        </div>

    )
}

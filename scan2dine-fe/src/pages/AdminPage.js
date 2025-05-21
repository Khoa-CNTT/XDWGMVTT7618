import React, { useEffect, useState } from 'react'

import { A_SideBar } from '../components/A_SideBar';
import { A_Breadcrumb } from '../components/A_Breadcrumb';
import Dashboard from '../components/DashBoard';
import TableManagementSystem from '../components/A_TableManagementSystem';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import UserManagementSystem from '../components/A_UserManagementSystem';
import CustomerManagement from '../components/A_CustomerManagement';
import { A_StatisticCounter } from '../components/A_StatisticCounter';
import { A_StatisticDish } from '../components/A_StatisticDish';
import { A_StatisticRevenue } from '../components/A_StatisticRevenue';
export const AdminPage = () => {

    // Trạng thái để theo dõi trang đang được hiển thị
    const [currentPage, setCurrentPage] = useState('tổng quan hệ thống');

    const location = useLocation();

    useEffect(() => {
        // Map đường dẫn đến tên trang
        const pathNameMap = {
            '/admin/dashboard': 'tổng quan hệ thống',
            '/admin/tables-management': 'quản lý bàn',
            '/admin/users-management': 'quản lý người dùng',
            '/admin/customers-management': 'quản lý khách hàng',
            '/admin/statistic-counter': 'thống kê theo các quầy',
            '/admin/statistic-dish': 'thống kê theo món ăn',
            '/admin/statistic-revenue': 'thống kê doanh thu',
        };

        const currentPath = location.pathname;
        const mappedPage = pathNameMap[currentPath] || 'tổng quan hệ thống';
        setCurrentPage(mappedPage);
    }, [location]);


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
                        <Route path="statistic-counter" element={<A_StatisticCounter />} />
                        <Route path="statistic-dish" element={<A_StatisticDish />} />
                        <Route path="statistic-revenue" element={<A_StatisticRevenue />} />


                    </Routes>
                </main>
            </div>

        </div>

    )
}

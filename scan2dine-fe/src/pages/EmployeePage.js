import React, { useEffect, useState } from 'react'
import { FaArrowLeft, FaUser, FaMapPin } from 'react-icons/fa';
import { TableItem } from '../components/TableItem';
import api from '../server/api';

export const EmployeePage = () => {
    // Table data with statuses
    const [table, setTable] = useState([]);

    useEffect(() => {
        const fetchTable = async () => {
            try {
                const getTable = await api.get('/s2d/table');
                setTable(getTable.data);
            } catch (error) {
                console.error('Lỗi khi tải danh mục sản phẩm:', error);
            }
        };
        fetchTable();
    }, []);



    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Header */}
            <div className="bg-primary p-4 text-white flex items-center justify-between">
                <div className="flex items-center">
                    <FaArrowLeft size={20} />
                    <span className="ml-4 font-medium">Xin chào, Hop!</span>
                </div>
                <div className="flex items-center">
                    <FaUser size={20} />
                    <span className="ml-2">Đăng xuất</span>
                </div>
            </div>

            {/* Logo and Address */}
            <div className="p-4">
                <div className="text-2xl font-bold font-bungee">
                    <span className="text-black">SCAN</span>
                    <span className="text-primary  ">2</span>
                    <span className="text-black">DINE</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                    <FaMapPin size={14} className="mr-1" />
                    <span>23 Đống Đa, Thạch Thang, Hải Châu, Đà Nẵng</span>
                </div>
            </div>

            {/* Table Section Title */}
            <div className="px-4 pt-2 pb-3 text-center">
                <h2 className="text-xl font-bold">Danh sách bàn</h2>
            </div>

            {/* Table Grid */}
            <div className="grid grid-cols-2 gap-4 px-4 pb-20">
                {table.map(table => (
                    <TableItem key={table.id} table={table}></TableItem>
                ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-gray-200 py-3 text-center text-sm text-gray-600">
                Được phát triển bởi <span className="font-bold font-bungee">SCAN<span className="text-red-600">2</span>DINE</span>
            </div>
        </div>
    )
}

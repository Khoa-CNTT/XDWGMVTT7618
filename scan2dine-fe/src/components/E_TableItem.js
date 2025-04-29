import React, { useState } from 'react'
import E_OrderDetailDialog from './E_OrderDetailDialog';

export const TableItem = ({ table, fetchTables }) => {

    const [showOrderDetail, setShowOrderDetail] = useState(false);

    const handleTableClick = () => {
        setShowOrderDetail(true);
    };

    const closeOrderDetail = () => {
        setShowOrderDetail(false);
    };

    // Màu theo tình trạng của bàn
    const getTableColor = (status) => {
        switch (status) {
            case '2': return 'bg-blue-300';
            case '3':
            case '4':
            case '5': return 'bg-red-400';
            case '1':
            default: return 'bg-gray-300';
        }
    };

    // chuyển đổi hiển thị tình trạng
    const getStatusText = (status) => {
        switch (status) {

            case '5': return 'Yêu cầu thanh toán'
            case '4': return 'Yêu cầu nhân viên'
            case '3': return 'Yêu cầu xác nhận món';
            case '2': return 'Đang phục vụ';
            case '1':
            default: return 'Bàn trống';
        }
    };
    return (
        <>
            <div
                key={table._id}
                className={`${getTableColor(table.status)} rounded-lg p-4 shadow-sm`}
                onClick={handleTableClick}>
                <div className="text-xl font-bold">Bàn {table.tb_number}</div>
                <div className="text-sm font-semibold">{getStatusText(table.status)}</div>
            </div>

            <E_OrderDetailDialog
                tableId={table._id}
                isOpen={showOrderDetail}
                onClose={closeOrderDetail}
                fetchTables={fetchTables}
            />
        </>

    )
}

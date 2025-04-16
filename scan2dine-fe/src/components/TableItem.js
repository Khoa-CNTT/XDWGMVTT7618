import React from 'react'

export const TableItem = ({ table }) => {
    // Màu theo tình trạng của bàn
    const getTableColor = (status) => {
        switch (status) {
            case '3': return 'bg-blue-300';
            case '2': return 'bg-red-400';
            case '1':
            default: return 'bg-gray-300';
        }
    };

    // chuyển đổi hiển thị tình trạng
    const getStatusText = (status) => {
        switch (status) {
            case '3': return 'Đã xác nhận';
            case '2': return 'Chờ xác nhận món';
            case '1':
            default: return 'Bàn trống';
        }
    };
    return (
        <div
            key={table.id}
            className={`${getTableColor(table.status)} rounded-lg p-4 shadow-sm`}
        >
            <div className="text-xl font-bold">Bàn {table.tb_number}</div>
            <div className="text-sm">{getStatusText(table.status)}</div>
        </div>
    )
}

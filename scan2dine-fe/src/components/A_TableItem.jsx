// AdTableItem.jsx
import React from 'react';
import { MdDelete, MdQrCode2, MdEdit } from "react-icons/md";

export const A_TableItem = ({
    table,
    toggleTableStatus,
    setSelectedTable,
    setShowQRModal,
    handleDeleteTable,
    statusColors,
    getStatusLabel,
    index

}) => {
    return (
        <tr key={table.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index + 1}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Bàn {table.tb_number}
            </td>
            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {table.location}
            </td> */}
            <td className="px-6 py-4 whitespace-nowrap">
                <button
                    // onClick={() => toggleTableStatus(table.id)}
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[table.status]}`}
                >
                    {getStatusLabel(table.status)}
                </button>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                    <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => {
                            setSelectedTable(table);
                            setShowQRModal(true);
                        }}
                    >
                        <MdQrCode2 className="w-5 h-5" />
                    </button>
                    {/* <button className="text-indigo-600 hover:text-indigo-900">
                        <MdEdit className="w-5 h-5" />
                    </button> */}
                    <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteTable(table._id)}
                    >
                        <MdDelete className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

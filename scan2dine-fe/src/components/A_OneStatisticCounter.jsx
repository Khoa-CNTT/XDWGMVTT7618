import React from 'react'

export const A_OneStatisticCounter = ({ data, index }) => {
    const formatPrice = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };
    return (
        <tr key={data._id} className="border-b border-gray-200 hover:bg-gray-50">
            {/* STT */}
            <td className="py-3 px-4">{index + 1}</td>

            {/*  Tên quầy    */}
            <td className="py-3 px-4 ">{data.stall_name}</td>

            {/* tên chủ quầy */}
            <td className="py-3 px-4 ">{data.owner_name}</td>

            {/* Tổng số món */}
            <td className="py-3 px-4">{data.number_of_products}</td>

            {/* tổng số đơn */}
            <td className="py-3 px-4">{data.username}</td>
            {/* doanh thu */}
            <td className="py-3 px-4">{formatPrice(data.total_revenue)}</td>

            {/* chiết khẩu */}
            <td className="py-3 px-4">{formatPrice(data.total_revenue * 15 / 100)}</td>

        </tr>
    )
}

import React from 'react'

export const Breadcrumb = ({ currentPage }) => {
    return (
        <div className="bg-white p-4 shadow-sm border-b flex items-center justify-between">
            <div className="flex items-center">
                <span className="text-gray-500">Admin</span>
                <span className="mx-2">/</span>
                <span className="font-medium">{currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}</span>
            </div>

        </div>
    )
}


import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import debounce from 'lodash/debounce';
import api from '../server/api';

export const CategoryFilter = ({ selectedCategory, onSelect }) => {
    const [categoryList, setCategoryList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Debounce thông báo để tránh spam
    const debouncedToast = useCallback(
        debounce((message, type = 'info') => {
            toast[type](message);
        }, 1000),
        []
    );

    // Lấy danh sách danh mục
    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const getCategory = await api.get('/s2d/category');
            setCategoryList([{ _id: 'all', cate_name: 'Tất cả' }, ...getCategory.data]);
        } catch (error) {
            console.error('Lỗi khi tải danh mục loại:', error);
            debouncedToast('Không thể tải danh mục!', 'error');
        } finally {
            setLoading(false);
        }
    }, [debouncedToast]);

    // Lấy danh mục khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);


    return (
        <div className="flex overflow-x-auto gap-4 p-4 bg-white scroll-smooth md:scrollbar-thin md:scrollbar-thumb-gray-300">
            {loading ? (
                <div className="flex items-center justify-center w-full">
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-full mr-2"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-full mr-2"></div>
                    <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-full"></div>
                </div>
            ) : categoryList.length === 0 ? (
                <div className="text-gray-500 text-center w-full">Không có danh mục nào</div>
            ) : (
                categoryList.map((category) => (
                    <div
                        key={category._id}
                        onClick={() => onSelect(category._id)}
                        className={`font-medium px-4 py-2 rounded-full cursor-pointer whitespace-nowrap transition-colors duration-200 ${
                            selectedCategory === category._id
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'
                        }`}
                    >
                        {category.cate_name}
                    </div>
                ))
            )}
        </div>
    );
};
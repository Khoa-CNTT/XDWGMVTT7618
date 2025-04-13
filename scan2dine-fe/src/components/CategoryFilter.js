import React, { useEffect, useState } from 'react'
import api from '../server/api';


export const CategoryFilter = ({ selectedCategory, onSelect }) => {

    //state chứa category
    const [categoryList, setCategoryList] = useState([]);

    //lấy data category
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const getCategory = await api.get('/s2d/category');
                setCategoryList([{ _id: 'all', cate_name: 'Tất cả' }, ...getCategory.data]);
            } catch (error) {
                console.error('Lỗi khi tải danh mục loại:', error);
            }
        }; fetchCategories();
    }, []);


    return (
        <div className="flex overflow-x-auto gap-4 p-4 bg-white scroll-smooth 
        md:scrollbar-thin md:scrollbar-thumb-gray-300">
            {categoryList.map((category) => (
                <div
                    key={category._id}
                    onClick={() => onSelect(category._id)}
                    className={`font-medium px-4 py-2 rounded-full cursor-pointer whitespace-nowrap
transition-colors duration-200
${selectedCategory === category._id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-primary hover:text-white'}
`}
                >
                    {category.cate_name}
                </div>
            ))}
        </div>


    )
}

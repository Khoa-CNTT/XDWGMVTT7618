import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Header = ({ onSearch }) => {
    // const [filter, setFilter] = useState('tất cả');
    // useEffect(() => { }, [filter]);

    //hàm nút quay lại
    const navigate = useNavigate();
    const onBack = () => {
        navigate('/');
    };
    const categories = [
        'Tất cả',
        'Gỏi, trộn',
        'Mỳ cay',
        'Bánh bao',
        'Bánh ngọt',
        'Lẩu thái'
    ];

    return (
        <div className="">
            <div className='flex flex-col'>
                <div className="flex items-center p-4 gap-4 bg-white">
                    {/* {showBackButton && ( */}
                    <button
                        onClick={() => onBack(false)}
                        className="text-gray-600 hover:text-gray-800">
                        <FaArrowLeft size={20} />
                    </button>
                    {/* )} */}
                    <input
                        type="text"
                        placeholder="Bạn đang cần tìm món gì?"
                        className="flex-1 bg-gray-100 p-2 rounded-lg"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                </div>
                {/* <div className="flex gap-2 overflow-x-auto py-4 scrollbar-none justify-center">
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('all')}>
                        Tất cả
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'hotpot' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('hotpot')}>
                        Lẩu Thái
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'salad' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('salad')}>
                        Gỏi, trộn
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'more' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('more')}>
                        Mỳ cay
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'banh' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('banh')}>
                        Bánh bao
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'ngot' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('ngot')}>
                        Bánh ngọt
                    </button>
                    <button
                        className={`px-4 py-2 rounded-full whitespace-nowrap ${filter === 'nuoc' ? 'bg-primary text-white' : 'border border-gray-300'}`}
                        onClick={() => setFilter('nuoc')}>
                        Nước uống
                    </button>
                </div> */}
                <div className="flex overflow-x-auto gap-4 p-4 bg-white">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="whitespace-nowrap px-4 py-2 rounded-full bg-gray-100 cursor-pointer hover:bg-primary hover:text-white">
                            {category}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Header;
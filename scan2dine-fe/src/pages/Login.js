import React, { useState } from 'react'
import { MdVisibility, MdVisibilityOff, MdKey, MdInfo } from 'react-icons/md'
import { Footer } from '../components/Footer'
import { FaUser } from "react-icons/fa";
import { navigate, useNavigate } from 'react-router-dom';

export const Login = () => {
    //state trạng thái hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const handleLogin = () => {
        navigate('/');
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-[400px] rounded-2xl border border-gray-300 shadow-lg bg-white p-6 space-y-6">

                {/* Logo */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-bungee">
                        <span className="text-black">SCAN</span>
                        <span className="text-primary">2</span>
                        <span className="text-black">DINE</span>
                    </h1>
                </div>

                {/* Avatar */}
                {/* <div className="flex justify-center">
                    <div className="rounded-full border border-gray-300 p-4 w-20 h-20 flex items-center justify-center shadow-sm bg-gray-100">
                        <FaRegCircleUser size={40} className="text-gray-500" />
                    </div>
                </div> */}

                {/* Login Form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium font-bungee uppercase mb-1">Tên đăng nhập</label>
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            />
                            <span className="absolute left-3 top-4 text-gray-400">
                                <FaUser />
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium font-bungee uppercase mb-1">Mật khẩu</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            />
                            {/* Icon password (bên trái) */}
                            <span className="absolute left-3 top-4 text-gray-400">
                                <MdKey />
                            </span>

                            {/* Toggle visibility icon (bên phải) */}
                            <span
                                className="absolute right-3 top-4 text-gray-500 cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded font-bungee uppercase transition hover:bg-primary/90 active:scale-95"
                    >
                        Đăng nhập
                    </button>
                    {/* Info Icon dưới nút và căn phải, có message khi hover */}
                    <div className="flex justify-end mt-2 relative group">
                        <MdInfo className="text-gray-500 cursor-pointer hover:text-primary" size={20} />

                        {/* Message khi hover vào icon info*/}
                        <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 text-sm text-black bg-orange-50 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-200">
                            Nếu bạn quên mật khẩu hãy <a><span className='text-primary'>liên hệ quản trị viên</span></a>
                        </div>
                    </div>
                </form>

                {/* Footer (nằm bên trong khối border luôn) */}
                <div className="text-center text-sm text-gray-400">
                    <Footer />
                </div>
            </div >
        </div >


    )
}

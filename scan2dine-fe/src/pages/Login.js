import React, { useState } from 'react'
import { MdVisibility, MdVisibilityOff, MdKey, MdInfo } from 'react-icons/md'
import { Footer } from '../components/Footer'
import { FaUser } from "react-icons/fa";
import { navigate, useNavigate } from 'react-router-dom';
import api from '../server/api';

export const Login = () => {

    //state trạng thái hiển thị mật khẩu
    const [showPassword, setShowPassword] = useState(false);
    const [full_name, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    //Ấn nút đăng nhập
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/s2d/user/login', {
                full_name,
                password
            });

            localStorage.setItem('user', JSON.stringify(response.data)); // hoặc lưu token, role gì bạn cần

            const { role_name } = response.data;

            // Điều hướng theo roll
            switch (role_name) {
                case "1":
                    navigate('/employee');
                    break;
                case '2':
                    navigate('/owner-dashboard');
                    break;
                case '3':
                    navigate('/admin');
                    break;
                default:
                    setError('Vai trò được chỉ định không hợp lệ');
            }
        } catch (error) {
            setError('Tên người dùng hoặc mật khẩu không hợp lệ');
        }
    };
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

                {/* Login Form */}
                <form className="space-y-4" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium font-bungee uppercase mb-1">Tên đăng nhập</label>
                        <div className="relative flex">
                            <input
                                type="text"
                                placeholder="Nhập tên đăng nhập"
                                value={full_name}
                                onChange={(e) => setUsername(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}
                    {/* Info Icon dưới nút và căn phải, có message khi hover */}
                    {/* <div className="flex justify-end mt-2 relative group">
                        <MdInfo className="text-gray-500 cursor-pointer hover:text-primary" size={20} /> */}

                    {/* Message khi hover vào icon info*/}
                    {/* <div className="absolute bottom-full right-0 mb-2 w-max px-3 py-1 text-sm text-black bg-orange-50 rounded shadow-lg opacity-0 group-hover:opacity-100 transition duration-200">
                            Nếu bạn quên mật khẩu hãy <a><span className='text-primary'>liên hệ quản trị viên</span></a>
                        </div>
                    </div> */}
                </form>

                {/* Footer (nằm bên trong khối border luôn) */}
                <div className="text-center text-sm text-gray-400">
                    <Footer />
                </div>
            </div >
        </div >


    )
}

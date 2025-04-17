import React, { useState } from "react";
import api from '../server/api';
import { MdVisibility, MdVisibilityOff, MdKey, MdInfo, MDUser } from 'react-icons/md'
import { FaPhone, FaUser } from 'react-icons/fa'
import { Footer } from '../components/Footer'
import { useNavigate } from "react-router-dom";

const CustomerLogin = ({ onSuccess }) => {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isExisting, setIsExisting] = useState(false); // Kiểm tra khách đã có hay chưa
    const navigate = useNavigate();
    // Hàm kiểm tra số điện thoại khi rời ô input
    const handleCheckPhone = async () => {
        if (!phone) return;
        try {
            const res = await api.post("/s2d/customer/check-phone", { phone });
            setName(res.data.customer.name); // Tự động hiển thị tên
            setIsExisting(true);
            setMessage(`Chào mừng trở lại, ${res.data.customer.name}!`);
        } catch (err) {
            if (err.response?.status === 404) {
                setName(""); // Nếu không có thì xóa tên cũ (nếu có)
                setIsExisting(false);
                setMessage("Số điện thoại chưa tồn tại. Vui lòng nhập tên.");
            } else {
                setMessage("Lỗi khi kiểm tra số điện thoại.");
            }
        }
    };

    // Hàm xử lý gửi form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isExisting) {
            localStorage.setItem("customer", JSON.stringify({ phone, name }));
            onSuccess?.(phone, name);
            navigate("/home")
            return;
        }

        if (!name) {
            setMessage("Vui lòng nhập tên để đăng ký.");
            return;
        }

        try {
            const res = await api.post("/s2d/customer", { phone, name });
            localStorage.setItem("customer", JSON.stringify({ phone, name }));
            setMessage(`Đăng ký thành công! Xin chào ${res.data.name}`);
            setIsExisting(true);
            onSuccess?.(phone, name);
        } catch (err) {
            setMessage("Có lỗi khi đăng ký.");
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
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium font-bungee uppercase mb-1">Số điện thoại</label>
                        <div className="relative flex">
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onBlur={handleCheckPhone}
                                placeholder="Nhập số điện thoại"
                                className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            />
                            <span className="absolute left-3 top-4 text-gray-400">
                                <FaPhone />
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium font-bungee uppercase mb-1">Tên khách hàng</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={name}
                                placeholder="Nhập tên khách hàng"
                                onChange={(e) => setName(e.target.value)}
                                disabled={isExisting} // Nếu đã tồn tại thì khóa ô nhập
                                className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                            />
                            <span className="absolute left-3 top-4 text-gray-400">
                                <FaUser />
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded font-bungee uppercase transition hover:bg-primary/90 active:scale-95"
                    >
                        Xác nhận
                    </button>
                    {message && <p className="mt-4 text-sm text-primary font-medium">{message}</p>}

                </form>
                {/* Footer (nằm bên trong khối border luôn) */}
                <div className="text-center text-sm text-gray-400">
                    <Footer />
                </div>
            </div >
        </div >
    );
};

export default CustomerLogin;

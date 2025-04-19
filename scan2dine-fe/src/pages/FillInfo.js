import React, { useState } from "react";
import api from '../server/api';
import { FaPhone, FaUser } from 'react-icons/fa';
import { Footer } from '../components/Footer';
import { useNavigate, useSearchParams } from "react-router-dom";

const CustomerLogin = ({ onSuccess }) => {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isExisting, setIsExisting] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const table = searchParams.get("table"); // lấy số bàn từ query

    const handleCheckPhone = async () => {
        if (!phone) return;
        try {
            const res = await api.post("/s2d/customer/check-phone", { phone });
            setName(res.data.customer.name);
            setIsExisting(true);
            setMessage(`Chào mừng trở lại, ${res.data.customer.name}!`);
        } catch (err) {
            if (err.response?.status === 404) {
                setName("");
                setIsExisting(false);
                setMessage("Số điện thoại chưa tồn tại. Vui lòng nhập tên để đăng ký.");
            } else {
                setMessage("Đã xảy ra lỗi khi kiểm tra số điện thoại.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!phone) {
            setMessage("Vui lòng nhập số điện thoại.");
            return;
        }

        if (isExisting) {
            sessionStorage.setItem("customer", JSON.stringify({ phone, name, table }));
            onSuccess?.(phone, name);
            navigate("/home");
            return;
        }

        if (!name) {
            setMessage("Vui lòng nhập tên để đăng ký.");
            return;
        }

        try {
            const res = await api.post("/s2d/customer/", { phone, name });
            sessionStorage.setItem("customer", JSON.stringify({ phone, name, table }));
            setMessage(`Đăng ký thành công! Xin chào ${res.data.name}`);
            setIsExisting(true);
            onSuccess?.(phone, name);
            navigate("/home");
        } catch (err) {
            setMessage("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-[400px] rounded-2xl border border-gray-300 shadow-lg bg-white p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-bungee">
                        <span className="text-black">SCAN</span>
                        <span className="text-blue-500">2</span>
                        <span className="text-black">DINE</span>
                    </h1>
                </div>

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
                                className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                                disabled={isExisting}
                                className="w-full p-3 pl-10 pr-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <span className="absolute left-3 top-4 text-gray-400">
                                <FaUser />
                            </span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-3 rounded font-bungee uppercase transition hover:bg-blue-600 active:scale-95"
                    >
                        Xác nhận
                    </button>

                    {message && (
                        <p className="mt-4 text-sm text-blue-600 font-medium">{message}</p>
                    )}
                </form>

                <div className="text-center text-sm text-gray-400">
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;

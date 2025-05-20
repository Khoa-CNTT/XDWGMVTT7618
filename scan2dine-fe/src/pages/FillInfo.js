import React, { useState } from "react";
import api from '../server/api';
import { FaPhone, FaUser } from 'react-icons/fa';
import { Footer } from '../components/Footer';
import { useNavigate, useSearchParams } from "react-router-dom";

const CustomerLogin = ({ onSuccess }) => {
    const [phone, setPhone] = useState("");
    const [_id, setId] = useState("");
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [isExisting, setIsExisting] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const table = searchParams.get("table"); // lấy số bàn từ query
    const idTable = searchParams.get("id"); // lấy số bàn từ query

    const [customerCart, setCustomerCart] = useState(null);


    const handleCheckPhone = async () => {
        if (!phone) {
            setMessage("Vui lòng nhập số điện thoại.");
            return;
        }

        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            setMessage("Số điện thoại chỉ nhập 10 kí tự số.");
            return;
        }

        try {
            const res = await api.post("/s2d/customer/check-phone", { phone });
            setName(res.data.customer.name);
            setId(res.data.customer._id);
            setCustomerCart(res.data.customer.cart);
            setIsExisting(true);
            setBlocked(res.data.blocked);
            // setMessage(`Chào mừng trở lại, ${res.data.customer.name}!`);
            if (res.data.blocked) {
                setMessage(`Tài khoản của bạn đã bị chặn, không thể đăng nhập.`);
            } else {
                setMessage(`Chào mừng trở lại, ${res.data.customer.name}!`);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setName("");
                setIsExisting(false);
                setMessage("Số điện thoại chưa tồn tại. Vui lòng nhập tên để truy cập.");
            } else {
                setMessage("Đã xảy ra lỗi khi kiểm tra số điện thoại.");
            }
        }
    };

    // Kiểm tra tên khách hàng
    const handleCheckName = () => {
        if (name.length > 50) {
            setMessage("Tên khách hàng không được vượt quá 50 ký tự.");
        } else if (/\d/.test(name)) {
            setMessage("Tên khách hàng chỉ cho phép nhập chữ.");
        } else {
            setMessage(""); // Xóa thông báo lỗi nếu hợp lệ
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra số điện thoại trước khi gửi
        if (!phone) {
            setMessage("Vui lòng nhập số điện thoại.");
            return;
        }

        //kiểm tra phone chỉ được 10 kí tự
        if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
            setMessage("Số điện thoại chỉ nhập 10 kí tự số.");
            return;
        }

        //Kiểm tra tên khách hàng
        if (!name) {
            setMessage("Vui lòng nhập tên để đăng ký.");
            return;
        }

        //kiểm tra tên nhiều hơn 50 kí tự
        if (name.length > 50) {
            setMessage("Tên khách hàng không được vượt quá 50 ký tự.");
            return;
        }

        //kiểm tra tên không được nhập số
        if (/\d/.test(name)) {
            setMessage("Tên khách hàng chỉ cho phép nhập chữ.");
            return;
        }
        // Nếu tên đã tồn tại và bị chặn không cho đăng nhập
        if (blocked) {
            setMessage("Tài khoản của bạn đã bị chặn, không thể đăng nhập.");
            return;  // Dừng không cho đăng nhập
        }
        // Kiểm tra số điện thoại nếu tồn tại
        if (isExisting) {
            sessionStorage.setItem("customer", JSON.stringify({ _id, phone, name, table, idTable, cart: customerCart }));
            onSuccess?.(phone, name);
            navigate("/home");
            return;
        }

        try {
            // Gửi yêu cầu đăng ký mới
            const res = await api.post("/s2d/customer/", { phone, name });
            sessionStorage.setItem("customer", JSON.stringify({ _id, phone, name, table, idTable, cart: res.data.cart }));
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
                        <span className="text-primary">2</span>
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
                                onBlur={handleCheckName}
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
                        className="w-full bg-primary text-white py-3 rounded font-bungee uppercase transition hover:bg-blue-600 active:scale-95"
                    >
                        Xác nhận
                    </button>

                    {message && (
                        <p className="mt-4 text-sm text-primary font-medium">{message}</p>
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

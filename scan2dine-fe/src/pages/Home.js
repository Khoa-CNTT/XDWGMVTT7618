import React, { useEffect, useState } from 'react';
import BannerSlider from '../components/C_BannerSlider';
import imgBtnGoiMon from '../assets/img/btngoimon3.jpg';
import imgBtnDanhGia from '../assets/img/btndanhgia2.jpg';
import imgBtnGoiNV from '../assets/img/btngoinv.jpg';
import imgBtnThanhToan from '../assets/img/btnthanhtoan2.jpg';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/Footer';
import CustomerLogin from './FillInfo';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import { FaArrowLeft } from 'react-icons/fa';
import { C_ConfirmCallStaff } from '../components/C_ConfirmCallStaff';
import { C_ReviewProduct } from '../components/C_ReviewProduct';
import api from '../server/api';
import { BiDish } from "react-icons/bi";


const Home = () => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [productsToReview, setProductsToReview] = useState([]);
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);
    const [paidOrders, setPaidOrders] = useState([]);

    const navigate = useNavigate();

    //Hàm chuyển hướng đến trang menu
    const onNavigateToMenu = () => {
        navigate('/menu');
    };

    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const updateGreeting = () => {
            const currentHour = new Date().getHours(); // Lấy giờ hiện tại (0 đến 23)

            if (currentHour < 12) {
                setGreeting('Chào buổi sáng');
            } else if (currentHour < 18) {
                setGreeting('Chào buổi chiều');
            } else {
                setGreeting('Chào buổi tối');
            }
        };

        updateGreeting(); // Cập nhật greeting khi component mount

        const intervalId = setInterval(updateGreeting, 60000); // Cập nhật mỗi phút
        return () => clearInterval(intervalId); // Dọn dẹp interval khi component unmount
    }, []);

    //lưu thông tin khách hàng vào local
    useEffect(() => {
        const saved = sessionStorage.getItem("customer");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && (parsed._id || (parsed.name && parsed.phone))) {
                setCustomer(parsed);
                setIsLoggedIn(true);
            } else {
                navigate("/");
            }
        } else {
            navigate("/");
        }
    }, []);


    //tên khách hàng hiển thị tại lời chào
    const cus = JSON.parse(sessionStorage.getItem("customer"));
    const name = cus?.name || "Quý khách";



    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [customer, setCustomer] = useState(null);



    const handleLoginSuccess = async (customerObj) => {
        try {
            // Gọi API lấy thông tin customer đầy đủ (bao gồm _id)
            const res = await api.get(`/s2d/customer/${customerObj.phone}`);
            const fullCustomer = res.data;
            console.log('Full Customer:', fullCustomer);
            setCustomer(fullCustomer);
            setIsLoggedIn(true);
            sessionStorage.setItem("customer", JSON.stringify(fullCustomer));
        } catch (error) {
            // Nếu lỗi, fallback về dữ liệu cũ (không khuyến khích)
            setCustomer(customerObj);
            setIsLoggedIn(true);
            sessionStorage.setItem("customer", JSON.stringify(customerObj));
        }
    };

    //gọi nhân viên
    const callStaff = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '4',
            })

        } catch (error) {

        }
    }
    const callPayment = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '5',
            })

        } catch (error) {

        }
    }


    const cancelCallStaff = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '2',
            })
            setShowStaffForm(false)

        } catch (error) {

        }
    }

    const cancelCallPayment = async (idTable) => {
        try {
            await api.patch(`/s2d/table/${idTable}`, {
                status: '2',
            })
            setShowPaymentForm(false)
        } catch (error) {

        }
    }


    //thích thì dùng
    const handleLogout = () => {
        sessionStorage.removeItem("customer");
        setIsLoggedIn(false);
        navigate(`/?table=${customer.table}&id=${customer.idTable}`);
    };

    const fetchPaidOrders = async (customerId) => {
        try {
            const response = await api.post('/s2d/order/dathanhtoan', { customerId });
            console.log('API Response:', response.data); // Kiểm tra dữ liệu trả về
            if (response.data && response.data.data) {
                setPaidOrders(response.data.data); // Cập nhật danh sách món để đánh giá
            } else {
                setPaidOrders([]);
            }
        } catch (error) {
            console.error('Error fetching paid orders:', error);
            setPaidOrders([]);
        }
    };
    return (
        <div>
            {!isLoggedIn && (
                <CustomerLogin onSuccess={handleLoginSuccess} />
            )}

            {isLoggedIn && (
                <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden">

                    {/* Kính chào quý khách */}
                    <div className="w-full bg-primary text-white py-3 font-bold text-lg relative flex items-center justify-between px-4">
                        <FaArrowLeft
                            size={20}
                            className="text-white text-2xl hover:text-gray-800 cursor-pointer"
                            onClick={() => setShowConfirmLogout(true)}
                        />
                        <span className="mx-auto">Kính chào quý khách</span>
                        <button
                            className="flex items-center gap-1 px-2 py-1 border border-white text-white rounded text-sm font-semibold hover:bg-white hover:text-primary transition"
                            onClick={() => navigate('/orderdetail')}
                            style={{ minWidth: 0, height: 32 }}
                        >
                            <BiDish size={16} />
                            Đơn hàng
                        </button>
                    </div>

                    {/* Thông tin quán */}
                    <div className="p-4 bg-white">
                        <div className="text-lg font-bungee font-extrabold">SCAN<span className='text-primary'>2</span>DINE</div>
                        <div className="text-sm text-primary ">
                            123/86, Cù Chính Lan, Hòa Khê, Thanh Khê, Đà Nẵng
                        </div>
                    </div>

                    {/* Slider */}
                    <div className="relative flex justify-center w-full"><BannerSlider></BannerSlider></div>

                    {/* Lời chào */}
                    <div className="p-4 mt-4" >
                        <div className="flex justify-center items-center mb-2">
                            <span className="text-center font-bold text-base">{greeting} <span className="text-primary font-bold">{name}</span></span>
                        </div>
                        <div className="text-base text-gray-600 text-center font-medium">
                            Bạn hãy thư giãn, món ngon sẽ sớm có mặt tại bàn:
                            <span className="bg-gray-100 px-2 py-1 rounded ml-1 text-primary font-bold">{cus?.table}</span>
                        </div>
                        <div className="flex justify-center mt-3">

                        </div>
                    </div>

                    {/* Nút xem menu */}
                    <div className=" cursor-pointer justify-items-center hover:scale-105 transition-transform duration-200" >
                        <img
                            src={imgBtnGoiMon}
                            alt="Xem Menu - Gọi món"
                            className="w-full max-w-[700px] rounded-lg shadow-md"
                            onClick={onNavigateToMenu}
                        />
                    </div>

                    {/* Dịch vụ tiện ích */}
                    <div className="w-full mt-5 text-center text-sm text-red-600 font-medium py-2">
                        ⚠️ Dịch vụ tiện ích - Chúng tôi luôn sẵn sàng hỗ trợ bạn!
                    </div>

                    {/* Các nút thao tác */}
                    <div className="w-full px-2 py-6 bg-gray-50">
                        <div className="flex justify-between items-center gap-4">

                            {/* Gọi thanh toán*/}
                            <div className="w-1/3 flex justify-center">
                                <img
                                    src={imgBtnThanhToan}
                                    alt="Gọi thanh toán"
                                    className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                    onClick={() => {
                                        setShowPaymentForm(true);
                                        callPayment(customer.idTable)
                                    }
                                    }
                                />
                            </div>

                            {/* Gọi nhân viên */}
                            <div className="w-1/3 flex justify-center">
                                <img
                                    src={imgBtnGoiNV}
                                    alt="Gọi nhân viên"
                                    className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                    onClick={() => {
                                        setShowStaffForm(true);
                                        callStaff(customer.idTable)
                                    }}

                                />
                            </div>

                            {/* Đánh giá */}
                            <div className="w-1/3 7flex justify-center">
                                <img
                                    src={imgBtnDanhGia}
                                    alt="Đánh giá"
                                    className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                    onClick={async () => {
                                        await fetchPaidOrders(customer._id);
                                        navigate('/review', { state: { orders: paidOrders } });
                                    }}
                                />
                            </div>
                        </div>
                    </div >

                    {/* footer */}
                    <Footer></Footer>

                </div >
            )}

            {
                showStaffForm && (
                    <C_ConfirmCallStaff
                        title="Đã gửi yêu cầu đến nhân viên"
                        message="Nhân viên đang đến bạn hãy chờ một lát ..."
                        onConfirm={() => setShowStaffForm(false)}
                        onCancel={() => cancelCallStaff(customer.idTable)}
                    />
                )

            }
            {
                showPaymentForm && (
                    <C_ConfirmCallStaff
                        title="Đã gửi yêu cầu thanh toán"
                        message="Nhân viên đang đến bạn hãy chờ một lát ..."
                        onConfirm={() => setShowPaymentForm(false)}
                        onCancel={() => cancelCallPayment(customer.idTable)}
                    />
                )

            }

            {showConfirmLogout && (
                <ConfirmLogoutModal
                    onCancel={() => setShowConfirmLogout(false)}
                    onConfirm={() => {
                        setShowConfirmLogout(false);
                        handleLogout();
                    }}
                />
            )}

        </div>
    )
}

export default Home

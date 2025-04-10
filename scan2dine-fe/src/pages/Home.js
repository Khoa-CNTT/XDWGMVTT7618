import React, { useEffect, useState } from 'react';
import BannerSlider from '../components/BannerSlider';
import imgBtnGoiMon from '../assets/img/btngoimon3.jpg';
import imgBtnDanhGia from '../assets/img/btndanhgia2.jpg';
import imgBtnGoiNV from '../assets/img/btngoinv.jpg';
import imgBtnThanhToan from '../assets/img/btnthanhtoan2.jpg';
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Footer } from '../components/Footer';


const Home = ({ direction }) => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showPhoneForm, setShowPhoneForm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

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




    return (
        <PageWrapper direction={direction}>

            <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden">

                {/* Kính chào quý khách */}
                <div className="w-full bg-primary text-white text-center py-3 font-bold text-lg relative">

                    <MdArrowBack className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl" />
                    Kính chào quý khách
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
                        <span className="text-center">{greeting} <span className="text-primary font-bold">Quý khách</span></span>
                    </div>
                    <div className="text-sm text-gray-600 text-center font-medium">
                        Bạn hãy thư giãn, món ngon sẽ sớm có mặt tại bàn:
                        <span className="bg-gray-100 px-2 py-1 rounded ml-1 text-primary font-bold">C2</span>
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

                        {/* Đơn hàng của bạn */}
                        <div className="w-1/4 flex justify-center">
                            <img
                                src={imgBtnDanhGia}
                                alt="Đánh giá"
                                className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                onClick={() => setShowReviewForm(true)}
                            />
                        </div>
                        {/* Gọi thanh toán*/}
                        <div className="w-1/4 flex justify-center">
                            <img
                                src={imgBtnThanhToan}
                                alt="Gọi thanh toán"
                                className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                onClick={() => setShowPaymentForm(true)}
                            />
                        </div>

                        {/* Gọi nhân viên */}
                        <div className="w-1/4 flex justify-center">
                            <img
                                src={imgBtnGoiNV}
                                alt="Gọi nhân viên"
                                className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                onClick={() => setShowStaffForm(true)}
                            />
                        </div>

                        {/* Đánh giá */}
                        <div className="w-1/4 flex justify-center">
                            <img
                                src={imgBtnDanhGia}
                                alt="Đánh giá"
                                className="w-full max-w-[250px] aspect-square rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform duration-200"
                                onClick={() => setShowReviewForm(true)}
                            />
                        </div>


                    </div>
                </div >

                {/* footer */}
                <Footer></Footer>

            </div >
        </PageWrapper>

    )
}

export default Home

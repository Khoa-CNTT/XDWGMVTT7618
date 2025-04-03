import React, { useState } from 'react';
import BannerSlider from '../components/BannerSlider';
import imgBtnGoiMon from  '../assets/img/btngoimon2.jpg';

const Home = () => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showPhoneForm, setShowPhoneForm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-[800px] mx-auto shadow-2xl">
            {/* Thông tin quán */}
           <div className="p-4 bg-white">
                <div className="text-lg font-extrabold">SCAN<span className='text-primary'>2</span>DINE</div>
                <div className="text-sm text-primary">
                    123/86, Cù Chính Lan, Hòa Khê, Thanh Khê, Đà Nẵng
                </div>
            </div>
            {/* Slider */}
            <div className="relative flex justify-center w-full"><BannerSlider></BannerSlider></div>
             {/* Lời chào */}
             <div className="p-4 cursor-pointer mt-4" >
                <div className="flex justify-center items-center mb-2">
                    <span className="text-center">Chào buổi tối <span className="text-primary font-bold">Quý khách</span></span>
                </div>
                <div className="text-sm text-gray-600 text-center font-medium">
                    Bạn hãy thư giãn, món ngon sẽ sớm có mặt tại bàn:
                    <span className="bg-gray-100 px-2 py-1 rounded ml-1 text-primary font-bold">C2</span>
                </div>
            </div>
            {/* Nút xem menu */}
            <div className=" cursor-pointer justify-items-center" >
                <img 
    src={imgBtnGoiMon} 
    alt="Xem Menu - Gọi món" 
    className="w-full max-w-[700px] rounded-lg shadow-md"
  />

            </div>
              {/* Các nút thao tác */}
              <div className="flex-1 grid grid-cols-3 gap-7 p-9 bg-gray-50">
                <div className="text-center">
                    <div
                        className={`p-4 rounded-lg shadow-sm mb-2 flex items-center justify-start cursor-pointer transition-colors duration-200 ${showPaymentForm ? 'bg-red-300' : 'bg-orange-200 hover:bg-teal-300'
                            }`}
                        onClick={() => setShowPaymentForm(true)}>
                        <div className="text-sm pr-2 h-12">Gọi thanh toán</div>
                    </div>
                </div>

                <div className="text-center">
                    <div
                        className={`p-4 rounded-lg shadow-sm mb-2 flex items-center justify-start cursor-pointer transition-colors duration-200 ${showStaffForm ? 'bg-red-300' : 'bg-orange-200 hover:bg-teal-300'
                            }`}
                        onClick={() => setShowStaffForm(true)}>
                        <div className="text-sm pr-2 h-12">Gọi nhân viên</div>
                    </div>
                </div>

                <div className="text-center">
                    <div
                        className={`p-4 rounded-lg shadow-sm mb-2 flex items-center justify-start cursor-pointer transition-colors duration-200 ${showReviewForm ? 'bg-red-300' : 'bg-orange-200 hover:bg-teal-300'
                            }`}
                        onClick={() => setShowReviewForm(true)}>
                        <div className="text-sm pr-2 h-12">Đánh giá</div>
                    </div>
                </div>
            </div>
        </div>

  )
}

export default Home

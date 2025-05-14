import React, { useEffect, useState } from 'react';
import BannerSlider from '../components/C_BannerSlider';
import imgBtnGoiMon from '../assets/img/btngoimon3.jpg';
import imgBtnDanhGia from '../assets/img/btndanhgia2.jpg';
import imgBtnGoiNV from '../assets/img/btngoinv.jpg';
import imgBtnThanhToan from '../assets/img/btnthanhtoan2.jpg';
import { MdArrowBack } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Footer } from '../components/Footer';
import CustomerLogin from './FillInfo';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import { FaArrowLeft } from 'react-icons/fa';
import { C_ConfirmCallStaff } from '../components/C_ConfirmCallStaff';
import C_ProductReviewForm from '../components/C_ProductReviewForm';
import api from '../server/api';


const Home = ({ direction }) => {
    const [showPaymentForm, setShowPaymentForm] = useState(false);
    const [showStaffForm, setShowStaffForm] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewProduct, setReviewProduct] = useState(null);
    const [productsToReview, setProductsToReview] = useState([]);
    const [showConfirmLogout, setShowConfirmLogout] = useState(false);
    const [paidOrders, setPaidOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

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

    // const fetchPaidOrders = async () => {
    //     try {
    //         const res = await api.get('/s2d/order/dathanhtoan');
    //         // Xử lý dữ liệu trả về ở đây, ví dụ:
    //         console.log('Paid Orders:', res.data);
    //         // Hoặc set vào state nếu muốn hiển thị
    //         // setPaidOrders(res.data.orders);
    //     } catch (error) {
    //         console.error('Error fetching paid orders:', error);
    //     }
    // };
    useEffect(() => {
        if (showReviewForm) {
            api.get('/s2d/order/dathanhtoan')
                .then(res => setPaidOrders(res.data.data || []))
                .catch(() => setPaidOrders([]));
        }
    }, [showReviewForm]);

    // Ví dụ: Gọi hàm này khi component mount hoặc khi cần
    // useEffect(() => {
    //     fetchPaidOrders();
    // }, []);

    return (
        <PageWrapper direction={direction}>
            {!isLoggedIn && (
                <CustomerLogin onSuccess={handleLoginSuccess} />
            )}

            {isLoggedIn && (
                <div className="min-h-screen bg-gray-50 flex flex-col w-full sm:max-w-[800px] mx-auto shadow-2xl overflow-hidden">

                    {/* Kính chào quý khách */}
                    <div className="w-full bg-primary text-white text-center py-3 font-bold text-lg relative">

                        <FaArrowLeft size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl hover:text-gray-800 cursor-pointer"
                            onClick={() => setShowConfirmLogout(true)} />
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
                            <span className="text-center">{greeting} <span className="text-primary font-bold">{name}</span></span>
                        </div>
                        <div className="text-sm text-gray-600 text-center font-medium">
                            Bạn hãy thư giãn, món ngon sẽ sớm có mặt tại bàn:
                            <span className="bg-gray-100 px-2 py-1 rounded ml-1 text-primary font-bold">{cus?.table}</span>
                        </div>
                        <div className="flex justify-center mt-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded hover:bg-primary hover:text-white transition"
                                onClick={() => navigate('/orderdetail')}
                            >
                                <span role="img" aria-label="order">🧾</span>
                                Đơn hàng của tôi
                            </button>
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
                                    onClick={() => {
                                        setShowReviewForm(true);
                                        setSelectedOrder(null); // Reset selected order when opening modal
                                        setReviewProduct(null); // Reset selected product
                                    }}
                                />
                            </div>
                        </div>
                    </div >

                    {/* footer */}
                    <Footer></Footer>

                </div >
            )}
            {showReviewForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                            onClick={() => {
                                setShowReviewForm(false);
                                setSelectedOrder(null);
                                setReviewProduct(null);
                            }}
                        >
                            &times;
                        </button>
                        {!selectedOrder ? (
                            <div>
                                <h3 className="font-bold mb-2">Chọn đơn hàng đã thanh toán</h3>
                                {paidOrders.length === 0 ? (
                                    <div className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào đã thanh toán.</div>
                                ) : (
                                    <ul>
                                        {paidOrders.map((order) => (
                                            <li key={order._id} className="mb-2">
                                                <button
                                                    className="text-primary underline"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    Đơn #{order._id} - {order.customer?.name} - {order.od_date?.slice(0, 10)}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <button
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded"
                                    onClick={() => setShowReviewForm(false)}
                                >
                                    Đóng
                                </button>
                            </div>
                        ) : !reviewProduct ? (
                            <div>
                                <h3 className="font-bold mb-2">Chọn món để đánh giá</h3>
                                {selectedOrder.orderdetail && selectedOrder.orderdetail.length > 0 ? (
                                    <ul>
                                        {selectedOrder.orderdetail.map((item) => (
                                            <li key={item._id} className="mb-2">
                                                <button
                                                    className="text-primary underline"
                                                    onClick={() => setReviewProduct(item.products)}
                                                >
                                                    {item.products.pd_name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-gray-500 mb-4">Đơn hàng này không có món nào để đánh giá.</div>
                                )}
                                <button
                                    className="mt-4 px-4 py-2 bg-gray-200 rounded"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    Quay lại
                                </button>
                            </div>
                        ) : (
                            <C_ProductReviewForm
                                product={reviewProduct}
                                customerId={customer._id}
                                onSuccess={() => {
                                    setShowReviewForm(false);
                                    setReviewProduct(null);
                                    setSelectedOrder(null);
                                }}
                                onCancel={() => {
                                    setReviewProduct(null);
                                }}
                            />
                        )}
                    </div>
                </div>
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

        </PageWrapper>

    )
}

export default Home

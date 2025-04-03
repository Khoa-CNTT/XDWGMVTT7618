import React from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import img1 from "../assets/img/banner1.jpg"
import img2 from "../assets/img/banner2.jpg"
import img3 from "../assets/img/banner3.jpg"

const BannerSlider = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
      };
    
      const images = [img1,img2,img3  ];
    
  return (
    // <div className="w-[1200px] h-[600px]">
     <div className="w-full max-w-2xl mx-auto ">
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index}>
            <img src={img} alt={`Slide ${index}`} className="w-full rounded-lg" />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default BannerSlider

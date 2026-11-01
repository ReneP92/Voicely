import React from "react";
import FeedbackCard from "./FeedbackCard";
import Slider from "react-slick";

const Feedback = () => {
    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1080,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: true,
                },
            },
            {
                breakpoint: 724,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: true,
                },
            },
            {
                breakpoint: 512,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: false,
                    dots: true,
                },
            },
        ],
    };
    return (
        <div className="w-full bg-white py-32">
            <div className="md:max-w-[1480px] m-auto max-w-[600px]">
                <h1 className="py-3 text-4xl font-semibold">
                    Student <span className="text-[#20b486]">Courses</span>
                </h1>
                <p className="text-lg text-[#6d737a]">
                    Various versions have evolved over the years, sometimes by
                    accident.
                </p>
                <div className="py-6">
                    <Slider {...settings}>
                        <FeedbackCard />
                        <FeedbackCard />
                        <FeedbackCard />
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Feedback;

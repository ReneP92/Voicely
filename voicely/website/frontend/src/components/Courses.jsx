import React from "react";
import Card from "./Card";
import Slider from "react-slick";
import { courses } from "../data/Courses";

const Courses = () => {
    var settings = {
        dots: true,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1080,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    infinite: false,
                    dots: true,
                },
            },
            {
                breakpoint: 724,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 512,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="w-full bg-[#e9f8f3b2] py-32">
            <div className="md:max-w-[1480px] m-auto max-w-[600px]">
                <h1 className="py-3 text-4xl font-semibold">
                    Most Popular <span className="text-[#20b486]">Courses</span>
                </h1>
                <p className="text-lg text-[#6d737a]">
                    Various versions have evolved over the years, sometimes by
                    accident.
                </p>
                <div className="py-6">
                    <Slider {...settings}>
                        {courses.map((course) => (
                            <Card course={course} />
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Courses;

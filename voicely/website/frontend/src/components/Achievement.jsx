import React from "react";
import { achievement } from "../assets";
import { SlGraduation } from "react-icons/sl";
import { CiVideoOn } from "react-icons/ci";
import { PiStudent } from "react-icons/pi";
import { GoPeople } from "react-icons/go";

const Achievement = () => {
    return (
        <div className="w-full bg-white py-24">
            <div className="md:max-w-[1480px] m-auto grid md:grid-cols-2 max-w-[600px]">
                <div className="flex flex-col justify-center">
                    <h1 className="md:leading-[72px] text-4xl font-semibold">
                        Our <span className="text-[#20b486]">Achievements</span>{" "}
                    </h1>
                    <p className="text-lg text-gray-400">
                        Various version have evolved over the years, sometimes
                        by accident.
                    </p>
                    <div className="grid grid-cols-2 py-16">
                        <div className="py-6 flex ">
                            <div className="p-4 bg-[#e9f8f3] rounded-xl">
                                <SlGraduation
                                    size={30}
                                    style={{ color: "#1a906b" }}
                                />
                            </div>
                            <div className="px-3">
                                <h1 className="text-2xl font-semibold">300</h1>
                                <p className="text-[#6d737a]">Instructors</p>
                            </div>
                        </div>
                        <div className="py-6 flex ">
                            <div className="p-4 bg-[#fffaf5] rounded-xl">
                                <CiVideoOn
                                    size={30}
                                    style={{ color: "#ffc27a" }}
                                />
                            </div>
                            <div className="px-3">
                                <h1 className="text-2xl font-semibold">
                                    10,000+
                                </h1>
                                <p className="text-[#6d737a]">Videos</p>
                            </div>
                        </div>
                        <div className="py-6 flex ">
                            <div className="p-4 bg-[#ffeef0] rounded-xl">
                                <PiStudent
                                    size={30}
                                    style={{ color: "#ed4459" }}
                                />
                            </div>
                            <div className="px-3">
                                <h1 className="text-2xl font-semibold">
                                    20,000+
                                </h1>
                                <p className="text-[#6d737a]">Students</p>
                            </div>
                        </div>
                        <div className="py-6 flex ">
                            <div className="p-4 bg-[#f0f7ff] rounded-xl">
                                <GoPeople
                                    size={30}
                                    style={{ color: "#0075fd" }}
                                />
                            </div>
                            <div className="px-3">
                                <h1 className="text-2xl font-semibold">
                                    1,000,000
                                </h1>
                                <p className="text-[#6d737a]">Users</p>
                            </div>
                        </div>
                    </div>
                </div>
                <img
                    src={achievement}
                    className="m-auto md:order-last order-first"
                />
            </div>
        </div>
    );
};

export default Achievement;

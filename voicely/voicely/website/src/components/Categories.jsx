import React from "react";
import CategoryCard from "./CategoryCard";
import { BsVectorPen } from "react-icons/bs";
import { TiHtml5 } from "react-icons/ti";
import { CgWebsite } from "react-icons/cg";
import { MdOutlineBusinessCenter, MdOutlinePhotoCamera } from "react-icons/md";
import { FiSunrise } from "react-icons/fi";
import { LuMusic4 } from "react-icons/lu";
import { PiMoney } from "react-icons/pi";

const Categories = () => {
    return (
        <div className="w-full bg-[#e9f8f3b2] py-32">
            <div className="md:max-w-[1480px] m-auto  max-w-[600px]">
                <h1 className="md:leading-[72px] text-4xl font-semibold">
                    Most{" "}
                    <span className="text-[#20b486]">Popular Categories</span>{" "}
                </h1>
                <p className="text-lg text-[#6d737a] ">
                    Various versions have evolved over the years, sometimes by
                    accident.
                </p>
                <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 py-12 gap-4">
                    <CategoryCard
                        icon={<BsVectorPen size={30} />}
                        title={"Design"}
                    />
                    <CategoryCard
                        icon={<TiHtml5 size={30} />}
                        title={"Development"}
                    />
                    <CategoryCard
                        icon={<CgWebsite size={30} />}
                        title={"Marketing"}
                    />
                    <CategoryCard
                        icon={<MdOutlineBusinessCenter size={30} />}
                        title={"Business"}
                    />
                    <CategoryCard
                        icon={<FiSunrise size={30} />}
                        title="Lifestyle"
                    />
                    <CategoryCard
                        icon={<MdOutlinePhotoCamera size={30} />}
                        title="Photography"
                    />
                    <CategoryCard
                        icon={<LuMusic4 size={30} />}
                        title={"Music"}
                    />
                    <CategoryCard
                        icon={<PiMoney size={30} />}
                        title={"Finance"}
                    />
                </div>
            </div>
        </div>
    );
};

export default Categories;

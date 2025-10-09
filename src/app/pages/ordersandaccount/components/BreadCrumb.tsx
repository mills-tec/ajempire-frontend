import Link from "next/link";
import { useState, useEffect } from "react";

type BreadCrumbProps = {
    activeItem: string;
};

const BreadCrumb = ({ activeItem }: BreadCrumbProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const show = ">";

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1100);

        return () => clearTimeout(timer); // cleanup
    }, []);

    return (
        <div className="flex items-center gap-1 font-poppins text-[14px] font-normal">
            <Link
                href={"/"}
                className="opacity-50 hover:underline underline-offset-2 transition-all duration-300"
            >
                shop
            </Link>
            <p>{show}</p>
            {isLoading ? <p>Your Orders</p> : <p>{activeItem}</p>}
        </div>
    );
};

export default BreadCrumb;

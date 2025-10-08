import Link from "next/link";


type BreadCrumbProps = {
    activeItem: string;
};

const BreadCrumb = ({ activeItem }: BreadCrumbProps) => {
    const show = ">"
    return (
        <div className="flex items-center gap-1 font-poppins text-[14px] font-normal ">
            <Link href={"/"} className="opacity-50 hover:underline underline-offset-2 transition-all duration-300">shop</Link>
            <p>{show}</p>
            <p>{activeItem}</p>
        </div>
    )
}

export default BreadCrumb;
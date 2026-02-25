"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import SearchBar from "@/app/components/ui/SearchBar";
import { useEffect } from "react";
import Categories from "../components/ui/Categories";
import { useSearchStore } from "@/lib/search-store";


export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
    const { data } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    });
    const params = useParams();
    const activeId = params.id as string;
    const router = useRouter();
    const { clearSearch } = useSearchStore();

    // useEffect(() => {
    //     if (!activeId && data?.message?.length) {
    //         const firstCategory = data.message[0];
    //         const slug = firstCategory.name.toLowerCase().replace(/\s+/g, "-");

    //         router.replace(`/categories/${slug}`);
    //     }
    // }, [data, activeId, router]);

    useEffect(() => {
        if (!data?.message?.length) return;

        // only redirect if user is EXACTLY on /categories
        if (window.location.pathname === "/categories") {
            const firstCategory = data.message[0];
            const slug = firstCategory.name.toLowerCase().replace(/\s+/g, "-");
            router.replace(`/categories/${slug}`);
        }
    }, [data, router]);


    return (
        <>
            <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-50 shadow-sm px-[20px] h-[90px] flex items-center">
                <SearchBar />
            </div>
            <div className="hidden lg:block mb-6">
                <Categories categories={data?.message} />
            </div>

            <div className="flex gap-2 h-screen lg:h-auto lg:mt-0 mt-[6rem]">
                {/* SIDE NAV */}
                <div className="lg:hidden font-poppins w-[120px] border-r border-gray-200 overflow-y-auto flex flex-col gap-3 px-3 py-3" >
                    {data?.message?.map((cat) => {
                        const slug = cat.name.toLowerCase().replace(/\s+/g, "-");

                        return (
                            <Link
                                key={cat._id}
                                href={`/categories/${slug}`}
                                className={` flex flex-col gap-1 px-3 py-2 text-sm capitalize rounded-md transition ${activeId === slug ? "bg-[#F6E6FF] text-black" : "hover:bg-gray-100"
                                    }`}
                                onClick={clearSearch}
                            >
                                <div className="size-[4rem]  rounded-lg border flex items-center justify-center bg-white overflow-hidden">
                                    <Image
                                        src={cat.image}
                                        alt={cat.name}
                                        height={50}
                                        width={60}
                                        className="object-cover w-full h-full rounded-lg"
                                    />
                                </div>

                                <p className="text-start text-sm mt-1 max-w-[70px] break-words">
                                    {cat.name}
                                </p>
                            </Link>
                        );
                    })}
                </div>

                {/* PRODUCTS */}
                <div className=" lg:w-full flex-1 overflow-y-auto px-2 py-1">
                    {children}
                </div>

            </div>
        </>
    );
}

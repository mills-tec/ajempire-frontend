"use client";

import { useExploreInterest } from "@/api/customHooks";
import ProductItem from "@/components/ProductItem";
import { useEffect, useState } from "react";

export default function ExploreInterest() {

    const [data, setData] = useState([])
    const { getExploreInterest, loading } = useExploreInterest()
    useEffect(() => {
        (async () => {
            let req = await getExploreInterest();
            setData(req)
        })()
    }, [])


    return (
        <section className="mt-10">
            <h2 className="text-2xl font-bold font-poppins">Explore Interest</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {data && data.length! > 0 ? (
                    data.map((item, index) => (
                        <ProductItem index={index} product={item} />
                    ))
                ) : (
                    <p>No data found</p>
                )}
            </div>
        </section>
    )
}

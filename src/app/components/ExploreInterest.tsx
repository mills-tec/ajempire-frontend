"use client";

import { useExploreInterest } from "@/api/customHooks";
import ProductItem from "@/components/ProductItem";
import RelatedProducts from "@/components/RelatedProducts";
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
            <RelatedProducts items={data} />
        </section>
    )
}

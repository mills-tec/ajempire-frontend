"use client";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getExploreInterest } from "@/lib/api";
import { shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";
const ITEMS_TO_APPEND = 10;
export default function ExploreInterest() {

    const queryClient = useQueryClient();

    const [cursor, setCursor] = useState("");
    const [hasNextPage, setHasNextPage] = useState(true);
    const lastItemRef = useRef<HTMLDivElement>(null);
    /*
     * INITIAL FETCH
     */
    const { data, isLoading } = useQuery(
        ["exploreInterest"],
        () => getExploreInterest(10, ""),
        {
            onSuccess: (res) => {
                setCursor(res?.nextCursor || "");
                setHasNextPage(res?.hasMore ?? false);
            },

        }
    );

    /*
     * Append helper (same style as Code B)
     */
    const appendProducts = (newProducts: any[]) => {
        queryClient.setQueryData(["exploreInterest"], (oldData: any) => {
            if (!oldData) {
                return {
                    products: [...newProducts],
                };
            }

            return {
                ...oldData,
                products: [
                    ...(oldData.products ?? []),
                    ...newProducts,
                ],
            };
        });
    };

    /*
     * Infinite scroll
     */
    const [infiniteRef] = useInfiniteScroll({
        loading: false,
        hasNextPage,
        onLoadMore: async () => {
            try {
                const newData = await getExploreInterest(
                    10,
                    cursor
                );

                appendProducts(newData?.products || []);
                setCursor(newData?.nextCursor || "");
                setHasNextPage(newData?.hasMore ?? false);
            } catch (err) {
                console.error("Error loading related products:", err);
            }
        },
        disabled: Boolean(isLoading),
    });


    const products = useMemo(() => {
        return data?.products ?? [];
    }, [data]);


    // handles infinite scrolling by pushing data to array when last item is visible
    useEffect(() => {
        if (!lastItemRef.current || products.length === 0) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    observer.unobserve(entry.target);

                    // Load next batch
                    const startIndex = Math.floor(Math.random() * products.length);
                    const endIndex = Math.min(startIndex + ITEMS_TO_APPEND * 2, products.length);
                    const nextBatch = shuffleArray(products).slice(startIndex, endIndex);

                    appendProducts(nextBatch);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(lastItemRef.current);

        return () => observer.disconnect();
    }, [products]);



    // console.log(data)
    return (
        <section className="px-6">
            <div className="font-poppins py-10 space-y-5">
                <h1 className="text-2xl font-poppins">Explore Interest</h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">
                {products.map((product: any, index: number) => (
                    <div key={index} ref={!hasNextPage && (index === products.length - 1) ? lastItemRef : null}>
                        <ProductItem product={product} index={index} />
                    </div>
                ))}

                {/* Loading skeletons when fetching next page */}
                {!hasNextPage &&
                    [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                        <div key={`skeleton-${i}`}>
                            <Skeleton />
                        </div>
                    ))}

                <EndlessScrollLoading
                    infiniteRef={infiniteRef}
                    hasNextPage={hasNextPage}
                />
            </div>
        </section>
    )
}

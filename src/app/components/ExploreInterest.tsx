"use client";
import EndlessScrollLoading from "@/components/EndlessScrollLoading";
import ProductItem from "@/components/ProductItem";
import Skeleton from "@/components/Skeleton";
import { getExploreInterest } from "@/lib/api";
import { ITEMS_TO_APPEND, shuffleArray } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

// const ITEMS_TO_APPEND = 10;

export default function ExploreInterest() {

    const queryClient = useQueryClient();

    const [cursor, setCursor] = useState("");
    const [hasNextPage, setHasNextPage] = useState(true);

    const lastItemRef = useRef<HTMLDivElement>(null);
    const originalProductsRef = useRef<any[]>([]);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [isPending, startDuplicateTransition] = useTransition();

    /*
     * INITIAL FETCH
     */
    const { data, isLoading } = useQuery(
        ["exploreInterest"],
        () => getExploreInterest(ITEMS_TO_APPEND, ""),
        {
            onSuccess: (res) => {
                setCursor(res?.nextCursor || "");
                setHasNextPage(res?.hasMore ?? false);
            },
        }
    );

    const products = useMemo(() => {
        return data?.products ?? [];
    }, [data]);

    /*
     * STORE ORIGINAL DATASET ONCE
     */
    useEffect(() => {
        if (data?.products && originalProductsRef.current.length === 0) {
            originalProductsRef.current = data.products;
        }
    }, [data]);

    /*
     * Append helper
     */
    const appendProducts = (newProducts: any[]) => {
        queryClient.setQueryData(["exploreInterest"], (oldData: any) => {
            if (!oldData) return oldData;

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
     * API infinite scroll
     */
    const [infiniteRef] = useInfiniteScroll({
        loading: false,
        hasNextPage,
        disabled: Boolean(isLoading),
        onLoadMore: async () => {
            try {

                const newData = await getExploreInterest(
                    ITEMS_TO_APPEND,
                    cursor
                );

                appendProducts(newData?.products || []);

                setCursor(newData?.nextCursor || "");
                setHasNextPage(newData?.hasMore ?? false);

            } catch (err) {
                console.error("Error loading explore interest:", err);
            }
        },
    });

    /*
     * Observe last item (only after API finished)
     */
    useEffect(() => {

        if (hasNextPage) return;
        if (!lastItemRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isDuplicating) {
                    setIsDuplicating(true);
                }
            },
            {
                root: null,
                rootMargin: "300px",
                threshold: 0,
            }
        );

        observer.observe(lastItemRef.current);

        return () => observer.disconnect();

    }, [hasNextPage, isDuplicating]);

    /*
     * Duplication logic (same as Gallery)
     */
    useEffect(() => {

        if (!isDuplicating) return;
        if (!originalProductsRef.current.length) return;

        startDuplicateTransition(() => {
            appendProducts(shuffleArray(originalProductsRef.current));
        });
        setIsDuplicating(false);

    }, [isDuplicating]);



    return (
        <section className="px-6">

            <div className="font-poppins py-10 space-y-5">
                <h1 className="text-2xl font-poppins">Explore Interest</h1>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-2 lg:gap-6">

                {products.map((product: any, index: number) => (
                    <div
                        key={`${product._id}-${index}`}
                        ref={!hasNextPage && index === products.length - 1 ? lastItemRef : null}
                    >
                        <ProductItem product={product} index={index} />
                    </div>
                ))}

                {/* Skeleton while duplicating */}
                {isPending &&
                    [...Array(ITEMS_TO_APPEND)].map((_, i) => (
                        <Skeleton key={`dup-skeleton-${i}`} />
                    ))}

                <EndlessScrollLoading
                    infiniteRef={infiniteRef}
                    hasNextPage={hasNextPage}
                />

            </div>
        </section>
    );
}

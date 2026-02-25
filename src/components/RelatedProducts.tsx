"use client"
import { useRef, useState } from 'react'
import ProductItem from './ProductItem'
import useInfiniteScroll from 'react-infinite-scroll-hook';
import EndlessScrollLoading from './EndlessScrollLoading';

export default function RelatedProducts({ items }: { items: any }) {
    const lastItemRef = useRef<HTMLDivElement | null>(null);
    const [data, setData] = useState([...items]);
    const [loading, setLoading] = useState(true);
    const [infiniteRef] = useInfiniteScroll({
        loading: loading,
        hasNextPage: true,
        onLoadMore: () => {
            setData([...data, ...items])
            // setLoading(false)

        },
        disabled: Boolean(false),

    });

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5  gap-x-2 lg:gap-6  ">
                {
                    data.map((product: any, key: number) => (
                        <div key={key} ref={key === data.length - 1 ? lastItemRef : null}>
                            <ProductItem index={key} product={product} />
                        </div>
                    ))
                }
            </div>
            <EndlessScrollLoading infiniteRef={infiniteRef} hasNextPage={false} />

        </div>
    )
}

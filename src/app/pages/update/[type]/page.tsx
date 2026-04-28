"use client"
import { useUpdates } from '@/api/customHooks';
import Spinner from '@/app/components/Spinner';
import UpdatesSkeleton from '@/components/UpdatesSkeleton';
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from 'react'

export default function UpdatePage() {
    const router = useRouter();
    const params = useParams();
    const { type } = params;
    const { getFeeds, loading } = useUpdates();
    const [data, setData] = useState([])
    useEffect(() => {

        (async () => {
            const res = await getFeeds(type as string, "");
            if (!res.data || res.data.length === 0) return;

            setData(res.data);
            router.push(`${type}/${res.data[0]._id}`);
        })();

    }, [getFeeds, router, type])


    if (loading) return <UpdatesSkeleton type={type as string} />
    return data.length === 0 ? <div className='h-[85vh] flex items-center justify-center'>No data found</div> : <UpdatesSkeleton type={type as string} />

}

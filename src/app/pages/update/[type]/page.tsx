"use client"
import { useUpdates } from '@/api/customHooks';
import Spinner from '@/app/components/Spinner';
import { useParams, useRouter } from "next/navigation";

import { useEffect, useState } from 'react'

export default function page() {
    const router = useRouter();
    const params = useParams();
    const { type } = params;
    const { getFeeds, loading } = useUpdates();
    const [data, setData] = useState([])
    useEffect(() => {

        (async () => {
            const res = await getFeeds(type as string);
            if (!res || res.length === 0) return;
            setData(res);
            router.push(`${type}/${res[0]._id}`);
        })();

    }, [])
    if (loading) return <Spinner />
    return data.length === 0 ? <div className='h-[85vh] flex items-center justify-center'>No data found</div> : <Spinner />

}

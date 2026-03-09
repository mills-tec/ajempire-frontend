import Link from 'next/link'
import React from 'react'

export default function EmptyList({ message, writeup, Icon, href, btnText }: { message: string, writeup: string, Icon?: React.ReactNode, href?: string, btnText?: string }) {
    return (
        <div className="h-[70vh] flex flex-col items-center justify-center gap-y-1" >
            {Icon && Icon}
            <h1 className='text-center font-poppins text-lg font-semibold'>
                {message}
            </h1>
            <p className='text-center font-poppins text-sm text-black/70'>
                {writeup}
            </p>
            {href && btnText && <Link href={href} className='text-center font-poppins text-sm text-white bg-primaryhover px-10 py-3 rounded-full mt-5'>
                {btnText}
            </Link>}
        </div>
    )
}

import React from 'react'

export default function Skeleton() {
    return (
        <section

            className={`space-y-2 group text-left hover:shadow-sm hover:rounded-md hover:bg-white p-2 lg:w-[13rem] border border-transparent hover:border-black/10 w-full break-inside-avoid md:h-fit   `}
        >


            <div className={`relative h-[10rem] lg:w-full lg:h-[14rem] w-full break-inside-avoid  rounded-sm overflow-hidden md:overflow-clip bg-gray-200 animate-pulse `}>


            </div>

            <div className="space-y-1">
                <h2 className="text-sm truncate  h-10 bg-gray-200 animate-pulse rounded-sm w-[60%]"></h2>
                <div>
                    <p className=" lg:text-xs text-black/60 h-6 bg-gray-200 animate-pulse w-[40%]"> </p>
                </div>

                <div className="flex items-center gap-2  pr-2 text-[7px] lg:text-[10px] rounded-sm h-12 bg-gray-200 animate-pulse w-[80%] ">


                </div>


            </div>
        </section >
    )
}

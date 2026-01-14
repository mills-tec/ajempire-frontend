import React from 'react'

export default function Modal({ children, onClose, isOpen }: { children: React.ReactNode, onClose: () => void, isOpen: boolean }) {
    return (
        <div className={`fixed inset-0 z-50 overflow-y-auto bg-black/10 ${isOpen ? "scale-100" : "scale-0 delay-300"} `}>
            <div className='flex items-center justify-center min-h-screen'>
                <div className={`relative bg-white w-full max-w-md p-6 ${isOpen ? "scale-100" : "scale-0 "} duration-300`}>
                    <button className='absolute top-2 right-2' onClick={() => { onClose() }}>
                        <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' /></svg>
                    </button>
                    {children}
                </div>
            </div>
        </div>
    )
}

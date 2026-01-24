import React from 'react'
import MobileHeader from './MobileHeader'

export default function MobilePage({ children, isOpen, handleClose, title }: { children: React.ReactNode, isOpen: boolean, handleClose: () => void, title: string }) {
    return (
        <div className={` ${isOpen ? "md:hidden block" : "hidden "}`}>
            <div className='fixed inset-0 bg-white  py-6 h-screen overflow-y-auto'>
                <MobileHeader text={title} handleBack={() => handleClose()} />
                <div className="px-4">
                    {children}
                </div>
            </div>

        </div>
    )
}

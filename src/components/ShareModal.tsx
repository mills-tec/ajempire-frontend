import React from 'react'
import Modal from './Modal'
import { FaXTwitter } from 'react-icons/fa6';
import { openSocialApp } from '@/lib/utils';
import { toast } from 'sonner';
import { RiTelegram2Fill } from 'react-icons/ri';
import { Link2 } from 'lucide-react';
import { FaFacebookF, FaWhatsapp } from 'react-icons/fa';

export default function ShareModal({ share, hideShare, href }: { share: boolean; hideShare: () => void; href: string; }) {
    const socialMedia: { Icon: React.ReactNode, text: string, color: string, Wrapper: React.FC<{ children: React.ReactNode }> }[] = [{
        Icon: <Link2 size={24} style={{ rotate: "-45deg" }} />,
        text: "Copy link",
        color: "bg-[#0085FF]",
        Wrapper: ({ children }) => (
            <div
                className="cursor-pointer"
                onClick={() => {
                    navigator.clipboard.writeText(href);
                    hideShare();
                    toast.success("Link copied to clipboard");
                }}
            >
                {children}
            </div>
        ),
    },
    {
        Icon: <RiTelegram2Fill size={24} />,
        text: "Telegram",
        color: "bg-[#279FD1]",
        Wrapper: ({ children }) => (
            <span
                onClick={() => openSocialApp("telegram", href)}
                className="cursor-pointer"

            >
                {children}
            </span>
        ),
    },
    {
        Icon: <FaWhatsapp size={24} />,
        text: "Whatsapp",
        color: "bg-[#25D366]",
        Wrapper: ({ children }) => (
            <span
                onClick={() => openSocialApp("whatsapp", href)}
                className="cursor-pointer"

            >
                {children}
            </span>
        ),
    },

    {
        Icon: <FaFacebookF size={24} />,
        text: "Facebook",
        color: "bg-[#0075FA]",
        Wrapper: ({ children }) => (
            <span
                onClick={() => openSocialApp("facebook", href)}
                className="cursor-pointer"

            >
                {children}
            </span>
        ),
    },

    {
        Icon: <FaXTwitter size={24} />,
        text: "Twitter",
        color: "bg-[#000]",
        Wrapper: ({ children }) => (
            <span
                onClick={() => openSocialApp("twitter", href)}
                className="cursor-pointer"

            >
                {children}
            </span>
        ),
    },
    ]

    return (
        <Modal isOpen={share} onClose={hideShare}>
            <div className="flex items-center justify-center">
                <h1>Share to</h1>
            </div>

            <div className="flex items-center md:justify-between p-5 md:p-10 flex-wrap gap-5">
                {socialMedia.map((item, index) => (
                    <item.Wrapper key={index} >


                        <div key={index} className="flex flex-col items-center gap-2 cursor-pointer w-20">
                            <div className={"w-10 h-10  rounded-full flex items-center justify-center text-white  " + item.color}>
                                {item.Icon}
                            </div>
                            <p className="text-xs">{item.text}</p>
                        </div>
                    </item.Wrapper>
                ))}
            </div>
        </Modal>
    )
}

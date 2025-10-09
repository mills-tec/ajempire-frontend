import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number;
};

export function DocumentIcon({ size = 19, ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 19 19"
            fill="none"
            {...props}
        >
            <path
                d="M13.457 3.16602H5.54036C4.66591 3.16602 3.95703 3.8749 3.95703 4.74935V15.041C3.95703 15.9155 4.66591 16.6243 5.54036 16.6243H13.457C14.3315 16.6243 15.0404 15.9155 15.0404 15.041V4.74935C15.0404 3.8749 14.3315 3.16602 13.457 3.16602Z"
                fill="currentColor"
                stroke="currentColor"
            />
            <path
                d="M7.125 7.125H11.875M7.125 10.2917H11.875M7.125 13.4583H10.2917"
                stroke="white"
                strokeLinecap="round"
            />
        </svg>
    );
}

import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function UserIcon(props: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 36 36"
            fill="none"
            {...props}
        >
            <path
                d="M18 19.668C20.7614 19.668 23 17.4294 23 14.668C23 11.9065 20.7614 9.66797 18 9.66797C15.2386 9.66797 13 11.9065 13 14.668C13 17.4294 15.2386 19.668 18 19.668Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M18 33C26.2843 33 33 26.2843 33 18C33 9.71573 26.2843 3 18 3C9.71573 3 3 9.71573 3 18C3 26.2843 9.71573 33 18 33Z"
                stroke="currentColor"
                strokeWidth="1.5"
            />
            <path
                d="M28 29.1767C27.41 27.405 26.11 25.8383 24.3017 24.7217C22.4933 23.605 20.2783 23 18 23C15.7217 23 13.505 23.605 11.6983 24.7217C9.89167 25.8383 8.59 27.405 8 29.1767"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

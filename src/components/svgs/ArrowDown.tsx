import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number;
};

export function ArrowDown({ size = 16, ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 9"
            width={size}
            height={size}
            fill="none"
            {...props}
        >
            <path
                d="M14.75 1.125L7.875 8L1 1.125"
                stroke="currentColor"
                strokeOpacity="0.75"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

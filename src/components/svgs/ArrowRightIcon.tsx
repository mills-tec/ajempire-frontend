import React from "react";
type IconProps = React.SVGProps<SVGSVGElement>;
const ArrowRightIcon = (props: IconProps) => (
    <svg
        width="12"
        height="18"
        viewBox="0 0 12 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props} // so you can pass className, style, etc.
    >
        <g clipPath="url(#clip0_1814_12048)">
            <path
                d="M4.02285 3.65117L9.06641 8.69472L4.02285 13.7383"
                stroke="currentColor"
                strokeOpacity="0.6"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>
        <defs>
            <clipPath id="clip0_1814_12048">
                <rect
                    width="16.873"
                    height="11.7377"
                    fill="white"
                    transform="matrix(0 -1 1 0 0.261719 17.4062)"
                />
            </clipPath>
        </defs>
    </svg>
);

export default ArrowRightIcon;

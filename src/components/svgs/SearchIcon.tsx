import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function SearchIcon(props: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 21 22"
            fill="none"
            {...props}
        >
            <path
                d="M18.3757 18.8757L13.8283 14.3283M13.8283 14.3283C15.0591 13.0976 15.7505 11.4283 15.7505 9.68775C15.7505 7.9472 15.0591 6.27794 13.8283 5.04718C12.5976 3.81643 10.9283 3.125 9.18775 3.125C7.4472 3.125 5.77794 3.81643 4.54718 5.04718C3.31643 6.27794 2.625 7.9472 2.625 9.68775C2.625 11.4283 3.31643 13.0976 4.54718 14.3283C5.77794 15.5591 7.4472 16.2505 9.18775 16.2505C10.9283 16.2505 12.5976 15.5591 13.8283 14.3283Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
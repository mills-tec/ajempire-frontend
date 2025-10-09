import React from "react";

type IconProps = React.SVGProps<SVGSVGElement> & {
    size?: number;
};

export function ChatStarIcon({ size = 17, ...props }: IconProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 17 17"
            fill="none"
            {...props}
        >
            <path
                d="M2.125 14.2212V3.26967C2.125 2.94336 2.23432 2.67113 2.45296 2.45296C2.6716 2.23479 2.9436 2.12547 3.26896 2.125H13.731C14.0569 2.125 14.3289 2.23432 14.547 2.45296C14.7652 2.6716 14.8745 2.94383 14.875 3.26967V10.8977C14.875 11.2235 14.7657 11.4958 14.547 11.7144C14.3284 11.9331 14.0564 12.0421 13.731 12.0417H4.30454L2.125 14.2212ZM6.74121 9.68504L8.5 8.61829L10.2588 9.68504L9.79129 7.684L11.3468 6.3495L9.30254 6.16817L8.5 4.29108L7.69746 6.16817L5.65321 6.3495L7.20871 7.684L6.74121 9.68504Z"
                fill="currentColor"
            />
        </svg>
    );
}

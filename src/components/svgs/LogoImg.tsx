import React from "react";

type ImgRectProps = {
    width?: number;
    height?: number;
    className?: string;
    src?: string; // allow passing base64 or normal URL
};

export const LogoImg: React.FC<ImgRectProps> = ({
    width = 163,
    height = 48,
    className,
    src = "data:image/png;base64,iVBORw0K..." // default base64
}) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 163 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <pattern
                    id="pattern0"
                    patternContentUnits="objectBoundingBox"
                    width="1"
                    height="1"
                >
                    <image
                        href={src}   // ✅ use "href" not "xlink:href"
                        width="2062"
                        height="608"
                        preserveAspectRatio="none"
                    />
                </pattern>
            </defs>

            <rect width="163" height="48" fill="url(#pattern0)" />
        </svg>
    );
};

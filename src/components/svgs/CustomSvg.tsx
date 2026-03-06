import React from "react";

type Props = React.SVGProps<SVGSVGElement> & { imageHref?: string };

const CustomSvg: React.FC<Props> = ({ width = "142", height = "42", imageHref = "", ...rest }) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 142 42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...rest}
    >
        <rect width="142" height="42" fill="url(#pattern0_1335_14313)" />
        <defs>
            <pattern id="pattern0_1335_14313" patternContentUnits="objectBoundingBox" width="1" height="1">
                <use href="#image0_1335_14313" transform="matrix(0.000486471 0 0 0.00164474 -0.00155208 0)" />
            </pattern>
            <image
                id="image0_1335_14313"
                width="2062"
                height="608"
                preserveAspectRatio="none"
                href={imageHref}
            />
        </defs>
    </svg>
);

export default CustomSvg;
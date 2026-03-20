// components/Butterflies.tsx
import React from "react";
import ButterflyImg from "../public/Butterfly.png";
import Asset40Img from "../public/Asset40.png";
import Image from "next/image";

const Butterflies: React.FC = () => {
    return (
        <div className="relative w-full h-[1000px]">
            {/* Group 275 / Asset 40 */}
            <div
                className="absolute w-[146.7px] h-[185.09px]"
                style={{
                    left: "calc(50% - 146.7px/2 + 0.35px)",
                    top: "calc(50% - 185.09px/2 - 0.46px)",
                }}
            >
                <Image src={Asset40Img} alt="Asset 40" width={147} height={185} />
            </div>

            {/* Group 271 */}
            <div
                className="absolute opacity-60 invisible w-[519.62px] h-[640.83px]"
                style={{
                    left: "-126.66px",
                    top: "485.66px",
                }}
            >
                {/* Butterfly 2 */}
                <div
                    className="absolute w-[373.09px] h-[555.9px]"
                    style={{
                        left: "calc(50% - 373.09px/2 - 155.11px)",
                        top: "485.66px",
                        backgroundImage: `url(${ButterflyImg.src})`,
                        transform: "matrix(-0.96, -0.29, -0.29, 0.96, 0, 0)",
                        backgroundSize: "cover",
                    }}
                />

                {/* Butterfly 3 */}
                <div
                    className="absolute w-[167.78px] h-[249.98px] invisible"
                    style={{
                        left: "calc(50% - 167.78px/2 + 440.83px)",
                        top: "756.54px",
                        backgroundImage: `url(${ButterflyImg.src})`,
                        transform: "rotate(-17.04deg)",
                        backgroundSize: "cover",
                    }}
                />
            </div>

            {/* Group 272 */}
            <div
                className="absolute opacity-60 invisible w-[519.62px] h-[640.83px]"
                style={{
                    left: "232.02px",
                    top: "-247.79px",
                }}
            >
                {/* Butterfly 2 */}
                <div
                    className="absolute w-[373.09px] h-[555.9px]"
                    style={{
                        left: "calc(50% - 373.09px/2 + 203.57px)",
                        top: "-247.79px",
                        backgroundImage: `url(${ButterflyImg.src})`,
                        transform: "rotate(-17.04deg)",
                        backgroundSize: "cover",
                    }}
                />

                {/* Butterfly 3 */}
                <div
                    className="absolute w-[167.78px] h-[249.98px] invisible"
                    style={{
                        left: "calc(50% - 167.78px/2 + 493.71px)",
                        top: "772.64px",
                        backgroundImage: `url(${ButterflyImg.src})`,
                        transform: "rotate(-17.04deg)",
                        backgroundSize: "cover",
                    }}
                />
            </div>
        </div>
    );
};

export default Butterflies;
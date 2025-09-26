import * as React from "react";

const CameraSVGIcon: React.FC<React.SVGProps<SVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
  >
    <path
      stroke="url(#paint0_linear_1814_12832)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23q-.57.08-1.134.175C2.999 7.58 2.25 8.507 2.25 9.575V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a48 48 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.19 2.19 0 0 0-1.736-1.039 49 49 0 0 0-5.232 0 2.19 2.19 0 0 0-1.736 1.04z"
    ></path>
    <path
      stroke="url(#paint1_linear_1814_12832)"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0m2.25-2.25h.008v.008h-.008z"
    ></path>
    <defs>
      <linearGradient
        id="paint0_linear_1814_12832"
        x1="2.25"
        x2="21.75"
        y1="12"
        y2="12"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF008C"></stop>
        <stop offset="1" stopColor="#A600FF"></stop>
      </linearGradient>
      <linearGradient
        id="paint1_linear_1814_12832"
        x1="7.5"
        x2="18.758"
        y1="12.75"
        y2="12.75"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF008C"></stop>
        <stop offset="1" stopColor="#A600FF"></stop>
      </linearGradient>
    </defs>
  </svg>
);

export default CameraSVGIcon;

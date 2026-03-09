import React from "react";

const ProcessingIcon = (props: React.SVGProps<SVGSVGElement>) => {
    return (
        <svg
            {...props}
            viewBox="0 0 20 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M4.78711 7.21349C5.49143 5.94639 6.61433 4.96353 7.96355 4.43321C9.31276 3.90288 10.8044 3.85808 12.183 4.30646C13.5616 4.75484 14.7415 5.66852 15.5206 6.89107C16.2997 8.11361 16.6296 9.56897 16.4538 11.008"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M15.2022 14.0629C14.3904 15.1171 13.2635 15.8848 11.9852 16.2542C10.707 16.6236 9.34421 16.5755 8.09524 16.1168C6.84627 15.658 5.77629 14.8127 5.04101 13.7038C4.30574 12.5948 3.94354 11.2802 4.00715 9.95117"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d="M12.4053 13.6973H15.4225V16.7145"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M7.66113 6.92578L4.7347 7.66044L4.00004 4.73401"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default ProcessingIcon;
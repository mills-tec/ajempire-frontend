"use client";
import React from "react";
interface IOrderStatus {
  createdAt: Date | null;
  processedAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
}
export default function OrderStatus({
  createdAt,
  processedAt,
  shippedAt,
  deliveredAt,
}: IOrderStatus) {
  const formattedDate = (date: Date) =>
    new Date(date).toLocaleString("en-US", {
      weekday: "short", // Fri
      day: "2-digit", // 05
      month: "short", // Aug
      year: "numeric", // 2025
      hour: "numeric", // 3
      minute: "2-digit", // 07
      hour12: true, // am/pm
    });
  return (
    <div className="mt-8 w-max">
      <div className="flex gap-6">
        {createdAt ? (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-[#0085FF] size-5"
              >
                <g clipPath="url(#clip0_1629_9558)">
                  <path
                    d="M24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12ZM12 5.25C12 5.05109 11.921 4.86032 11.7803 4.71967C11.6397 4.57902 11.4489 4.5 11.25 4.5C11.0511 4.5 10.8603 4.57902 10.7197 4.71967C10.579 4.86032 10.5 5.05109 10.5 5.25V13.5C10.5 13.6322 10.535 13.762 10.6014 13.8764C10.6678 13.9907 10.7632 14.0854 10.878 14.151L16.128 17.151C16.3003 17.2441 16.5022 17.2661 16.6905 17.2124C16.8788 17.1586 17.0386 17.0333 17.1358 16.8633C17.2329 16.6933 17.2597 16.492 17.2104 16.3024C17.1612 16.1129 17.0397 15.9502 16.872 15.849L12 13.065V5.25Z"
                    // fill="#0085FF"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1629_9558">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <svg
                width="1"
                height="97"
                viewBox="0 0 1 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="2.18557e-08"
                  x2="0.499996"
                  y2="97"
                  stroke="black"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>
            <div className="space-y-1">
              <>
                <h2 className="text-sm text-[#0085FF]">Order Recieved</h2>
                <h3 className="text-xs font-medium">
                  {formattedDate(createdAt)}
                </h3>
                <p className="text-xs text-black/50">
                  Thank you your order has been received
                </p>
              </>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="fill-black/45 size-5"
              >
                <g clipPath="url(#clip0_1629_9558)">
                  <path
                    d="M24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12ZM12 5.25C12 5.05109 11.921 4.86032 11.7803 4.71967C11.6397 4.57902 11.4489 4.5 11.25 4.5C11.0511 4.5 10.8603 4.57902 10.7197 4.71967C10.579 4.86032 10.5 5.05109 10.5 5.25V13.5C10.5 13.6322 10.535 13.762 10.6014 13.8764C10.6678 13.9907 10.7632 14.0854 10.878 14.151L16.128 17.151C16.3003 17.2441 16.5022 17.2661 16.6905 17.2124C16.8788 17.1586 17.0386 17.0333 17.1358 16.8633C17.2329 16.6933 17.2597 16.492 17.2104 16.3024C17.1612 16.1129 17.0397 15.9502 16.872 15.849L12 13.065V5.25Z"
                    // fill="#0085FF"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1629_9558">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <svg
                width="1"
                height="97"
                viewBox="0 0 1 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="2.18557e-08"
                  x2="0.499996"
                  y2="97"
                  stroke="black"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>
            <h2 className="text-sm text-black/45">Order Recieved</h2>
          </>
        )}
      </div>
      <div className="flex gap-6">
        {processedAt ? (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-[#FF8D28] size-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" />
                <path
                  d="M12 4.5V7M12 17V19.5M19.5 12H17M7 12H4.5M17.3033 6.6975L15.535 8.465M8.465 15.535L6.6975 17.3025M17.3033 17.3033L15.535 15.535M8.465 8.465L6.6975 6.6975"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              <svg
                width="1"
                height="97"
                viewBox="0 0 1 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="2.18557e-08"
                  x2="0.499996"
                  y2="97"
                  stroke="black"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm text-[#FF8D28]">
                Order {shippedAt ? "Processed" : "Processing"}
              </h2>
              <h3 className="text-xs font-medium">
                {formattedDate(processedAt)}
              </h3>
              <p className="text-xs text-black/50">
                Your order is being Processed
              </p>
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="flex gap-6">
        {shippedAt ? (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-purple-600 size-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" />
                <g clipPath="url(#clip0_1629_9566)">
                  <path
                    d="M4 7V8H13.5V15.5H10.422C10.199 14.6405 9.426 14 8.5 14C7.574 14 6.801 14.6405 6.578 15.5H6V13H5V16.5H6.578C6.801 17.3595 7.574 18 8.5 18C9.426 18 10.199 17.3595 10.422 16.5H14.578C14.801 17.3595 15.574 18 16.5 18C17.426 18 18.199 17.3595 18.422 16.5H20V12.422L19.9685 12.3435L18.9685 9.3435L18.86 9H14.5V7H4ZM4.5 9V10H9V9H4.5ZM14.5 10H18.1405L19 12.5625V15.5H18.422C18.199 14.6405 17.426 14 16.5 14C15.574 14 14.801 14.6405 14.578 15.5H14.5V10ZM5 11V12H8V11H5ZM8.5 15C9.0585 15 9.5 15.4415 9.5 16C9.5 16.5585 9.0585 17 8.5 17C7.9415 17 7.5 16.5585 7.5 16C7.5 15.4415 7.9415 15 8.5 15ZM16.5 15C17.0585 15 17.5 15.4415 17.5 16C17.5 16.5585 17.0585 17 16.5 17C15.9415 17 15.5 16.5585 15.5 16C15.5 15.4415 15.9415 15 16.5 15Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1629_9566">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(4 4)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <svg
                width="1"
                height="97"
                viewBox="0 0 1 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="2.18557e-08"
                  x2="0.499996"
                  y2="97"
                  stroke="black"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm text-purple-600">Order Shipping</h2>
              <p className="text-xs text-black/50">
                Your order is currently in lagos
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-black/45 size-5"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="12" />
                <g clipPath="url(#clip0_1629_9566)">
                  <path
                    d="M4 7V8H13.5V15.5H10.422C10.199 14.6405 9.426 14 8.5 14C7.574 14 6.801 14.6405 6.578 15.5H6V13H5V16.5H6.578C6.801 17.3595 7.574 18 8.5 18C9.426 18 10.199 17.3595 10.422 16.5H14.578C14.801 17.3595 15.574 18 16.5 18C17.426 18 18.199 17.3595 18.422 16.5H20V12.422L19.9685 12.3435L18.9685 9.3435L18.86 9H14.5V7H4ZM4.5 9V10H9V9H4.5ZM14.5 10H18.1405L19 12.5625V15.5H18.422C18.199 14.6405 17.426 14 16.5 14C15.574 14 14.801 14.6405 14.578 15.5H14.5V10ZM5 11V12H8V11H5ZM8.5 15C9.0585 15 9.5 15.4415 9.5 16C9.5 16.5585 9.0585 17 8.5 17C7.9415 17 7.5 16.5585 7.5 16C7.5 15.4415 7.9415 15 8.5 15ZM16.5 15C17.0585 15 17.5 15.4415 17.5 16C17.5 16.5585 17.0585 17 16.5 17C15.9415 17 15.5 16.5585 15.5 16C15.5 15.4415 15.9415 15 16.5 15Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1629_9566">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="translate(4 4)"
                    />
                  </clipPath>
                </defs>
              </svg>
              <svg
                width="1"
                height="97"
                viewBox="0 0 1 97"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line
                  x1="0.5"
                  y1="2.18557e-08"
                  x2="0.499996"
                  y2="97"
                  stroke="black"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm text-black/45">Order Shipping</h2>
              <div className="text-xs px-8 py-[0.15rem] relative rounded-full bg-black/45 text-white">
                Tracking
              </div>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-6">
        {deliveredAt ? (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="fill-green-500 size-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12ZM11.3152 17.136L18.224 8.4992L16.976 7.5008L11.0848 14.8624L6.912 11.3856L5.888 12.6144L11.3152 17.136Z"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm text-green-500">Order Delivered</h2>
              <p className="text-xs text-green-500/50">
                Your order has been delivered successfully.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center w-max">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="fill-black/45 size-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0 12C0 8.8174 1.26428 5.76516 3.51472 3.51472C5.76516 1.26428 8.8174 0 12 0C15.1826 0 18.2348 1.26428 20.4853 3.51472C22.7357 5.76516 24 8.8174 24 12C24 15.1826 22.7357 18.2348 20.4853 20.4853C18.2348 22.7357 15.1826 24 12 24C8.8174 24 5.76516 22.7357 3.51472 20.4853C1.26428 18.2348 0 15.1826 0 12ZM11.3152 17.136L18.224 8.4992L16.976 7.5008L11.0848 14.8624L6.912 11.3856L5.888 12.6144L11.3152 17.136Z"
                />
              </svg>
            </div>

            <div className="space-y-1">
              <h2 className="text-sm text-black/45">Order Delivered</h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

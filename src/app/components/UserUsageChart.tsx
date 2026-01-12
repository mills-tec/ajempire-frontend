"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { ApexOptions } from "apexcharts";
interface UserUsageChartProps {
    trendData?: any[];
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function UserUsageChart({ trendData }: UserUsageChartProps) {

    const series = trendData?.map(item => Number(item.percentage.toFixed(0))) || [];
    const labels = trendData?.map(item => item.category) || [];
    console.log("Series Data:", series);
    // const chartData = {
    //     series: [25, 25, 25, 25],

    //     options: {
    //         chart: {
    //             type: "donut",
    //             toolbar: { show: false },   // Fix: required for TS
    //         },
    //         stroke: {
    //             show: false,
    //         },
    //         plotOptions: {
    //             pie: {
    //                 donut: {
    //                     size: "75%",
    //                 },
    //             },
    //         },
    //         dataLabels: {
    //             enabled: false,
    //         },
    //         legend: {
    //             show: false,
    //         },
    //         colors: ["#FF9F00", "#FF007F", "#05A1FF", "#A100FF"],

    //         // Fix: ApexOptions requires this sometimes depending on version
    //         labels: ["A", "B", "C", "D"],

    //         grid: {
    //             padding: {
    //                 top: 0,
    //                 bottom: 0,
    //             },
    //         },
    //     },
    // };

    const options: ApexOptions = {
        chart: {
            type: "donut",
            toolbar: { show: false },
        },
        stroke: { show: false },
        plotOptions: {
            pie: { donut: { size: "75%" } },
        },
        dataLabels: { enabled: false },
        legend: { show: false },
        colors: ["#FF9F00", "#FF007F", "#05A1FF", "#A100FF"],
        labels: labels,
        grid: { padding: { top: 0, bottom: 0 } },
    };

    const POSITIONS: Record<number, { top: string; left: string }[]> = {
        1: [
            { top: "0%", left: "50%" },
        ],
        2: [
            { top: "0%", left: "50%" },      // top
            { top: "50%", left: "100%" },    // right
        ],
        3: [
            { top: "0%", left: "50%" },      // top
            { top: "50%", left: "100%" },    // right
            { top: "100%", left: "50%" },    // bottom
        ],
        4: [
            { top: "0%", left: "50%" },      // top
            { top: "50%", left: "100%" },    // right
            { top: "100%", left: "50%" },    // bottom
            { top: "50%", left: "0%" },      // left
        ],
    };

    const categoryImages: Record<string, string> = {
        powder: "/images/item1.png",
        "Eye lashes": "/images/item2.png",
        default: "/images/item3.png",
    };


    return (
        <Card className="relative w-[400px] h-[400px] flex items-center justify-center p-4">
            <CardContent className="p-4">
                <div className="relative flex items-center justify-center p-6">

                    {/* Chart */}
                    <div className="relative  w-[250px] h-[250px]">
                        <Chart
                            options={options}
                            series={series}
                            type="donut"
                            height={250}
                            width={250}
                        />
                        <div className="absolute top-24 left-[60px] flex flex-col justify-center items-center text-center font-poppins font-medium">
                            <p>Spending Trend</p>
                            <p>this month</p>
                        </div>
                    </div>

                    {/* Around Images */}
                    {trendData?.map((item, index) => {
                        const total = trendData.length;
                        const position = POSITIONS[total]?.[index];

                        if (!position) return null;

                        return (
                            <div
                                key={item.category}
                                className="absolute flex flex-col items-center text-center"
                                style={{
                                    top: position.top,
                                    left: position.left,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <img
                                    src={categoryImages[item.category] || categoryImages.default}
                                    className="w-8 h-8"
                                />
                                <p className="text-[14px] font-medium">
                                    {item.percentage.toFixed(0)}%
                                </p>
                            </div>
                        );
                    })}

                </div>
            </CardContent>
        </Card>
    );
}

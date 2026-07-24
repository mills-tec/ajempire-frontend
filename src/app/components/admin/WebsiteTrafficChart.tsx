'use client'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js";
import { memo } from "react";
import { Line } from "react-chartjs-2";
import { aggregateOrdersByDate } from '@/lib/dashboard-utils';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

interface WebsiteTrafficChartProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orders?: any[];
}

const WebsiteTrafficChart = memo(function WebsiteTrafficChart({ orders = [] }: WebsiteTrafficChartProps) {
    const chartData = aggregateOrdersByDate(orders);

    const maxValue = Math.max(
        ...chartData.flatMap((d) => [d.visitors, d.pageViews, d.sessions]),
        10
    );

    const trafficData = {
        labels: chartData.map((item) => item.date),
        datasets: [
            {
                label: 'unique visitors',
                data: chartData.map((item) => item.visitors),
                borderColor: '#1e88e5',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'page views',
                data: chartData.map((item) => item.pageViews),
                borderColor: '#ffc107',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'sessions',
                data: chartData.map((item) => item.sessions),
                borderColor: '#f44336',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                backgroundColor: '#fff',
                titleColor: '#000',
                bodyColor: '#000',
                borderColor: '#eee',
                borderWidth: 1,
                padding: 10,
                displayColors: true,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: maxValue + 5,
                grid: {
                    color: '#f0f0f0',
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#999',
                    font: {
                        size: 10,
                        family: 'Poppins',
                    }
                }
            },
            x: {
                grid: {
                    display: false,
                },
                border: {
                    display: false,
                },
                ticks: {
                    color: '#999',
                    font: {
                        size: 10,
                        family: 'Poppins',
                    }
                }
            }
        }
    };

    const totalVisitors = chartData.reduce((sum, d) => sum + d.visitors, 0);
    const totalPageViews = chartData.reduce((sum, d) => sum + d.pageViews, 0);
    const totalSessions = chartData.reduce((sum, d) => sum + d.sessions, 0);

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="w-full">
                    <h4 className="font-medium text-brand_gray_dark text-sm">Website Traffic</h4>
                    <div className="flex flex-wrap items-center gap-6 mt-4 pb-2 border-b border-gray-50">
                        <div className="flex flex-col min-w-[100px]">
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#1e88e5]" />
                                unique visitors
                            </span>
                            <span className="text-lg font-bold text-brand_gray_dark mt-1">
                                {totalVisitors.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-[100px]">
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#ffc107]" />
                                page views
                            </span>
                            <span className="text-lg font-bold text-brand_gray_dark mt-1">
                                {totalPageViews.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex flex-col min-w-[100px]">
                            <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#f44336]" />
                                sessions
                            </span>
                            <span className="text-lg font-bold text-brand_gray_dark mt-1">
                                {totalSessions.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-[250px] relative">
                {chartData.length > 0 ? (
                    <Line data={trafficData} options={options as unknown as object} />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                        No traffic data for this period
                    </div>
                )}
            </div>
        </div>
    );
});

export default WebsiteTrafficChart;

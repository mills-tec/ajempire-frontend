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
import { Line } from "react-chartjs-2";

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
    data?: { date: string; sales: number }[];
}

const WebsiteTrafficChart = ({ data = [] }: WebsiteTrafficChartProps) => {
    // Use dynamic data if provided, otherwise use default data
    const chartData = data.length > 0 ? data : [
        { date: 'Jan', sales: 12 },
        { date: 'Feb', sales: 18 },
        { date: 'Mar', sales: 14 },
        { date: 'Apr', sales: 25 },
        { date: 'May', sales: 23 },
        { date: 'Jun', sales: 18 },
        { date: 'Jul', sales: 22 },
        { date: 'Aug', sales: 19 },
        { date: 'Sep', sales: 21 },
        { date: 'Oct', sales: 28 },
        { date: 'Nov', sales: 24 },
        { date: 'Dec', sales: 20 },
        { date: 'Jan', sales: 18 }
    ];

    const trafficData = {
        labels: chartData.map(item => item.date),
        datasets: [
            {
                label: 'unique visitors',
                data: chartData.map(item => item.sales),
                borderColor: '#1e88e5',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'page views',
                data: [15, 25, 20, 16, 28, 26, 20, 24, 30, 32, 28, 31, 30],
                borderColor: '#ffc107',
                backgroundColor: 'transparent',
                tension: 0.4,
                pointRadius: 0,
                borderWidth: 2,
            },
            {
                label: 'sessions',
                data: [10, 12, 18, 14, 16, 22, 18, 20, 24, 26, 22, 21, 20],
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
                displayColors: false,
                callbacks: {
                    title: () => '',
                    label: (context: any) => `${context.parsed.y}`,
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 50,
                grid: {
                    color: '#f0f0f0',
                },
                border: {
                    display: false,
                },
                ticks: {
                    stepSize: 10,
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

    return (
        <div className="bg-white border p-6 rounded-2xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h4 className="font-medium text-brand_gray_dark text-sm">Website Traffic</h4>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#1e88e5]" />
                            <span className="text-[10px] text-gray-500">unique visitors</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#ffc107]" />
                            <span className="text-[10px] text-gray-500">page views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-[#f44336]" />
                            <span className="text-[10px] text-gray-500">sessions</span>
                        </div>
                    </div>
                </div>
                <select className="border border-gray-100 bg-gray-50/50 rounded-lg px-2 py-1.5 text-xs text-gray-500 outline-none">
                    <option>2023 - 2024</option>
                </select>
            </div>
            <div className="h-[250px] relative">
                <Line data={trafficData} options={options as any} />
            </div>
        </div>
    );
};

export default WebsiteTrafficChart;

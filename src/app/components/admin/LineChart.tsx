'use client'
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

interface LineChartProps {
    data?: { date: string; sales: number }[];
}

const LineChart = ({ data = [] }: LineChartProps) => {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-brand_gray text-xs font-poppins min-h-[180px] border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <span className="text-gray-400 font-medium">No sales data for this period</span>
            </div>
        );
    }

    const chartData = data;

    return (
        <Bar
            data={{
                labels: chartData.map(item => item.date),
                datasets: [
                    {
                        label: 'Sales',
                        data: chartData.map(item => item.sales),
                        backgroundColor: '#ff008c',
                        borderRadius: 100,
                        borderSkipped: false,
                        barThickness: 10,
                    },
                ],
            }}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            label: (context: unknown) => `₦${(context as { raw: number }).raw.toLocaleString()}`,
                        }
                    },
                },
                scales: {
                    y: {
                        display: true,
                        beginAtZero: true,
                        max: 100000,
                        grid: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '#c1c1c1',
                            font: {
                                size: 10,
                                family: 'Poppins',
                            },
                            callback: (value: number) => {
                                if (value === 0) return '0';
                                return value / 1000 + 'k';
                            },
                            stepSize: 20000,
                        },
                    },
                    x: {
                        display: true,
                        stacked: false,
                        grid: {
                            display: false,
                        },
                        border: {
                            display: false,
                        },
                        ticks: {
                            color: '#c1c1c1',
                            font: {
                                size: 10,
                                family: 'Poppins',
                            },
                        },
                    },
                },
            } as unknown as object}
        />
    )
}

export default LineChart
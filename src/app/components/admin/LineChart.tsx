'use client'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
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
    // Use dynamic data if provided, otherwise use default data
    const chartData = data.length > 0 ? data : [
        { date: 'Sept 10', sales: 90000 },
        { date: 'Sept 11', sales: 40000 },
        { date: 'Sept 12', sales: 68000 },
        { date: 'Sept 13', sales: 25000 },
        { date: 'Sept 14', sales: 85000 },
        { date: 'Sept 15', sales: 50000 },
        { date: 'Sept 16', sales: 85000 }
    ];

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
                            label: (context: any) => `₦${context.raw.toLocaleString()}`,
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
                            callback: (value: any) => {
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
            } as any}
        />
    )
}

export default LineChart
'use client'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DoughnutChartProps {
    data?: { name: string; value: number; color: string }[];
    sold?: number;
    unsold?: number;
}

const DoughnutChart = ({ data = [], sold = 65, unsold = 35 }: DoughnutChartProps) => {
    // Use dynamic data if provided, otherwise use sold/unsold props
    const chartData = data.length > 0 ? data : [
        { name: 'Sold Units', value: sold, color: '#ff008c' },
        { name: 'Unsold Units', value: unsold, color: '#a600ff' }
    ];

    const doughnutData = {
        labels: chartData.map(item => item.name),
        datasets: [
            {
                data: chartData.map(item => item.value),
                backgroundColor: chartData.map(item => item.color),
                hoverBackgroundColor: chartData.map(item => item.color + 'CC'),
                borderWidth: 0,
                borderRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
            },
        },
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <Doughnut data={doughnutData} options={options} />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-xl font-bold text-brand_gray_dark">
                    {data.length > 0 ? chartData.reduce((sum, item) => sum + item.value, 0) : sold}%
                </p>
            </div>
        </div>
    );
};

export default DoughnutChart;

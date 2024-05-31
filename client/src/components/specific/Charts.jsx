import React from 'react'
import { Line, Doughnut } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from "chart.js";
import { getLast7Days } from '../lib/features';
// import { getLast7Days } from "../../lib/features";

ChartJS.register(
    Tooltip,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Filler,
    ArcElement,
    Legend
);

function Charts() {
    return (
        <div>Charts</div>
    )
}
const labels = getLast7Days();

const lineChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
        title: {
            display: false,
        },
    },

    scales: {
        x: {
            grid: {
                display: false,
            },
        },
        y: {
            beginAtZero: true,
            grid: {
                display: false,
            },
        },
    },
};
export const LineChart = ({ value }) => {
    const data = {
        labels,
        datasets: [
            {
                data: value,
                label: "Messages",
                fill: true,
                backgroundColor: "rgba(5, 117, 227,0.3)",
                borderColor: " rgb(5, 117, 227)",
            },
        ],
    };

    return <Line data={data} options={lineChartOptions} />;
};

const doughnutChartOptions = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
    },
    cutout: 120,
};

export const DoughnutChart = ({ value = [], labels = [] }) => {
    const data = {
        labels,
        datasets: [
            {
                data: value,
                backgroundColor: ["rgba(75,12,192,0.2)", "rgba(234, 112, 112,0.2)"],
                hoverBackgroundColor: ["rgba(75,12,192,1)", "#ea7070"],
                borderColor: ["rgba(75,12,192,1)", "#ea7070"],
                offset: 40,
            },
        ],
    };
    return (
        <Doughnut
            style={{ zIndex: 10 }}
            data={data}
            options={doughnutChartOptions}
        />
    );
};

export default Charts
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title, Legend} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Legend);


const LineChart = (props) => {
    const options = {
        plugins: {
            legend: {
                display: false,
            },
        },
        scales: {
            y: {
                min: 0,
                max: 1,
            },
        },
    }

    return <Line data={props.data} options={options}/>;
};

export default LineChart;
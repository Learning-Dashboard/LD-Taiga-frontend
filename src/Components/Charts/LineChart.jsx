import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Title } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title);


const LineChart = (props) => {
    return <Line data={props.data} />;
};

export default LineChart;
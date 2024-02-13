import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
  labels: ['Undefined'],
  datasets: [
    {
      label: 'Undefined',
      data: [1],
      backgroundColor: ['rgba(255, 99, 132, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)'],
      borderWidth: 1,
      radius: '80%',
    },
  ],
};

const PieChart = (props) => {
  return <Doughnut data={props.datasetPie ? props.datasetPie : data} />;
};

export default PieChart;

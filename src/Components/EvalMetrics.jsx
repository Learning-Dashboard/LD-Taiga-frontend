import React, { useState, useEffect } from 'react';
import styles from './EvalMetrics.module.css';
import RadarChart from './Charts/Radar';
import PieChart from './Charts/PieChart';
import { Typewriter } from 'react-simple-typewriter';

const colors = [
  'rgba(255, 99, 132, 0.4)',
  'rgba(255, 99, 255, 0.4)',
  'rgba(99, 255, 132, 0.4)',
  'rgba(99, 255, 255, 0.4)',
  'rgba(255, 153, 0, 0.4)',
  'rgba(132, 99, 255, 0.4)',
  'rgba(255, 132, 99, 0.4)',
  'rgba(99, 132, 255, 0.4)',
  'rgba(255, 255, 99, 0.4)',
  'rgba(153, 255, 0, 0.4)',
];

const colorBorder = [
  'rgba(255, 99, 132)',
  'rgba(255, 99, 255)',
  'rgba(99, 255, 132)',
  'rgba(99, 255, 255)',
  'rgba(255, 153, 0)',
  'rgba(132, 99, 255)',
  'rgba(255, 132, 99)',
  'rgba(99, 132, 255)',
  'rgba(255, 255, 99)',
  'rgba(153, 255, 0)',
];

function extractvalues(data) {
  var result = [];
  data.map((dato) => result.push(dato.value * 100));
  return result;
}

const EvalMetrics = (props) => {
  const [loading, setLoading] = useState(false);
  const [proj, setProj] = useState('');
  const [hoursData, setHoursData] = useState('');
  const [dataset, setDataset] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (props.proyecto) {
      setProj(props.proyecto);
    }
    if (props.data) {
      var datasetaux = [];
      // eslint-disable-next-line array-callback-return
      Object.keys(props.data).map((key, index) => {
        datasetaux.push({
          label: key + ' Metrics',
          data: extractvalues(props.data[key]),
          backgroundColor: colors[index],
          borderColor: colorBorder[index],
          borderWidth: 2,
        });
      });
      setDataset(datasetaux);
    }
    if (props.hoursData) {
      var datasetaux2 = {
        labels: Object.keys(props.hoursData),
        datasets: [
          {
            label: '% of total hours',
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
            radius: '80%',
          },
        ],
      };
      Object.keys(props.hoursData).forEach((key, index) => {
        datasetaux2.datasets[0].data.push(props.hoursData[key].value * 100);
        datasetaux2.datasets[0].backgroundColor.push(colors[index]);
        datasetaux2.datasets[0].borderColor.push(colorBorder[index]);
      });
      setHoursData(datasetaux2);
    }
    if (props.lasteval) {
      const lastEvaluation = new Date(props.lasteval);
      const nextEvaluation = new Date(
        lastEvaluation.getTime() + 5 * 24 * 60 * 60 * 1000
      ); // +1 semana
      const now = new Date();

      if (now < nextEvaluation) {
        const timeLeft = Math.abs(nextEvaluation - now);

        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeLeft / 1000 / 60) % 60);

        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft(null);
      }
    }
    if (props.report) {
      var responseWithBreaks = props.report.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ));
      setReport(responseWithBreaks);
    }
  }, [
    props.proyecto,
    props.data,
    props.hoursData,
    props.lasteval,
    props.report,
  ]);

  const handleClick = () => {
    setLoading(true);
    fetch(
      `https://proxy-tfg.vercel.app/api/projects/${proj}/evaluate/projectmetrics`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        var responseWithBreaks = '';
        data.error
          ? (responseWithBreaks = data.error)
          : (responseWithBreaks = data.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            )));
        setReport(responseWithBreaks);
      });
  };

  return (
    <div className={styles.container_out}>
      {props.hoursData && Object.keys(props.hoursData).length > 0 ? (
        <div className={styles.container}>
          <div className={styles.tit}>Students Dedication Hours</div>
          <PieChart datasetPie={hoursData} />
          <br />
        </div>
      ) : null}
      <div className={styles.container}>
        <div className={styles.tit}>Students Overall</div>
        <RadarChart dataset={dataset} />
        <br />
      </div>
      <div className={styles.container2}>
        <button
          className={
            !report
              ? timeLeft
                ? styles.button_eval_inactive
                : styles.button_eval_active
              : styles.button_eval_inactive
          }
          onClick={handleClick}
          disabled={!report ? !!timeLeft : true}
        >
          {loading
            ? 'Reporting....'
            : timeLeft
            ? `There are ${timeLeft.days} days, ${timeLeft.hours} hours, and ${timeLeft.minutes} minutes left until the next evaluation`
            : 'Report'}
        </button>
        {loading && (
          <div className={styles.loadingText}>
            <Typewriter
              words={[
                'Analyzing students...',
                'Evaluating metrics...',
                'Getting results...',
              ]}
              loop={1}
              typeSpeed={200}
              deleteSpeed={50}
              delaySpeed={5000}
            />
          </div>
        )}
        {!loading &&
          (report ? (
            <div className={styles.evaluationText}>
              <p>{report}</p>
              <br />
            </div>
          ) : null)}
      </div>
    </div>
  );
};

export default EvalMetrics;

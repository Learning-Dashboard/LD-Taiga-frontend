import styles from './Metrics.module.css';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { faClockRotateLeft as solidClockRotateLeft } from '@fortawesome/free-solid-svg-icons';

import 'react-tabs/style/react-tabs.css';

import UserMetrics from './UserMetrics/UserMetrics.jsx';
import ProjectMetrics from './ProjectMetrics/ProjectMetrics';
import EvalMetrics from './EvalMetrics/EvalMetrics.jsx';
import ReactLoading from 'react-loading';
import StrategicMetrics from './StrategicMetrics/StrategicMetrics.jsx';
import QualityFactors from './QualityFactors/QualityFactors.jsx';
import HistoricalMetrics from './HistoricalMetrics/HistoricalMetrics.jsx';

function reload() {
  chrome.runtime.sendMessage({
    type: 'reloadpage',
  });
}

export default function Metrics(props) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usdata, setUsdata] = useState(null);
  const [pdata, setPdata] = useState(null);
  const [hours, setHours] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState(null); // Initialize as null
  const [strategic, setStrategic] = useState(null);
  const [factors, setFactors] = useState(null);
  const [isHistorical, setIsHistorical] = useState(false);
  const [historicalData, setHistorical] = useState(null);
  const [lastreport, setLastreport] = useState(null);
  const [report, setReport] = useState(null);

  const host = process.env.HOST;  //this is the production host

  useEffect(() => {
    chrome.storage.local.get('extensionTabs', (data) => {
      data &&
      Object.keys(data).length === 0 &&
      Object.getPrototypeOf(data) === Object.prototype
        ? setActiveTab(0)
        : setActiveTab(data.extensionTabs);
    });

    fetch(host+`api/projects/${props.proyecto}/historical_metrics`)
      .then((response) => response.json())
      .then((data) => {
        setHistorical(data);
      })
    
    fetch(host+`api/projects/${props.proyecto}/quality_factors`)
      .then((response) => response.json())
      .then((data) => {
        setFactors(data);
      })

    fetch(host+`api/projects/${props.proyecto}/strategic_indicators`)
      .then((response) => response.json())
      .then((data) => {
        setStrategic(data);
      });

    fetch(host+`api/projects/${props.proyecto}/metricscategories`)
      .then((response) => response.json())
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => console.error(error));

    fetch(host+`api/projects/${props.proyecto}/hours`)
      .then((response) => response.json())
      .then((data) => {
        setHours(data);
      })
      .catch((error) => console.error(error));

    fetch(host+`api/projects/${props.proyecto}/projectmetrics`)
      .then((response) => response.json())
      .then((data) => {
        data.error ? setError(true) : setError(false);
        setLoading(false);
        setPdata(data);
      })
      .catch((error) => {
        setError(true);
        setLoading(false);
        console.error(error);
      });

    setLoading(true);
    fetch(host+`api/projects/${props.proyecto}/usersmetrics`)
      .then((response) => {
        return response.json();
      })      
      .then((data) => {
        data.error ? setError(true) : setError(false);
        setLoading(false);
        setUsdata(data);
      })
      .catch((error) => {
        setError(true);
        setLoading(false);
        console.error(error);
      });

    fetch(host+`api/projects/${props.proyecto}/lastreport`)
      .then((response) => response.json())
      .then((data) => {
        data.error ? setError(true) : setError(false);
        setLoading(false);
        setLastreport(data.lastEvaluation);
        setReport(data.report);
      })
      .catch((error) => {
        setError(true);
        setLoading(false);
        console.error(error);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.proyecto]);

  const handleSelectChange = (event) => {
    const selectedTab = parseInt(event.target.value, 10);
    setActiveTab(selectedTab);
    chrome.storage.local.set({ extensionTabs: selectedTab }, () => {
      chrome.runtime.sendMessage({
        type: 'updateinnerTabs',
        extensionTabs: selectedTab,
      });
    });
  };

  const handleClickHistorical = (event) => {
    setIsHistorical(true);
  }

  const handleClickNotHistorical = (event) => {
    setIsHistorical(false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabbedContainer}>
        <div className={styles.tabList}>
          <div className={styles.tabcont}>
            <select value={activeTab} onChange={handleSelectChange}>
              {/*<option value="3">Strategic Indicators</option>
              <option value="4">Quality Factors</option>*/}
              <option value="1">Project Metrics</option>
              <option value="0">Users Metrics</option>
              <option value="2">Team Metrics</option> 
            </select>
          </div>
          { activeTab !== 2 ?
            <>
              <div className={styles.buttonHistorical} style={{backgroundColor: isHistorical ? '#FFC380' : ''}} onClick={handleClickHistorical}>
                <FontAwesomeIcon icon={solidClockRotateLeft} /> 
              </div>
              <div className={styles.buttonHistorical} style={{backgroundColor: !isHistorical ? '#FFC380' : ''}} onClick={handleClickNotHistorical}>
                <FontAwesomeIcon icon={faCalendar} /> 
              </div>
            </>
            :
            ''
          }
        </div>
            
        {loading ? (
          <div className={styles.loading}>
            <ReactLoading
              type="bubbles"
              color="#008aa8"
              height={'20%'}
              width={'20%'}
            />
          </div>
        ) : error ? (
          <div className={styles.errorcontainer}>
            <img
              src="https://tree.taiga.io/v-1664173031373/images/empty/empty_tex.png"
              className={styles.errorimg}
              width={510}
              height={100}
              alt="error"
            />
            <div className={styles.errortext}>
              Ooops, something went wrong. Metrics could not be loaded...
            </div>
            <div className={styles.reload} onClick={reload}>
              Try reloading the page here
            </div>
          </div>
        ) : categories === null ? ( // Check if categories are null
          <div>Loading categories...</div>
        ) : (
          <>
            {activeTab === 0 && (
              <div className={styles.tabPanel}>
                { isHistorical ?
                  (<HistoricalMetrics data={historicalData.userMetrics} type={activeTab}/>)
                  :
                  (<UserMetrics dataus={usdata} categories={categories}/>)
                }
              </div>
            )}
            {activeTab === 1 && (
              <div className={styles.tabPanel}>
                { isHistorical ?
                  (<HistoricalMetrics data={historicalData.projectMetrics} type={activeTab}/>)
                  :
                  (<ProjectMetrics data={pdata} categories={categories}/>)
                }
              </div>
            )}
            {activeTab === 2 && (
              <div className={styles.tabPanel}>
                    <EvalMetrics
                      data={usdata}
                      hoursData={hours}
                      proyecto={props.proyecto}
                      lasteval={lastreport}
                      report={report}
                    />
              </div>
            )}
            {activeTab === 3 && (
              <div className={styles.tabPanel}>
                { isHistorical ?
                  (<HistoricalMetrics data={historicalData.strategicMetrics} type={activeTab}/>)
                  :
                  (<StrategicMetrics strategic={strategic}/>)
                }
              </div>
            )}
            {activeTab === 4 && (
              <div className={styles.tabPanel}>
                { isHistorical ?
                  (<HistoricalMetrics data={historicalData.qualityFactors} type={activeTab}/>)
                  :
                  (<QualityFactors data={factors} categories={categories}/>)
                }
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
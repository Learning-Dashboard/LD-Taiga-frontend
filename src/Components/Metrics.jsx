import styles from './Metrics.module.css';
import { useState, useEffect } from 'react';
import 'react-tabs/style/react-tabs.css';
import UserMetrics from './UserMetrics';
import ProjectMetrics from './ProjectMetrics';
import EvalMetrics from './EvalMetrics.jsx';
import ReactLoading from 'react-loading';

function reload() {
  chrome.runtime.sendMessage({
    type: 'reloadpage',
  });
}

export default function Metrics(props) {
  const [error, seterror] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usdata, setUsdata] = useState(null);
  const [pdata, setPdata] = useState(null);
  const [hours, setHours] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // estado de la pestaña activa
  const [categories, setCategories] = useState('');
  const [lastreport, setLastreport] = useState(null);
  const [report, setReport] = useState(null);

  useEffect(() => {
    chrome.storage.local.get('extensionTabs', (data) => {
      console.log('tabs:');
      console.log(data);

      data &&
      Object.keys(data).length === 0 &&
      Object.getPrototypeOf(data) === Object.prototype
        ? setActiveTab(0)
        : setActiveTab(data.extensionTabs);
    });
    fetch(
      `https://proxy-tfg.vercel.app/api/projects/${props.proyecto}/metricscategories`
    )
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        setCategories(data);
      })
      .catch((error) => console.error(error));

    fetch(`https://proxy-tfg.vercel.app/api/projects/${props.proyecto}/hours`)
      .then((response) => response.json())
      .then((data) => {
        //console.log(data);
        setHours(data);
      })
      .catch((error) => console.error(error));

    fetch(
      `https://proxy-tfg.vercel.app/api/projects/${props.proyecto}/projectmetrics`
    )
      .then((response) => response.json())
      .then((data) => {
        data.error ? seterror(true) : seterror(false);
        setLoading(false);
        setPdata(data);
      })
      .catch((error) => {
        seterror(true);
        setLoading(false);
        console.error(error);
      });
    setLoading(true);
    fetch(
      `https://proxy-tfg.vercel.app/api/projects/${props.proyecto}/usersmetrics`
    )
      .then((response) => response.json())
      .then((data) => {
        data.error ? seterror(true) : seterror(false);
        setLoading(false);
        setUsdata(data);
      })
      .catch((error) => {
        seterror(true);
        setLoading(false);
        console.error(error);
      });

    fetch(
      `https://proxy-tfg.vercel.app/api/projects/${props.proyecto}/lastreport`
    )
      .then((response) => response.json())
      .then((data) => {
        data.error ? seterror(true) : seterror(false);
        setLoading(false);
        setLastreport(data.lastEvaluation);
        setReport(data.report);
      })
      .catch((error) => {
        seterror(true);
        setLoading(false);
        console.error(error);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.proyecto]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.tabbedContainer}>
          <div className={styles.tabList}>
            <div className={styles.tabcont}>
              <div
                className={activeTab === 0 ? styles.activeTab : styles.tab}
                onClick={() => {
                  setActiveTab(0);
                  chrome.storage.local.set({ extensionTabs: 0 }, () => {
                    chrome.runtime.sendMessage({
                      type: 'updateinnerTabs',
                      extensionTabs: 0,
                    });
                  });
                }}
              >
                Users Metrics
              </div>
              <div
                className={activeTab === 1 ? styles.activeTab : styles.tab}
                onClick={() => {
                  setActiveTab(1);
                  chrome.storage.local.set({ extensionTabs: 1 }, () => {
                    chrome.runtime.sendMessage({
                      type: 'updateinnerTabs',
                      extensionTabs: 1,
                    });
                  });
                }}
              >
                Project Metrics
              </div>
              <div
                className={activeTab === 2 ? styles.activeTab : styles.tab}
                onClick={() => {
                  setActiveTab(2);
                  chrome.storage.local.set({ extensionTabs: 2 }, () => {
                    chrome.runtime.sendMessage({
                      type: 'updateinnerTabs',
                      extensionTabs: 2,
                    });
                  });
                }}
              >
                Metrics Evaluation
              </div>
            </div>
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
          ) : (
            <>
              {activeTab === 0 && (
                <div className={styles.tabPanel}>
                  <UserMetrics dataus={usdata} categories={categories} />
                </div>
              )}
              {activeTab === 1 && (
                <div className={styles.tabPanel}>
                  <ProjectMetrics data={pdata} categories={categories} />
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
            </>
          )}
        </div>
      </div>
    </>
  );
}

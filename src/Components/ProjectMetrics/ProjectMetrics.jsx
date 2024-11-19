import styles from './ProjectMetrics.module.css';
import { useState, useEffect } from 'react';
import SpeedometerStyled from '../ReusableComponents/SpeedmeterStyled/SpeedometerStyled';
import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';

export default function ProjectMetrics(props) {
  const [dataMetrics, setDataMetrics] = useState({});
  const [selectedFiltersKeys, setSelectedFiltersKeys] = useState([]);
  const [filters, setFilters] = useState([]);
  const [categories, setCategories] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const getProjectFilters = () => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'getProjectFilters' }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (response.error) {
          return reject(response.error);
        }
        resolve(response.projectFilters);
      });
    });
  };

  const setProjectFilters = (filters) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'setProjectFilters', projectFilters: filters }, (response) => {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (response.error) {
          return reject(response.error);
        }
        resolve(response.status);
      });
    });
  };

  useEffect(() => {
    const initialize = async () => {

      if (props.data) { 
        const result = Object.keys(props.data).reduce((acc, key) => { //El procesamiento cambia porque props.data es un objeto y no un arreglo
          if (Array.isArray(props.data[key]) && props.data[key].length > 0) {
            acc[key] = props.data[key][0]; 
          }
          return acc;
        }, {});

        setDataMetrics(result);

        setFilters(Object.keys(result));

      }
      if (props.categories) {
        setCategories(props.categories);
      }
      
      try {
        const filtersFromStorage = await getProjectFilters();
        if (filtersFromStorage && Array.isArray(filtersFromStorage)) {
          setSelectedFiltersKeys(filtersFromStorage);
        } else {
          setSelectedFiltersKeys([]);
        }
      } catch (error) {
        console.error('Error al obtener projectFilters:', error);
        setSelectedFiltersKeys([]);
      }
    };
    
    initialize();
  }, [props.data, props.categories]);

  const handleFilterButtonClick = async (key) => {
    let updateSelectedFiltersKeys = [...selectedFiltersKeys];

    if (updateSelectedFiltersKeys.includes(key)) {
      updateSelectedFiltersKeys = updateSelectedFiltersKeys.filter((el) => el !== key);
    } else {
      updateSelectedFiltersKeys.push(key);
    }

    setSelectedFiltersKeys(updateSelectedFiltersKeys);

    try {
      await setProjectFilters(updateSelectedFiltersKeys);
    } catch (error) {
      console.error('Error al guardar projectFilters:', error);
    }
  };

  const getData = (key) => {
    if (key) {

      if (
        key === "commitstasksrelation" ||
        key === "fulfillmentoftasks" ||
        key === "taskseffortinformation" ||
        key === "userstoriesdefinitionquality"
      ) return categories.Default;

      else if (
        key === "commitsmanagement" ||
        key === "deviationmetrics" ||
        key === "unassignedtasks"
      ) return categories.RDefault;
      
      else if (key === "taskscontribution") {
        return categories.Deviation;
      } else {
        return {
          values: [0, 1],
          colors: ['rgba(99, 132, 255)'],
        };
      }
    }
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const isSelected = (key) => {
    return selectedFiltersKeys.length === 0 || selectedFiltersKeys.includes(key);
  };

  return (
    <div className={styles.container}>
      <div className={styles.filter_container}>
          <motion.div className={styles.buttons_container} layout="position" onClick={handleClick}>
              <div className={styles.filtername}>Filters</div>
              <div
                  className={`${styles.filterIcon} ${isOpen ? styles.black : ''}`} 
              >
                  <TbAdjustments size={20} />
              </div>
          </motion.div>

          {isOpen && (
              <>
                  <div>
                      {filters.map((key) => (
                          <button
                              key={key}
                              onClick={() => handleFilterButtonClick(key)}
                              className={
                                  selectedFiltersKeys?.includes(key)
                                  ? styles.buttons_active
                                  : styles.buttons
                              }
                              >
                              {dataMetrics[key]?.name || key}
                          </button>
                      ))}
                  </div>
              </>
          )}
      </div>

      <div
        styles={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {Object.keys(dataMetrics).map((key) => {

          const metric = dataMetrics[key];

          if (!isSelected(key)) return null;
          return (
            <div key={key}>
              <SpeedometerStyled
                  name={metric.name}
                  description={metric.description}
                  value={metric.value}
                  data={getData(key)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
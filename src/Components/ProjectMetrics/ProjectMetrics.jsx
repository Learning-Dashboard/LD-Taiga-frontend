import styles from './ProjectMetrics.module.css';
import { useState, useEffect } from 'react';
import SpeedometerStyled from '../ReusableComponents/SpeedmeterStyled/SpeedometerStyled';
import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';

export default function ProjectMetrics(props) {
  const [dataMetrics, setDataMetrics] = useState('');
  const [selectedFiltersStudents, setSelectedFiltersStudents] = useState([]);
  const [categories, setCategories] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (props.data) {
      setDataMetrics(props.data);
    }
    if (props.categories) {
      setCategories(props.categories);
    }
    chrome.storage.local.get('projectFilters', (data) => {
      data &&
      Object.keys(data).length === 0 &&
      Object.getPrototypeOf(data) === Object.prototype
        ? setSelectedFiltersStudents([])
        : setSelectedFiltersStudents(data.projectFilters);
    });
  }, [props.data, props.categories]);

  const handleFilterButtonClick = (selectedStudent) => {
    if (selectedFiltersStudents.includes(selectedStudent)) {
      let filters2 = selectedFiltersStudents.filter(
        (el) => el !== selectedStudent
      );
      setSelectedFiltersStudents(filters2);
      chrome.storage.local.set({ projectFilters: filters2 }, () => {
        chrome.runtime.sendMessage({
          type: 'updateprojectFilters',
          projectFilters: filters2,
        });
      });
    } else {
      setSelectedFiltersStudents([...selectedFiltersStudents, selectedStudent]);
      chrome.storage.local.set(
        { projectFilters: [...selectedFiltersStudents, selectedStudent] },
        () => {
          chrome.runtime.sendMessage({
            type: 'updateprojectFilters',
            projectFilters: [...selectedFiltersStudents, selectedStudent],
          });
        }
      );
    }
  };

  const getData = (dato) => {

    if(dato.qualityFactors){

      if(dato.qualityFactors.includes('deviationmetrics') || dato.qualityFactors.includes('commitsmanagement') || dato.qualityFactors.includes('unassignedtasks')){ 
        return categories.RDefault;
      } 
      else if(dato.qualityFactors.includes('hours') && dato.qualityFactors.includes('activitydistribution')){
        return {
          values: [0, 1],
          colors: ['rgba(99, 132, 255)'],
        };

      } else 
        return categories.Default;
    }
};


  return (
    <div className={styles.container}>
      <motion.div
        className={`${styles['buttons_container2']} ${
          isOpen ? styles.open : ''
        }`}
        transition={{ layout: { duration: 0.2 } }}
        layout
      >
        <motion.div className={styles.buttons_container} layout="position" onClick={handleClick}>
          <div className={styles.filtername}>Filters</div>
          <div
            className={`${styles.filterIcon} ${isOpen ? styles.black : ''}`}
            
          >
            <TbAdjustments size={20} />
          </div>
        </motion.div>
        {isOpen && (
          <motion.div style={{ marginTop: '10px' }}>
            {Object.keys(dataMetrics).map((key) => (
              <button
                onClick={() => handleFilterButtonClick(key)}
                className={
                  selectedFiltersStudents?.includes(key)
                    ? styles.buttons_active
                    : styles.buttons
                }
              >
                {key.replace(/_|#|-|@|<>|^[H]/g, ' ')}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      <div
        styles={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {Object.keys(dataMetrics).map((key) => {
          if (
            selectedFiltersStudents.length <= 0 ||
            selectedFiltersStudents.includes(key)
          ) {
            const metric = dataMetrics[key];
            return (
              <>
                {metric.map((dato) => (
                  <SpeedometerStyled
                    key={dato.id}
                    name={dato.name}
                    description={dato.description}
                    value={dato.value}
                    data={getData(dato)}
                  />                
              
                ))}
              </>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
import styles from './ProjectMetrics.module.css';
import { useState, useEffect } from 'react';
import Speedometer from './Charts/Speedometer';
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
      console.log('projectFilters:');
      console.log(data);

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

  return (
    <div className={styles.container}>
      <motion.div
        className={`${styles['buttons_container2']} ${
          isOpen ? styles.open : ''
        }`}
        transition={{ layout: { duration: 0.2 } }}
        layout
      >
        <motion.div className={styles.buttons_container} layout="position">
          <div className={styles.filtername}>Filters</div>
          <div
            className={`${styles.filterIcon} ${isOpen ? styles.black : ''}`}
            onClick={handleClick}
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
            return (
              <div>
                {' '}
                <>
                  <hr style={{ width: '500px' }} />
                  <br />
                </>
                <div className={styles.titulo}>
                  <div className={styles.infoTit}>
                    {key.replace(/_|#|-|@|<>|^[H]/g, ' ')}{' '}
                  </div>
                </div>
                {dataMetrics[key].map((dato) => (
                  <>
                    {dato.description !== '' ? (
                      <div className={styles.infodesc}>{dato.description} </div>
                    ) : null}
                    <div key={dato.id} className={styles.speedometers}>
                      <Speedometer
                        value={dato.value * 100}
                        text={dato.name}
                        data={
                          dato.qualityFactors &&
                          (dato.qualityFactors.includes('deviationmetrics') ||
                            dato.qualityFactors.includes('commitsmanagement') ||
                            dato.qualityFactors.includes('unassignedtasks'))
                            ? categories.RDefault
                            : dato.qualityFactors.includes('hours') &&
                              dato.qualityFactors.includes(
                                'activitydistribution'
                              )
                            ? {
                                values: [0, 1],
                                colors: ['rgba(99, 132, 255)'],
                              }
                            : categories.Default
                        }
                      />
                    </div>
                  </>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

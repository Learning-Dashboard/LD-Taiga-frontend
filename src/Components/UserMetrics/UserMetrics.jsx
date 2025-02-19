import styles from './UserMetrics.module.css';
import { useState, useEffect } from 'react';
import RadarChart from '../Charts/Radar';
import SpeedometerStyled from '../ReusableComponents/SpeedmeterStyled/SpeedometerStyled';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';

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

export default function UserMetrics(props) {
  const [dataMetrics, setDataMetrics] = useState('');
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [selectedFiltersStudents, setSelectedFiltersStudents] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState('');

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const filters = [
    'assignedtasks',
    'closedtasks',
    'modifiedlines',
    'commits',
  ];

  const filterNames = {
    assignedtasks: 'Tasks',
    closedtasks: 'Closed tasks',
    modifiedlines: 'Modified lines',
    commits: 'Commits',
  };

  const getUserFilters = (filterKey) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'getUserFilters', key: filterKey }, (response) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        if (response.error) return reject(response.error);
        resolve(response.data || []);
      });
    });
  };

  const setUserFilters = (filterKey, filters) => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'setUserFilters', key: filterKey, data: filters }, (response) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        if (response.error) return reject(response.error);
        resolve(response.status);
      });
    });
  };

  useEffect(() => {
    const initialize = async () => {
      if (props.dataus) setDataMetrics(props.dataus);
      if (props.categories) setCategories(props.categories);

      try {
        const filtersFromStorage = await getUserFilters('usersFilters');
        console.log('Filtros de categorías recuperados:', filtersFromStorage);
        setSelectedFilters(filtersFromStorage);

        const filtersStudentFromStorage = await getUserFilters('usersFiltersStudent');
        console.log('Filtros de usuarios recuperados:', filtersStudentFromStorage);
        setSelectedFiltersStudents(filtersStudentFromStorage);
      } catch (error) {
        console.error('Error al obtener filtros:', error);
      }
    };

    initialize();
  }, [props.dataus, props.categories]);

  const handleFilterButtonClick = async (selectedCategory) => {
    let updatedFilters = [...selectedFilters];
    if (updatedFilters.includes(selectedCategory)) {
      updatedFilters = updatedFilters.filter((el) => el !== selectedCategory);
    } else {
      updatedFilters.push(selectedCategory);
    }
    setSelectedFilters(updatedFilters);

    try {
      await setUserFilters('usersFilters', updatedFilters);
    } catch (error) {
      console.error('Error al guardar usersFilters:', error);
    }
  };

  const handleFilterButtonClickStudents = async (selectedStudent) => {
    let updatedFiltersStudents = [...selectedFiltersStudents];
    if (updatedFiltersStudents.includes(selectedStudent)) {
      updatedFiltersStudents = updatedFiltersStudents.filter((el) => el !== selectedStudent);
    } else {
      updatedFiltersStudents.push(selectedStudent);
    }
    setSelectedFiltersStudents(updatedFiltersStudents);

    try {
      await setUserFilters('usersFiltersStudent', updatedFiltersStudents);
    } catch (error) {
      console.error('Error al guardar usersFiltersStudent:', error);
    }
  };

  const getData = (dato) => {
    if(dato.qualityFactors) {
      if (dato.qualityFactors.includes('commits') || dato.qualityFactors.includes('modifiedlinescontribution')) {
        return {
          values: [0, 1],
          colors: ['rgba(99, 132, 255)'],
        };
      } else {
        return categories.memberscontribution;
      }
    }
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
              <div className={styles.buttons_container3}>
                {filters.map((key) => (
                  <button
                    onClick={() => handleFilterButtonClick(key)}
                    className={
                      selectedFilters?.includes(key)
                        ? styles.buttons_active
                        : styles.buttons
                    }
                  >
                    {filterNames[key]}
                  </button>
                ))}
              </div>
              <motion.div className={styles.buttons_container3}>
                {Object.keys(dataMetrics)
                  .filter((key) => !["anonymous", "sd", "taskreference"].includes(key))
                  .map((key) => (
                  <button 
                    onClick={() => handleFilterButtonClickStudents(key)}
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
            </>
          )}
      </div>
      {selectedFilters.length <= 0 ? (
        <div
          styles={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {Object.keys(dataMetrics)
          .filter((key) => !["anonymous", "sd", "taskreference"].includes(key))
          .map((key, index) => {
            if (
              selectedFiltersStudents.length <= 0 ||
              selectedFiltersStudents.includes(key)
            ) {
              return (
                <div key={key}>
                  <hr style={{ width: '500px' }} />

                  <div>
                    {' '}
                    <div className={styles.titulo}>
                      <div className={styles.infoTit}>{key} </div>
                    </div>
                    <div>
                      <RadarChart
                        values={extractvalues(dataMetrics[key])}
                        dataset={[
                          {
                            label: key + ' Metrics',
                            data: extractvalues(dataMetrics[key]),
                            backgroundColor: colors[index],
                            borderColor: colorBorder[index],
                            borderWidth: 2,
                          },
                        ]}
                      />
                    </div>
                    {dataMetrics[key].map((dato) => (
                      <>
                        <div
                          key={dato.id}
                          className={styles.info}
                          data-tooltip-id={dato.id}
                          data-tooltip-content={dato.description}
                        >
                          <Tooltip id={dato.id} place="left" />
                          <div className={styles.infoBut}>{dato.name}</div>
                          Last updated at {dato.date}. Value in % :&nbsp;
                          {(dato.value * 100).toFixed(2)}%
                        </div>
                      </>
                    ))}
                  </div>
                  <br />
                </div>
              );
            }
            return null;
          })}
        </div>
      ) : (
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
                <div key={key}>
                  {dataMetrics[key].map((dato) => {
                    const isSelected =
                      selectedFilters.includes(
                        dato.id.toLowerCase().substring(0, dato.id.indexOf('_'))
                      ) ||
                      selectedFilters.includes(dato.qualityFactors[0].toLowerCase());
              
                    if (isSelected) {
                      return (
                        <div key={dato.id}>
                          <SpeedometerStyled
                            value={dato.value}
                            name={dato.name}
                            description={dato.description}
                            data={getData(dato)}
                          />
                        </div>
                      );
                    }
                    return null; 
                  })}
                </div>
              );              
            }
            return null;
          })}{' '}
        </div>
      )}
    </div>
  );
}
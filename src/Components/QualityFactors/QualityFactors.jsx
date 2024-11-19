import { useState, useEffect } from 'react';

import styles from './QualityFactors.module.css';
import SpeedometerStyled from '../ReusableComponents/SpeedmeterStyled/SpeedometerStyled';
import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';

export default function QualityFactors(props) {
    const [dataMetrics, setDataMetrics] = useState([]);
    const [categories, setCategories] = useState('');
    const [selectedFiltersKeys, setSelectedFiltersKeys] = useState([]);
    const [filters, setFilters] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const getQualityFilters = () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'getQualityFilters' }, (response) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                if (response.error) {
                    return reject(response.error);
                }
                resolve(response.qualityFilters);
            });
        });
    };

    const setQualityFilters = (filters) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'setQualityFilters', qualityFilters: filters }, (response) => {
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
                const result = props.data.reduce((acc, current) => {
                    const id = current.id === null ? "id" : current.id;
                    const updatedCurrent = { ...current, id };
                    acc[id] = updatedCurrent; // Almacena el objeto directamente
                    return acc;
                }, {}); 

                setDataMetrics(result);

                setFilters(Object.keys(result));   
            }
            
            if (props.categories) {
                setCategories(props.categories);
            }

            try {
                const filtersFromStorage = await getQualityFilters();
                if (filtersFromStorage && Array.isArray(filtersFromStorage)) {
                    setSelectedFiltersKeys(filtersFromStorage);
                } else {
                    setSelectedFiltersKeys([]);
                }
            } catch (error) {
                console.error('Error al obtener qualityFilters:', error);
                setSelectedFiltersKeys([]);
            }
        };

        initialize();

    }, [props.data, props.categories]);


    function getData(key) {
        if (key) {

            if (key === "commitstasksrelation" || key === "fulfillmentoftasks" || key === "taskseffortinformation" || key === "userstoriesdefinitionquality" ) {
                return categories.Default
            } 
            else if (key === "commitsmanagement" || key === "deviationmetrics" || key === "unassignedtasks") {
                return categories.RDefault;
            } 
            else if (key === "taskscontribution") {
                return categories.Deviation;
            }
            else {
                return {
                    values: [0, 1],
                    colors: ['rgba(99, 132, 255)'],
                }
            }
        }    
    }

    async function handleFilterButtonClick(key) {
        let updateSelectedFiltersKeys = [...selectedFiltersKeys];
        
        if (updateSelectedFiltersKeys.includes(key)) 
            updateSelectedFiltersKeys = updateSelectedFiltersKeys.filter((el) => el !== key);
        else 
            updateSelectedFiltersKeys.push(key);

        setSelectedFiltersKeys(updateSelectedFiltersKeys);

        try {
            await setQualityFilters(updateSelectedFiltersKeys);
        }
        catch (error) {
            console.error('Error al guardar qualityFilters:', error);
        }
    }

    function handleClick() {
        setIsOpen(!isOpen);
    }

    function isSelected(key) {
        return (selectedFiltersKeys.length === 0 || selectedFiltersKeys.includes(key));
    }

    return (
        <div className={styles.mainContainer}>
  
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

                {Object.keys(dataMetrics).map((key) => {

                    const metric = dataMetrics[key];

                    if (!isSelected(key)) return null;
                    return (
                        <div key={key}>
                            <SpeedometerStyled
                                name={metric.name}
                                description={metric.description}
                                value={metric.value.first}
                                data={getData(key)}
                            />
                        </div>
                    );
                })}
        </div>
    );
}

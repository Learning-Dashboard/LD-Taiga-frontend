import LineChart from '../Charts/LineChart';
import styles from './HistoricalMetrics.module.css';

import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';

export default function HistoricalMetrics(props) {

    const today = new Date();
    const oneYearEarlier = new Date();
    oneYearEarlier.setFullYear(oneYearEarlier.getFullYear() -1);

    const [fromDate, setFromDate] = useState(oneYearEarlier.toISOString().split('T')[0]);

    const [toDate, setToDate] = useState(today.toISOString().split('T')[0]); // Initialize to current date in YYYY-MM-DD format

    const [data, setData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [isOpen, setIsOpen] = useState(false);         

    const [selectedFiltersKeys, setSelectedFiltersKeys] = useState([]);

    const [showFilter, setShowFilter] = useState(true);

    const [filters, setFilters] = useState([]);

    const getHistoricalData = (storageKey) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'getHistoricalFilters', key: storageKey }, (response) => {
                if (chrome.runtime.lastError) {
                    return reject(chrome.runtime.lastError);
                }
                if (response.error) {
                    return reject(response.error);
                }
                resolve(response.data);
            });
        });
    };

    const setHistoricalData = (storageKey, data) => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage({ type: 'setHistoricalFilters', key: storageKey, data }, (response) => {
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
                    if (!acc[id]) {
                    acc[id] = [];
                    }
                    acc[id].push(updatedCurrent);
                    return acc;
                }, {}); 

                
                setData(result);
                setOriginalData(result);

                if (props.type !== undefined && props.type !== null){
                    if(props.type === 3) {
                        setShowFilter(false);
                    } else {
                        const dynamicFilters = Object.keys(result);
                        setFilters(dynamicFilters);

                        try {
                            const storageKey = `historicalMetrics_type_${props.type}`;
                            const storedData = await getHistoricalData(storageKey);
                            
                            if (storedData) {
                                const { selectedFilters, storedFromDate, storedToDate } = storedData;
                                setSelectedFiltersKeys(selectedFilters || []);
                                setFromDate(storedFromDate || oneYearEarlier.toISOString().split('T')[0]);
                                setToDate(storedToDate || today.toISOString().split('T')[0]);
                            } else {
                                setSelectedFiltersKeys([]);
                                setFromDate(oneYearEarlier.toISOString().split('T')[0]);
                                setToDate(today.toISOString().split('T')[0]);
                            }
                        } catch (error) {
                            console.error('Error al obtener historicalMetrics:', error);
                            setSelectedFiltersKeys([]);
                            setFromDate(oneYearEarlier.toISOString().split('T')[0]);
                            setToDate(today.toISOString().split('T')[0]);
                        }
                    }

                    if(props.type === 0){
                        // Invertir cada array de datos para que estén en orden cronológico correcto
                        Object.keys(result).forEach(key => {
                            result[key] = [...result[key]].reverse(); // Crear una copia y luego invertir
                        });
                    }
                    
                } else {
                    const dynamicFilters = Object.keys(result);
                    setFilters(dynamicFilters);
                }
            }
        }; 

        initialize();
    }, [props.data, props.type]);

    useEffect(() => {
        function filterDates() {
            if (!originalData) return;

            const filteredData = {};

            Object.keys(originalData).forEach(key => {
                filteredData[key] = originalData[key].filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getTime() >= new Date(fromDate).getTime() && itemDate.getTime() <= new Date(toDate).getTime();
                });
            });

            setData(filteredData);
        }

        filterDates();
    }, [fromDate, toDate, originalData]);
    
    const handleStartDateChange = async (e) => {
        const newFromDate = e.target.value; 
        setFromDate(newFromDate);
        try {
            await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                selectedFilters: selectedFiltersKeys,
                storedFromDate: newFromDate, 
                storedToDate: toDate
            });
        } catch (error) {
            console.error('Error al guardar fechas:', error);
        }
    };
    
    const handleEndDateChange = async (e) => {
        const newToDate = e.target.value; 
        setToDate(newToDate);
        try {
            await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                selectedFilters: selectedFiltersKeys,
                storedFromDate: fromDate,
                storedToDate: newToDate 
            });
        } catch (error) {
            console.error('Error al guardar fechas:', error);
        }
    };


    async function handleFilterButtonClick(key) {
        let updateSelectedFiltersKeys = [...selectedFiltersKeys];
        
        if (updateSelectedFiltersKeys.includes(key)) 
            updateSelectedFiltersKeys = updateSelectedFiltersKeys.filter((el) => el !== key);
        else 
            updateSelectedFiltersKeys.push(key);

        setSelectedFiltersKeys(updateSelectedFiltersKeys);

        try {
            await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                selectedFilters: updateSelectedFiltersKeys,
                storedFromDate: fromDate,
                storedToDate: toDate
            });
        } catch (error) {
            console.error('Error al guardar historicalFilters:', error);
        }
    }

    function getData(data, key) {
        return data[key].map((row) => {

            if (row.value.first === undefined) return row.value.toFixed(2);
            else return row.value.first.toFixed(2);
            
        })
    }

    function handleClick() {
        setIsOpen(!isOpen);
    }

    function isSelected(key) {
        return (selectedFiltersKeys.length === 0 || selectedFiltersKeys.includes(key));
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.actionContainer}>
                <div className={styles.inputContainer}>
                    <span>From:</span>
                    <input
                        style={{ marginLeft: '10px' }}
                        type="date"
                        value={fromDate}
                        onChange={handleStartDateChange}
                    />
                </div>

                <div className={styles.inputContainer}>
                    <span>To:</span>
                    <input
                        style={{ marginLeft: '10px' }}
                        type="date"
                        value={toDate}
                        onChange={handleEndDateChange}
                    />
                </div>
            </div>

            {showFilter && (
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
                                    {data[key][0]?.name || key}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
            )}

            <div className={styles.charContainer}>
                {data ? (
                    Object.keys(data).map((key) => (
                        <div key={key}>
                            {isSelected(key) && (
                                <div className={styles.linearChart}>
                                    <LineChart
                                        data={{
                                            labels: data[key].map((row) => row.date),
                                            datasets: [
                                                {
                                                    label: "",
                                                    data: getData(data, key),
                                                    fill: true,
                                                    backgroundColor: "rgba(75,192,192,0.2)",
                                                    borderColor: "rgba(75,192,192,1)"
                                                }
                                            ]
                                        }}
                                    />
                                    <div>{data[key][0].name}</div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
}

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

    const [dateError, setDateError] = useState('');  

    // Estados adicionales para type=0
    const [selectedFiltersStudents, setSelectedFiltersStudents] = useState([]);
    const [filterStudents, setFilterStudents] = useState([]);

    // Definición de filtros y nombres para users
    const predefinedFilters = [
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

    const initialize = async () => {
        if (props.data) { 
            
            setData(props.data);
            setOriginalData(props.data);

            const { type } = props;

            setShowFilter(type !== 3);

            if (type !== 3 && type !== 0) {
                const dynamicFilters = Object.keys(props.data);
                setFilters(dynamicFilters);
            }

            if (type === 0) {
                const auxFilterStudents = [...new Set(
                    Object.keys(props.data).map(key => key.split('_')[1]) //TODO: Recibir los nombres como en UserMetrics sino salen numeros diferentes. Esto revisar en el backend de Taiga
                )];
                setFilterStudents(auxFilterStudents);
            }

            try {
                const storageKey = `historicalMetrics_type_${type}`;
                const storedData = await getHistoricalData(storageKey);

                if (storedData) {
                    
                    const { selectedStudents, selectedFilters, storedFromDate, storedToDate } = storedData;

                    if (type !== 3) setSelectedFiltersKeys(selectedFilters || []);
                    if (type === 0) setSelectedFiltersStudents(selectedStudents || []);
                
                    setFromDate(storedFromDate || oneYearEarlier.toISOString().split('T')[0]);
                    setToDate(storedToDate || today.toISOString().split('T')[0]);
                } else {
                    if (type !== 3) setSelectedFiltersKeys([]);
                    if (type === 0) setSelectedFiltersStudents([]);

                    setFromDate(oneYearEarlier.toISOString().split('T')[0]);
                    setToDate(today.toISOString().split('T')[0]);
                }
            } catch (error) {
                console.error('Error al obtener historicalMetrics:', error);
                if (type !== 3) setSelectedFiltersKeys([]);
                if (type === 0) setSelectedFiltersStudents([]);
                
                setFromDate(oneYearEarlier.toISOString().split('T')[0]);
                setToDate(today.toISOString().split('T')[0]);
            }

        }
    };

    useEffect(() => { 
        initialize();
    }, [props.data, props.type]);


    function filterDates() {
        if (!originalData) return;
    
        const filteredData = {};
    
        Object.keys(originalData).forEach(key => {
            if (Array.isArray(originalData[key])) {
                filteredData[key] = originalData[key].filter(item => {
                    const itemDate = new Date(item.date);
                    return itemDate.getTime() >= new Date(fromDate).getTime() && itemDate.getTime() <= new Date(toDate).getTime();
                });
            } else {
                filteredData[key] = [];
            }
        });
    
        setData(filteredData);
    };

    useEffect(() => {
        filterDates();
    }, [fromDate, toDate, originalData]);
    
    const handleStartDateChange = async (e) => {
        const newFromDate = e.target.value; 

        if (newFromDate >= toDate) {
            setDateError("'From' date must be before than 'To' date.");
            return;
        } else {
            setDateError('');
        }

        setFromDate(newFromDate);
        try {

            if (props.type !== 0) {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedFilters: selectedFiltersKeys,
                    storedFromDate: newFromDate, 
                    storedToDate: toDate
                });
            } else {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedStudents: selectedFiltersStudents,
                    selectedFilters: selectedFiltersKeys,
                    storedFromDate: newFromDate, 
                    storedToDate: toDate
                });
            }
        } catch (error) {
            console.error('Error al guardar fechas:', error);
        }
    };
    
    const handleEndDateChange = async (e) => {
        const newToDate = e.target.value; 

        if (newToDate <= fromDate) {
            setDateError("'To' date must be later than 'From' date.");
            return;
        } else {
            setDateError('');
        }

        setToDate(newToDate);
        try {
            if (props.type !== 0) {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedFilters: selectedFiltersKeys,
                    storedFromDate: fromDate, 
                    storedToDate: newToDate
                });
            } else {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedStudents: selectedFiltersStudents,
                    selectedFilters: selectedFiltersKeys,
                    storedFromDate: fromDate, 
                    storedToDate: newToDate
                });
            }
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

            if (props.type !== 0) {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedFilters: updateSelectedFiltersKeys,
                    storedFromDate: fromDate,
                    storedToDate: toDate
                });
            } else {
                await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                    selectedStudents: selectedFiltersStudents,
                    selectedFilters: updateSelectedFiltersKeys,
                    storedFromDate: fromDate,
                    storedToDate: toDate
                });
            }
        } catch (error) {
            console.error('Error al guardar historicalFilters:', error);
        }
    }

    // Para type=0, se manejan los filtros de estudiantes

    async function handleFilterButtonClickStudents(key) {
        let updatedFiltersStudents = [...selectedFiltersStudents];

        if (updatedFiltersStudents.includes(key)) 
            updatedFiltersStudents = updatedFiltersStudents.filter((el) => el !== key);
        else 
            updatedFiltersStudents.push(key);
        
        setSelectedFiltersStudents(updatedFiltersStudents);

        try {
            await setHistoricalData(`historicalMetrics_type_${props.type}`, {
                selectedStudents: updatedFiltersStudents,
                selectedFilters: selectedFiltersKeys,
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

    function visualFiltersStudents(){
        return (
            <div>
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
                        {predefinedFilters.map((key) => (
                            <button
                            onClick={() => handleFilterButtonClick(key)}
                            className={
                                selectedFiltersKeys?.includes(key)
                                ? styles.buttons_active
                                : styles.buttons
                            }
                            >
                            {filterNames[key]}
                            </button>
                        ))}
                        </div>
                        <motion.div className={styles.buttons_container3}>
                        {filterStudents.map((key) => (
                            console.log(key),
                            <button 
                            onClick={() => handleFilterButtonClickStudents(key)}
                            className={
                                selectedFiltersStudents?.includes(key)
                                ? styles.buttons_active
                                : styles.buttons
                            }
                            >
                            {key}
                            </button>
                        ))}
                        </motion.div>
                    </>
                    )}
                </div>
                <div className={styles.message}>{"The selection of users is still in development.\n Don't worry if there is not any data when you select a user.\n This happens because the username of Github is not the same as Taiga."}</div>
            </div>
        );
    }

    function visualFiltersNotStudents(){
        return (
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
                                    {data[key]['0'].name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    function lineChartStudents(){
        return (
            <div className={styles.charContainer}>
                {data && Object.keys(data).length > 0 ? (
                    Object.keys(data).map((key) => {
                        let isSelected = false;

                        if (selectedFiltersKeys.length === 0 && selectedFiltersStudents.length === 0) isSelected = true;
                        else {
                            if (selectedFiltersKeys.length > 0 && selectedFiltersStudents.length === 0) 
                                isSelected = selectedFiltersKeys.includes(key.split('_')[0]);
                            else if (selectedFiltersKeys.length === 0 && selectedFiltersStudents.length > 0)
                                isSelected = selectedFiltersStudents.includes(key.split('_')[1]);
                            else 
                                isSelected = selectedFiltersKeys.includes(key.split('_')[0]) && selectedFiltersStudents.includes(key.split('_')[1]);
                        }
                        
                      if (isSelected) {
                        return (
                            <div key={key}>
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
                                    {data[key]['0'].name}
                                </div>
                            </div>
                        );
                        } else return null;
                    
                    })
                ) : (
                    <p>No data available</p>
                )}
            </div>
        );
    }

    function lineChartNotStudents(){
        return (
            <div className={styles.charContainer}>
                {data && Object.keys(data).length > 0 ? (
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
                                    {data[key]['0'].name}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No data available</p>
                )}
            </div>
        );
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

            {dateError && <div className={styles.error}>{dateError}</div>}

            {showFilter &&  props.type !== 0 &&(
                visualFiltersNotStudents()
            )}

            {showFilter && props.type === 0 && (
                visualFiltersStudents()
            )}
            
            {props.type !== 0 && (
                lineChartNotStudents()
            )}

            {props.type === 0 && (
                lineChartStudents()
            )}
                
        </div>
    );
}

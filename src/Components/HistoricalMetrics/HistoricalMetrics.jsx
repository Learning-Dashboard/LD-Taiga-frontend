import LineChart from '../Charts/LineChart';
import styles from './HistoricalMetrics.module.css';

import { motion } from 'framer-motion';
import { TbAdjustments } from 'react-icons/tb';
import { useState, useEffect, useRef } from 'react';

export default function HistoricalMetrics(props) {

    const today = new Date();
    const oneYearLater = new Date();
    oneYearLater.setFullYear(oneYearLater.getFullYear() -1);

    const [fromDate, setFromDate] = useState(oneYearLater.toISOString().split('T')[0]);

    const [toDate, setToDate] = useState(today.toISOString().split('T')[0]); // Initialize to current date in YYYY-MM-DD format

    const [data, setData] = useState({});
    const [originalData, setOriginalData] = useState({});
    const [isOpen, setIsOpen] = useState(false);         

    const [selectedFiltersKeys, setSelectedFiltersKeys] = useState([]);

    const [showFilter, setShowFilter] = useState(true);

    const [filters, setFilters] = useState([]);

    useEffect(() => {
        if (props.data) { 
            const result = props.data.reduce((acc, current) => {
                const id = current.id === null ? "id" : current.id;
                const updatedCurrent = { ...current, id };  // Update the object
                if (!acc[id]) {
                  acc[id] = [];
                }
                acc[id].push(updatedCurrent);
                return acc;
            }, {}); 
            
            setData(result);
            setOriginalData(result);

            if (props.type){
                if(props.type === 3) setShowFilter(false);
                else {
                    const dynamicFilters = Object.keys(result);
                    setFilters(dynamicFilters);
                }
            }
        } 

    }, [props.data]);

    
    const handleStartDateChange = (e) => {
        setFromDate(e.target.value);
    };

    
    const handleEndDateChange = (e) => {
        setToDate(e.target.value);
    }

    useEffect(() => {
        // Función para filtrar los datos cuando cambian fromDate o toDate
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

    function handleFilterButtonClick(key) {
        let updateSelectedFiltersKeys = [...selectedFiltersKeys];
        
        if (updateSelectedFiltersKeys.includes(key)) 
            updateSelectedFiltersKeys = updateSelectedFiltersKeys.filter((el) => el !== key);
        else 
            updateSelectedFiltersKeys.push(key);

        setSelectedFiltersKeys(updateSelectedFiltersKeys);
    }

    function getData(data, key) {
        return data[key].map((row) => {
            console.log("row.value.first: ", row.value.first);
            console.log("row.value: ", row.value);

            if (row.value.first === undefined) {
                console.log("row.value: ", row.value);
                return row.value.toFixed(2);
            } else {
                console.log("row.value.first: ", row.value.first);
                return row.value.first.toFixed(2);
            }
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
                                    {data[key][0].name}
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

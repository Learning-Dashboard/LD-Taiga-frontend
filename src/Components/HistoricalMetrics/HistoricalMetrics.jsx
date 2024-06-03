import LineChart from '../Charts/LineChart';
import styles from './HistoricalMetrics.module.css';

import { useState, useEffect, useRef } from 'react';

export default function HistoricalMetrics(props) {

    const today = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setFullYear(oneMonthLater.getFullYear() -1);

    const [fromDate, setFromDate] = useState(oneMonthLater.toISOString().split('T')[0]);

    const [toDate, setToDate] = useState(today.toISOString().split('T')[0]); // Initialize to current date in YYYY-MM-DD format

    const [data, setData] = useState([]);
    const [originalData, setOriginalData] = useState([]);


    useEffect(() => {
        if (props.data) { 
            console.log("historical data: ", props.data);

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
            console.log("formattedOutput: ", result);
        } 

    }, [props.data]);

    
    const handleStartDateChange = (e) => {
        setFromDate(e.target.value);
        filterDates();
    };

    
    const handleEndDateChange = (e) => {
        setToDate(e.target.value);
        filterDates();
    }

    function filterDates() {
        const filteredData = {};
    
        Object.keys(data).forEach(key => {
            filteredData[key] = data[key].filter(item => {
                const itemDate = new Date(item.date);

                console.log("filetr date: ",  itemDate);
                console.log("toDate time: ",  new Date(toDate));
                console.log("fromDate time: ",  new Date(fromDate));

                return itemDate.getTime() >= new Date(fromDate).getTime() && itemDate.getTime() <= new Date(toDate).getTime();
            });
        });
    
        setData(filteredData);
    };

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

            <div className={styles.charContainer}>
                {data ? (
                    Object.keys(data).map((key) => (
                        <div key={key}>
                            <div className={styles.linearChart}>
                                <LineChart
                                    data={{
                                        labels: data[key].map((row) => row.date),
                                        datasets: [
                                            {
                                                label: "First dataset",
                                                data: data[key].map((row) => row.value.first),
                                                fill: true,
                                                backgroundColor: "rgba(75,192,192,0.2)",
                                                borderColor: "rgba(75,192,192,1)"
                                            }
                                        ]
                                    }}
                                />
                                <div>{key}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No data available</p>
                )}
            </div>
        </div>
    );
}

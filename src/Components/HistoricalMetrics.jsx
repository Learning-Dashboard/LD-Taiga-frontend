import styles from './HistoricalMetrics.module.css';

import { useState, useEffect } from 'react';



export default function HistoricalMetrics(props) {


    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [data, setData] = useState([]);

    useEffect(() => {
        if (props.data) {
            setData(props.data);
            console.log("data: ", props.data);
        } 

    }, [props.data]);

    return (
        <div className={styles.mainContainer}>
           {/*  <div className={styles.actionContainer}>
                <span>From:</span>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        value={fromDate}
                        placeholder="MM/DD/YYYY"
                    />
                    <input 
                        type="date"
                        value={fromDate}
                    />
                </div> 
                
                <span>To:</span>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="MM/DD/YYYY"
                    />
                    <input 
                        type="date"
                        value={fromDate}
                    />
                </div>
            </div>
            <div className={styles.mainContainer}>
                { data }
            </div> */}
        </div>
    );
}

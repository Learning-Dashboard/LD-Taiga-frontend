import { useState, useEffect } from 'react';

import styles from './QualityFactors.module.css';
import Speedometer from '../Charts/Speedometer';

export default function QualityFactors(props) {
    const [dataMetrics, setDataMetrics] = useState([]);
    const [categories, setCategories] = useState('');

    useEffect(() => {
        if (props.data) {
            setDataMetrics(props.data);
        }
        
        if (props.categories) {
            setCategories(props.categories);
        }

    }, [props.data, props.categories]);


    function getData(dato) {
        if (dato.id) {

            if (dato.id === "commitstasksrelation" || dato.id === "fulfillmentoftasks" || dato.id === "taskseffortinformation" || dato.id === "userstoriesdefinitionquality" ) {
                return categories.Default
            } 
            else if (dato.id === "commitsmanagement" || dato.id === "deviationmetrics" || dato.id === "unassignedtasks") {
                return categories.RDefault;
            } 
            else if (dato.id === "taskscontribution") {
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

    return (
        <div className={styles.speedometers_grid}>
                {dataMetrics.map((dato) => (
                    <div key={dato.id} className={styles.speedometers}>
                        <Speedometer
                            value={dato.value.first * 100}
                            text={dato.name}
                            data={ getData(dato)}
                        />
                    </div>
                ))}
        </div>
    );
}

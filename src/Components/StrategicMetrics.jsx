import { useState, useEffect } from 'react';


import styles from './StrategicMetrics.module.css';
import Speedometer from './Charts/Speedometer';

export default function StrategicMetrics(props) {

    const [dataMetrics, setDataMetrics] = useState('');

    useEffect(() => {
        if (props.strategic) {
          setDataMetrics(props.strategic);
        }
    
    }, [props.strategic]);

    return (
        <div
            className={styles.speedometers_grid}
        >
            {Object.keys(dataMetrics).map((key) => {
                return (
                <>
                    <div className={styles.speedometers_container}>
                        {dataMetrics[key].map((dato) => (
                            <>
                                <div key={dato.id} className={styles.speedometers}>
                                <Speedometer
                                    value={dato.value.first * 100}
                                    text={dato.name}
                                    data={
                                        {
                                            values: [0, ...dato.probabilities.map((row) => row.upperThreshold).reverse()],
                                            colors: dato.probabilities.map((row) => row.color)
                                        } 
                                    }
                                />
                                </div>
                            </>
                        ))}
                    </div>
                </>
                );
            })}{' '}
        </div>
    );
}
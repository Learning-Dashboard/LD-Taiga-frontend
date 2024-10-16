import { useState, useEffect } from 'react';


import styles from './StrategicMetrics.module.css';
import SpeedmeterStyled from '../ReusableComponents/SpeedmeterStyled/SpeedometerStyled';

export default function StrategicMetrics(props) {

    const [dataMetrics, setDataMetrics] = useState('');

    useEffect(() => {
        if (props.strategic) {
          setDataMetrics(props.strategic);
        }
    
    }, [props.strategic]);

    return (
        <div>
            {Object.keys(dataMetrics).map((key) => {

                const metric = dataMetrics[key];
                return (
                <>
                    {metric.map((dato) => (
                        <SpeedmeterStyled
                            key={dato.id}
                            name={dato.name}
                            description={dato.description}
                            value={dato.value.first}
                            data={
                                {
                                    values: [0, ...dato.probabilities.map((row) => row.upperThreshold).reverse()],
                                    colors: dato.probabilities.map((row) => row.color).reverse()
                                } 
                            }
                        />
                    ))}
                </>
                );
            })}
        </div>
    );
}
import Speedometer from '../../Charts/Speedometer';
import styles from './SpeedometerStyled.module.css';

function SpeedmeterStyled(props){
    return (
        <div styles={{ display: 'flex', justifyContent: 'center',}} key={props.key} >
            <div>
                <>
                    <hr style={{ width: '500px' }} />
                    <br />
                </>
                <div className={styles.titulo}>
                    <div className={styles.infoTit}>
                        {props.name}{' '}
                    </div>
                </div>
                {props.description !== '' ? (
                <div className={styles.infodesc}>{props.description} </div>
                ) : null}                          
                    <Speedometer
                        value={props.value * 100}
                        text={props.name}
                        data={props.data}
                    />
            </div>
        </div>
    );
}

export default SpeedmeterStyled;
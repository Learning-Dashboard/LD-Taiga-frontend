import Speedometer from '../../Charts/Speedometer';
import styles from './SpeedometerStyled.module.css';

function SpeedometerStyled(props) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
          <hr style={{ width: '500px' }} />
    
        <div className={styles.titulo}>
          <div className={styles.infoTit}>{props.name}</div>
        </div>
        {props.description !== '' ? (
          <div className={styles.infodesc}>{props.description}</div>
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

export default SpeedometerStyled;

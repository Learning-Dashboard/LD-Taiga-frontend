import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

function Speedometer(props) {
  
  console.log("value: ", props.value);
  console.log("Myyyy spedometer: ", );

  return (
    <ReactSpeedometer
      width={250}
      height={200}
      needleHeightRatio={0.7}
      minValue={0}
      maxValue={100}
      value={Math.round(props.value)}
      currentValueText={
        props.text && props.value !== undefined
          ? props.text + ' ( ' + props.value.toString().slice(0, 4) + ' %)'
          : 'Undefined'
      }
      customSegmentStops={props.data ? props.data.values.map(val => Math.round(val*100)) : []}
      segmentColors={props.data ? props.data.colors : []}
      ringWidth={47}
      needleTransitionDuration={2222}
      needleTransition="easeElastic"
      needleColor={'#90f2ff'}
      textColor={'#000'}
    />
  );
}

export default Speedometer;

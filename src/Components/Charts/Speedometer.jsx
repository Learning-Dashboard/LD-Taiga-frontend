import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

function Speedometer(props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}} >
      <ReactSpeedometer 
        width={250}
        height={150}
        needleHeightRatio={0.7}
        minValue={0}
        maxValue={100}
        value={Math.round(props.value)}
        customSegmentStops={props.data ? props.data.values.map(val => Math.round(val*100)) : []}
        segmentColors={props.data ? props.data.colors : []}
        ringWidth={47}
        needleTransitionDuration={2222}
        needleTransition="easeElastic"
        needleColor={'#90f2ff'}
        textColor={'#000'}
        currentValueText={`${Math.round(props.value)}%`} 
      />
      <div>
        {props.text && props.value !== undefined
            ? props.text + ' ( ' + props.value.toString().slice(0, 4) + ' %)'
            : 'Undefined'}
      </div>
    </div>
  );
}

export default Speedometer;

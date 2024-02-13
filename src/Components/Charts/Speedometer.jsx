import React from 'react';
import ReactSpeedometer from 'react-d3-speedometer';

function Speedometer(props) {
  return (
    <>
      <div styles={{}}>
        <ReactSpeedometer
          width={400}
          needleHeightRatio={0.7}
          maxValue={1}
          value={props.value / 100}
          currentValueText={
            props.text && props.value !== undefined
              ? props.text + ' ( ' + props.value.toString().slice(0, 6) + ' %)'
              : 'Undefined'
          }
          customSegmentStops={props.data ? props.data.values : []}
          segmentColors={props.data ? props.data.colors : []}
          ringWidth={47}
          needleTransitionDuration={2222}
          needleTransition="easeElastic"
          needleColor={'#90f2ff'}
          textColor={'#000'}
        />
      </div>
    </>
  );
}

export default Speedometer;

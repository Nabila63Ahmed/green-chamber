import React from 'react';
import { Spring } from 'react-spring/renderprops';
import { Meter } from 'grommet';

/**
 * Loading spinner
 */
const Spinner = () => {
  return (
    <Spring from={{ value: 0 }} to={{ value: 100 }}>
      {props => (
        <Meter
          type="circle"
          size="xsmall"
          thickness="small"
          values={[{ value: props.value }]}
          aria-label="meter"
        />
      )}
    </Spring>
  );
};

export default Spinner;

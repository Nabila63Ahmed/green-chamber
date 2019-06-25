import * as _ from 'lodash';
import { insertTemperatureRecord } from '../services/temperature';
import { insertHumidityRecord } from '../services/humidity';
import { insertMotionRecord } from '../services/motion';

export const storeSensorData = ({ routingKey, message }) => {
  const route = routingKey.split('.');

  if (_.isEqual(route[0], 'sensors')) {
    const type = route[1];

    if (_.isEqual(type, 'temperature')) {
      return insertTemperatureRecord(message);
    }

    if (_.isEqual(type, 'humidity')) {
      return insertHumidityRecord(message);
    }

    return insertMotionRecord(message);
  }

  return null;
};

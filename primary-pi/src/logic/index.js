import { insertTemperatureRecord } from '../services/temperature';
import { insertHumidityRecord } from '../services/humidity';
import { insertMotionRecord } from '../services/motion';

/**
 * Process received message
 * 1. send record through socket to the connected client
 * 2. insert record into the database
 */
export const handleMessageReceived = ({ routingKey, message, io }) => {
  const route = routingKey.split('.');

  if (route[0] === 'sensors') {
    const type = route[1];

    if (type === 'temperature') {
      io.sockets.emit('temperature-changed', message);
      return insertTemperatureRecord(message);
    }

    if (type === 'humidity') {
      io.sockets.emit('humidity-changed', message);
      return insertHumidityRecord(message);
    }

    return insertMotionRecord(message);
  }

  return null;
};

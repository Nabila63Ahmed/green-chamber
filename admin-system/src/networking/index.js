import axios from 'axios';

/* Fetch today's temperature records from the server */
export const getTemperatures = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/today',
    { validateStatus: () => true },
  );

  return response.data.data.temperatureRecords;
};

/* Fetch today's humidity records from the server */
export const getHumidities = async () => {
  const response = await axios.get('http://localhost:4000/api/humidity/today', {
    validateStatus: () => true,
  });

  return response.data.data.humidityRecords;
};

/* Fetch the latest temperature record from the server */
export const getCurrentTemperature = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/current',
    { validateStatus: () => true },
  );

  return response.data.data.temperatureRecord;
};

/* Fetch the latest humidity record from the server */
export const getCurrentHumidity = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/humidity/current',
    { validateStatus: () => true },
  );

  return response.data.data.humidityRecord;
};

/* Fetch the current ongoing event from the server (if there is) */
export const getCurrentEvent = async () => {
  const response = await axios.get('http://localhost:4000/api/events/current', {
    validateStatus: () => true,
  });

  return response.data.data.event;
};

/* Fetch the current lamp state from the server */
export const getLamp = async () => {
  const response = await axios.get('http://localhost:4000/api/lamp');

  return response.data.data.isLampOn;
};

/* Toggle the current lamp state through the server */
export const toggleLamp = async value => {
  const response = await axios.post('http://localhost:4000/api/lamp', {
    value,
  });

  return response.data.data.value;
};

/* Fetch the current fan state from the server */
export const getFan = async () => {
  const response = await axios.get('http://localhost:4000/api/fan');

  return response.data.data.isFanOn;
};

/* Toggle the current fan state through the server */
export const toggleFan = async value => {
  const response = await axios.post('http://localhost:4000/api/fan', {
    value,
  });

  return response.data.data.value;
};

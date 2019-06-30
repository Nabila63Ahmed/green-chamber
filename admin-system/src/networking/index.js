import axios from 'axios';

export const getTemperatures = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/today',
    { validateStatus: () => true },
  );

  return response.data.data.temperatureRecords;
};

export const getHumidities = async () => {
  const response = await axios.get('http://localhost:4000/api/humidity/today', {
    validateStatus: () => true,
  });

  return response.data.data.humidityRecords;
};

export const getCurrentTemperature = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/current',
    { validateStatus: () => true },
  );

  return response.data.data.temperatureRecord;
};

export const getCurrentHumidity = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/humidity/current',
    { validateStatus: () => true },
  );

  return response.data.data.humidityRecord;
};

export const getCurrentEvent = async () => {
  const response = await axios.get('http://localhost:4000/api/events/current', {
    validateStatus: () => true,
  });

  return response.data.data.event;
};

export const getLamp = async () => {
  const response = await axios.get('http://localhost:4000/api/lamp', {
    validateStatus: () => true,
  });

  return response.data.data.isLampOn;
};

export const toggleLamp = async value => {
  const response = await axios.post('http://localhost:4000/api/lamp', {
    value,
  });

  return response.data.data.value;
};

export const getFan = async () => {
  const response = await axios.get('http://localhost:4000/api/fan');

  return response.data.data.isFanOn;
};

export const toggleFan = async value => {
  const response = await axios.post('http://localhost:4000/api/fan', {
    value,
  });

  return response.data.data.value;
};

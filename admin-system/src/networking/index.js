import axios from 'axios';

export const getTemperatures = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/today',
  );

  return response.data.data.temperatureRecords;
};

export const getHumidities = async () => {
  const response = await axios.get('http://localhost:4000/api/humidity/today');

  return response.data.data.humidityRecords;
};

export const getCurrentTemperature = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/temperature/current',
  );

  return response.data.data.temperatureRecord;
};

export const getCurrentHumidity = async () => {
  const response = await axios.get(
    'http://localhost:4000/api/humidity/current',
  );

  return response.data.data.humidityRecord;
};

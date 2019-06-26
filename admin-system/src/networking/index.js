import axios from 'axios';

export const getTemperatures = async () => {
  const response = await axios.get('http://localhost:4000/api/temperature');
  return response.data.data.temperatureRecords;
};

export const getHumidities = async () => {
  const response = await axios.get('http://localhost:4000/api/humidity');
  return response.data.data.humidityRecords;
};

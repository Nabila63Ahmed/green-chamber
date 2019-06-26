import axios from 'axios';

export const getTemperatures = () => {
  return axios.get('http://localhost:4000/api/temperature');
}

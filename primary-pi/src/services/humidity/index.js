import { Schema, model } from 'mongoose';

export const insertHumidity = ({ percentage, createdAt }) => {
  return humidityModel.create({ percentage, createdAt });
};

export const getAllHumidities = () => {
  return humidityModel.find().exec();
};

const humiditySchema = new Schema({
  percentage: Number,
  createdAt: Number,
});

const humidityModel = model('Humidity', humiditySchema, 'humidities');

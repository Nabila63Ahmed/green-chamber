import { Schema, model } from 'mongoose';

export const insertTemperature = ({ value, createdAt }) => {
  return temperatureModel.create({ value, createdAt });
};

export const getAllTemperatures = () => {
  return temperatureModel.find().exec();
};

const temperatureSchema = new Schema({
  value: Number,
  createdAt: Number,
});

const temperatureModel = model(
  'Temperature',
  temperatureSchema,
  'temperatures',
);

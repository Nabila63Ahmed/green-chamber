import { Schema, model } from 'mongoose';

export const insertTemperatureRecord = ({ value, createdAt }) => {
  return temperatureModel.create({ value, createdAt });
};

export const getAllTemperatureRecords = () => {
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

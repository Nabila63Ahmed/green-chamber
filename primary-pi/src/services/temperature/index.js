import mongoose from 'mongoose';

export const insertTemperatureRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

export const getTemperatureRecords = () => {
  return model.find().exec();
};

const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model(
  'TemperatureRecord',
  schema,
  'temperature-records',
);

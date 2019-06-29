import mongoose from 'mongoose';

export const insertTemperatureRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

export const getTemperatureRecords = () => {
  return model.find().exec();
};

export const searchTemperatureRecords = ({ createdAfter }) => {
  return model
    .find({ createdAt: { $gt: createdAfter } })
    .sort({ createdAt: 'ascending' })
    .exec();
};

export const getLastTemperatureRecord = () => {
  return model
    .findOne()
    .sort({ createdAt: 'descending' })
    .limit(1)
    .exec();
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

import mongoose from 'mongoose';

export const insertHumidityRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

export const getHumidityRecords = () => {
  return model.find().exec();
};

export const getLastHumidityRecord = () => {
  return model
    .findOne()
    .sort({ createdAt: -1 })
    .limit(1)
    .exec();
};

const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model('HumidityRecord', schema, 'humidity-records');

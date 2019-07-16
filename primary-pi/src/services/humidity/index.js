import mongoose from 'mongoose';

/* Insert a humidity record */
export const insertHumidityRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

/* Get all humidity records */
export const getHumidityRecords = () => {
  return model.find().exec();
};

/* Search humidity records */
export const searchHumidityRecords = ({ createdAfter }) => {
  return model
    .find({ createdAt: { $gt: createdAfter } })
    .sort({ createdAt: 'ascending' })
    .exec();
};

/* Get latest humidity record from the database */
export const getLastHumidityRecord = () => {
  return model
    .findOne()
    .sort({ createdAt: 'descending' })
    .limit(1)
    .exec();
};

/* Humidity model schema */
const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model('HumidityRecord', schema, 'humidity-records');

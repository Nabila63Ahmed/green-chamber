import mongoose from 'mongoose';

/* Insert a temperature record */
export const insertTemperatureRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

/* Get all temperature records */
export const getTemperatureRecords = () => {
  return model.find().exec();
};

/* Search temperature records */
export const searchTemperatureRecords = ({ createdAfter }) => {
  return model
    .find({ createdAt: { $gt: createdAfter } })
    .sort({ createdAt: 'ascending' })
    .exec();
};

/* Get latest temperature record */
export const getLastTemperatureRecord = () => {
  return model
    .findOne()
    .sort({ createdAt: 'descending' })
    .limit(1)
    .exec();
};

/* Temperature model schema */
const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model(
  'TemperatureRecord',
  schema,
  'temperature-records',
);

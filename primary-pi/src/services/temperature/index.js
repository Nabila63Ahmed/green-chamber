import mongoose from 'mongoose';

/* Create and insert a temperature record */
export const insertTemperatureRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

/* Get all temperature records in the database */
export const getTemperatureRecords = () => {
  return model.find().exec();
};

/* Get all temperature records in the database after a timestamp */
export const searchTemperatureRecords = ({ createdAfter }) => {
  return model
    .find({ createdAt: { $gt: createdAfter } })
    .sort({ createdAt: 'ascending' })
    .exec();
};

/* Get latest temperature record from the database */
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

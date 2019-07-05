import mongoose from 'mongoose';

/* Insert a motion record */
export const insertMotionRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

/* Get all motion records */
export const getMotionRecords = () => {
  return model.find().exec();
};

/* Get latest motion record */
export const getLastMotionRecord = () => {
  return model
    .findOne()
    .sort({ createdAt: -1 })
    .limit(1)
    .exec();
};

/* Motion model schema */
const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model('MotionRecord', schema, 'motion-records');

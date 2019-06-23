import mongoose from 'mongoose';

export const insertMotionRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

export const getMotionRecords = () => {
  return model.find().exec();
};

export const getLastMotionRecord = () => {
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

const model = mongoose.model('MotionRecord', schema, 'motion-records');

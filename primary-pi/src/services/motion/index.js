import mongoose from 'mongoose';

export const insertMotionRecord = ({ value, createdAt }) => {
  return model.create({ value, createdAt });
};

export const getMotionRecords = () => {
  return model.find().exec();
};

const schema = new mongoose.Schema({
  value: Number,
  createdAt: Number,
});

const model = mongoose.model('MotionRecord', schema, 'motion-records');

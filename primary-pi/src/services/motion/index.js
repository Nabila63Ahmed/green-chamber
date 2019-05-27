import { Schema, model } from 'mongoose';

export const insertMotionRecord = ({ value, createdAt }) => {
  return motionModel.create({ value, createdAt });
};

export const getAllMotionRecords = () => {
  return motionModel.find().exec();
};

const motionSchema = new Schema({
  value: Number,
  createdAt: Number,
});

const motionModel = model('Motion', motionSchema, 'motion');

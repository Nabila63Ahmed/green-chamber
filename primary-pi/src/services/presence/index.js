import { Schema, model } from 'mongoose';

export const setMotion = ({ value, createdAt }) => {
  return motionModel.create({ value, createdAt });
};

export const getAllMotionInformation = () => {
  return motionModel.find().exec();
};

const motionSchema = new Schema({
  value: Number,
  createdAt: Number,
});

const motionModel = model('Motion', motionSchema, 'motionInformation');

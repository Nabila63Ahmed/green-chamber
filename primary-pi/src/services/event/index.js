import { Schema, model } from 'mongoose';

export const insertEventRecord = ({
  startTime,
  endTime,
  title,
  description,
}) => {
  return eventModel.create({ startTime, endTime, title, description });
};

export const getAllEventRecords = () => {
  return eventModel.find().exec();
};

const eventSchema = new Schema({
  startTime: Number,
  endTime: Number,
  title: String,
  description: String,
});

const eventModel = model('Event', eventSchema, 'events');

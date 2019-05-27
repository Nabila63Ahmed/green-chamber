import { Schema, model } from 'mongoose';

export const insertMeeting = ({ date, time, title, description }) => {
  return meetingModel.create({ date, time, title, description });
};

export const getAllMeetings = () => {
  return meetingModel.find().exec();
};

const meetingSchema = new Schema({
  date: Number,
  time: Number,
  title: String,
  description: String,
});

const meetingModel = model('Meeting', meetingSchema, 'meetings');

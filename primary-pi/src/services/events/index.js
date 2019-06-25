import mongoose from 'mongoose';

export const insertEvent = ({ startsAt, endsAt, title, description }) => {
  return model.create({ startsAt, endsAt, title, description });
};

export const insertEvents = events => {
  return model.create(events);
};

export const getEvents = () => {
  return model.find().exec();
};

const schema = new mongoose.Schema({
  title: String,
  description: String,
  startsAt: Number,
  endsAt: Number,
});

const model = mongoose.model('Event', schema, 'events');

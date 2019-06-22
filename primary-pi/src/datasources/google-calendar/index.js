import { google } from 'googleapis';

export const initializeJWT = ({ key, scopes }) => {
  return new google.auth.JWT(key.client_email, null, key.private_key, scopes);
};

export const initializeCalendar = ({ jwt }) => {
  return google.calendar({ version: 'v3', auth: jwt });
};

export const getEvents = async ({ calendar, query }) => {
  const response = await calendar.events.list(query);
  return response.data.items;
};

export { default as key } from './key';

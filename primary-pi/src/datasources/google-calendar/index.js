import { google } from 'googleapis';

/* Google JWT authentication */
export const initializeJWT = ({ key, scopes }) => {
  return new google.auth.JWT(key.client_email, null, key.private_key, scopes);
};

/* Google calendar initialization */
export const initializeCalendar = ({ jwt }) => {
  return google.calendar({ version: 'v3', auth: jwt });
};

/* Retrieves calendar events that conforms with the query */
export const getEvents = async ({ calendar, query }) => {
  const response = await calendar.events.list(query);
  return response.data.items;
};

export { default as key } from './key';

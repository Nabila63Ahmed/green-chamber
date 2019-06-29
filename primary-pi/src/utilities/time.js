import moment from 'moment';

/* Returns the current local time as a Unix timestamp (milliseconds) */
export const now = () => {
  return moment().valueOf();
};

/* Rounds down a Unix timestamp (milliseconds) to the start of a unit of time */
export const startOf = unitOfTime => millis => {
  return moment(millis)
    .startOf(unitOfTime)
    .valueOf();
};

/* Adds a duration of time to a Unix timestamp (milliseconds) */
export const add = unitOfTime => duration => millis => {
  return moment(millis)
    .add(duration, unitOfTime)
    .valueOf();
};

/* Subtract a duration of time from a Unix timestamp (milliseconds) */
export const subtract = unitOfTime => duration => millis => {
  return moment(millis)
    .subtract(duration, unitOfTime)
    .valueOf();
};

/* Converts a Unix timestamp (milliseconds) to an ISO string */
export const toISOString = millis => {
  return moment(millis).toISOString();
};

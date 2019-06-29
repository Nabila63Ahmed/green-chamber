import moment from 'moment';

/* Returns the current local time as a Unix timestamp (milliseconds) */
export const now = () => {
  return moment().valueOf();
};

/* Rounds down a Unix timestamp (milliseconds) to the start of a unit of time */
export const startOfDay = millis => {
  return moment(millis)
    .startOf('day')
    .valueOf();
};

/* Truncates a string with length > characterLimit */
export const truncate = characterLimit => str => {
  if (str.length >= characterLimit) {
    return str.substring(0, characterLimit).concat('...');
  }

  return str;
};

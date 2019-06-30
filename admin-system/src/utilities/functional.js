/* Attempts to invoke an asynchronous function */
export const attempt = async (func, defaultValue) => {
  try {
    const value = await func();
    return value;
  } catch (error) {
    return defaultValue;
  }
};

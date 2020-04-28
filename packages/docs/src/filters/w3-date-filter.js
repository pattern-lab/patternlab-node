module.exports = function w3cDate(value) {
  const dateObject = new Date(value);

  return dateObject.toISOString();
};

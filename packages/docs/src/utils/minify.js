module.exports = function minify(input) {
  return input.replace(/\s{2,}/g, '').replace(/\'/g, '"');
};

const strip = number => {
  return parseFloat(number).toPrecision(12);
};

module.exports = strip;

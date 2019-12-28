const compareTempo = (a, b) => {
  if (a.tempo > b.tempo) return 1;
  if (b.tempo > a.tempo) return -1;
  if (a.tempo === b.tempo) return 1;

  return 0;
};

module.exports = compareTempo;

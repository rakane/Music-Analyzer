const replaceSpaces = name => {
  let newName = name;

  for (let i = 0; i < newName.length; i++) {
    newName = newName.replace(' ', '-');
  }

  return newName;
};

module.exports = replaceSpaces;

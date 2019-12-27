const fs = require('fs');
const path = require('path');
const analyzeSong = require('../analyzer/songAnalyzer');

const dir = 'uploads/';

const getSongs = (id, finishFunc) => {
  let songs = [];

  // Loop through all the files in the temp directory
  fs.readdir(`uploads/${id}`, function(err, files) {
    if (err) {
      console.error('Could not list the directory.', err);
      return;
    }

    files.forEach(function(file, index) {
      analyzeSong(`uploads/${id}/${file}`, function(result) {
        songs.push(result);
        if (index == files.length - 1) {
          finishFunc(songs);
        }
      });
    });
  });

  return songs;
};

module.exports = getSongs;

const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

const deletePlaylist = id => {
  let playlistDir = `uploads/${id}`;

  fsExtra.remove(playlistDir, err => {
    if (err) {
      console.error(err);
    }
  });
};

module.exports = deletePlaylist;

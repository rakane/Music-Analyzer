const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

const deleteTempFiles = playlistID => {
  const tempDir = `uploads/${playlistID}/temp`;
  const playlistDir = `uploads/${playlistID}`;

  fsExtra.remove(tempDir, err => {
    console.error(err);
    if (err === null) {
      fs.readdir(playlistDir, (err, files) => {
        if (err) throw err;

        for (const file of files) {
          if (file != 'outputFinal.mp3') {
            fs.unlink(path.join(playlistDir, file), err => {
              if (err) throw err;
            });
          }
        }
      });
    }
  });
};

const makeTempDirectory = playlistID => {
  if (!fs.existsSync(`uploads/${playlistID}/temp`)) {
    fs.mkdirSync(`uploads/${playlistID}/temp`);
  }
};

const crossfade = (
  tracks,
  track1,
  track2,
  start2,
  outputFile,
  nextTrack,
  finalDir
) => {
  if (nextTrack > tracks.length - 1) {
    outputFile = `uploads/${finalDir}/outputFinal.mp3`;
  }

  let ff = ffmpeg();
  ff.input(track1);
  ff.input(track2).seekInput(start2);

  ff.complexFilter(
    [
      {
        filter: 'acrossfade',
        options: {
          duration: '10'
        },
        inputs: ['0:a', '1:a'],
        outputs: outputFile
      }
    ],
    [outputFile]
  )
    .on('error', function(err) {
      console.log('An error occurred: ' + err);
    })
    .on('end', function() {
      if (nextTrack <= tracks.length - 1) {
        console.log(`Finished transition ${nextTrack - 1}`);
        crossfade(
          tracks,
          outputFile,
          `uploads/${finalDir}/${tracks[nextTrack]}`,
          0,
          `uploads/${finalDir}/temp/output-${nextTrack}.mp3`,
          nextTrack + 1,
          finalDir
        );
      } else {
        console.log(`done! output file: ${outputFile}`);
        deleteTempFiles(finalDir);
        return;
      }
    });
  try {
    ff.save(outputFile);
  } catch (e) {}
};

const mix = (tracks, finalDir) => {
  makeTempDirectory(finalDir);

  crossfade(
    tracks,
    `uploads/${finalDir}/${tracks[0]}`,
    `uploads/${finalDir}/${tracks[1]}`,
    0,
    `uploads/${finalDir}/temp/output-1.mp3`,
    2,
    finalDir
  );
};

module.exports = mix;

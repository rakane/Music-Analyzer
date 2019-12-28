const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

const deleteTempFiles = playlistID => {
  const tempDir = `uploads/${playlistID}/temp`;
  const playlistDir = `uploads/${playlistID}`;

  fsExtra.remove(tempDir, err => {
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
  finalDir,
  res
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
          duration: '15'
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
        console.log(`${(nextTrack / tracks.length) * 100}% completed`);
        crossfade(
          tracks,
          outputFile,
          `uploads/${finalDir}/${tracks[nextTrack]}`,
          0,
          `uploads/${finalDir}/temp/output-${nextTrack}.mp3`,
          nextTrack + 1,
          finalDir,
          res
        );
      } else {
        console.log(`done! output file: ${outputFile}`);
        res.json({ status: 'finished' });
        deleteTempFiles(finalDir);
        return;
      }
    });
  try {
    ff.save(outputFile);
  } catch (e) {}
};

const mix = (tracks, finalDir, res) => {
  makeTempDirectory(finalDir);

  crossfade(
    tracks,
    `uploads/${finalDir}/${tracks[0]}`,
    `uploads/${finalDir}/${tracks[1]}`,
    0,
    `uploads/${finalDir}/temp/output-1.mp3`,
    2,
    finalDir,
    res
  );
};

module.exports = mix;

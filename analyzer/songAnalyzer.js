const AudioContext = require('web-audio-api').AudioContext;
const MusicTempo = require('music-tempo');
const fs = require('fs');
const replaceSpaces = require('../helper/replaceSpaces');
const stripFloat = require('../helper/floatingPoint');

const analyzeSong = async (name, finish) => {
  const newName = replaceSpaces(name);
  let fileName = newName.split('/');
  fileName = fileName[fileName.length - 1];
  let data = fs.readFileSync(newName);
  let context = new AudioContext();
  let results;

  context.decodeAudioData(
    data,
    async function(buffer) {
      let audioData = [];
      // Take the average of the two channels
      if (buffer.numberOfChannels == 2) {
        let channel1Data = buffer.getChannelData(0);
        let channel2Data = buffer.getChannelData(1);
        let length = channel1Data.length;
        for (var i = 0; i < length; i++) {
          audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
      } else {
        audioData = buffer.getChannelData(0);
      }
      let mt = new MusicTempo(audioData);

      beats = [];
      for (let i = 0; i < mt.beats.length; i++) {
        beats.push(stripFloat(mt.beats[i]));
      }

      results = {
        name: fileName,
        tempo: mt.tempo
      };

      // beats: mt.beats

      finish(results);
    },
    function(error) {
      console.log('ERROR');
      console.log(error);
    }
  );
  //res.json({ tempo: mt.tempo, beats: mt.beats });

  // await context.decodeAudioData(data, buffer => {});

  return results;
};

module.exports = analyzeSong;

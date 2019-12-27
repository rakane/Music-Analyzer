const AudioContext = require('web-audio-api').AudioContext;
const MusicTempo = require('music-tempo');
const fs = require('fs');
const replaceSpaces = require('../helper/replaceSpaces');

const analyzeSong = (name, finish) => {
  const newName = replaceSpaces(name);
  let data = fs.readFileSync(newName);
  let context = new AudioContext();
  let results;

  const finishFunc = finish;

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

      console.log('Done in analyzer');
      console.log(mt.tempo);

      results = {
        tempo: mt.tempo,
        beats: mt.beats
      };

      finishFunc(results);
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

/* eslint-disable no-console */
// Packages
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const { Readable } = require('stream');
const cookieParser = require('cookie-parser');

const generateID = require('./helper/generateID');
const replaceSpaces = require('./helper/replaceSpaces');
const getSongs = require('./helper/getSongs');
const analyzeSong = require('./analyzer/songAnalyzer');
const compareTempo = require('./helper/compareTempo');
const generateMix = require('./mix/generateMix');

const app = express();

// PUG templating
app.set('view engine', 'pug');

// CORS Config
app.use(cors());

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (!fs.existsSync(`uploads/${req.cookies.playlist_id}`)) {
      fs.mkdirSync(`uploads/${req.cookies.playlist_id}`);
    }

    cb(null, `uploads/${req.cookies.playlist_id}`);
  },
  filename: function(req, file, cb) {
    cb(null, replaceSpaces(file.originalname));
  }
});

var upload = multer({ storage: storage });

const storeFS = (stream, filename) => {
  filename = replaceSpaces(filename);

  const uploadDir = './uploads';
  const path = `${uploadDir}/${filename}.mp3`;
  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated)
          // delete the truncated file
          fs.unlinkSync(path);
        reject(error);
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve({ path }))
  );
};

function highest() {
  return [].slice.call(arguments).sort(compareTempo);
}

app.get('/', (req, res) => {
  res.cookie('playlist_id', generateID());
  res.render('index.pug', {});
});

app.get('/test', (req, res) => {
  console.log('request received');
  analyzeSong('./samples/I-Flip-The-Bag(Mashup).mp3', function(result) {
    res.render('singleBPM.pug', { result: result });
  });
});

app.get('/track/:track', (req, res) => {
  const trackName = req.params.track;
  analyzeSong(`./uploads/${trackName}.mp3`, function(result) {
    res.render('singleBPM.pug', { result: result });
  });
});

app.post('/upload-single', (req, res) => {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage: storage,
    limits: { fields: 1, fileSize: 6000000, files: 1, parts: 2 }
  });
  upload.single('myFile')(req, res, err => {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .json({ message: 'Upload Request Validation Failed' });
    } else if (!req.body.name) {
      return res.status(400).json({ message: 'No track name in request body' });
    }

    let trackName = req.body.name;
    trackName = replaceSpaces(trackName);

    // Covert buffer to Readable Stream
    const readableTrackStream = new Readable();
    readableTrackStream.push(req.file.buffer);
    readableTrackStream.push(null);

    storeFS(readableTrackStream, trackName);

    res.redirect(`/track/${trackName}`);
  });
});

//Uploading multiple files
app.post('/upload-multiple', upload.array('myFiles', 12), (req, res, next) => {
  const files = req.files;
  if (!files) {
    const error = new Error('Please choose files');
    error.httpStatusCode = 400;
    return next(error);
  }

  res.redirect(`/playlist/${req.cookies.playlist_id}`);
});

app.get('/playlist/:id', async (req, res) => {
  getSongs(req.params.id, function(results) {
    res.render('playlistBPM.pug', {
      results: results,
      resultString: JSON.stringify(results)
    });
  });
});

app.post('/playlist/mix/:id', (req, res) => {
  let playlistOrder = req.body.songs;
  playlistOrder.sort(compareTempo);

  let tracks = [];
  for (let i = 0; i < playlistOrder.length; i++) {
    tracks.push(playlistOrder[i].name);
  }

  console.log(tracks);

  generateMix(tracks, req.params.id);
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('/views', path.join(__dirname, 'views'));

const port = process.env.PORT || 5000;

// Open on port
app.listen(port, () => console.log(`Server running on ${port}...`));

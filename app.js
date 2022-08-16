const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

// Mongo URI
const mongoURI =
  'mongodb+srv://nsamaras:BUIxRZ5JvEDg3jpn@fileupload.0uie4me.mongodb.net/main';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init GFS               https://github.com/aheckmann/gridfs-stream
let gfs;
conn.once('open', () => {
  // Init gridfs-stream
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads'); // Collection name matches bucket name
});

// Create storage engine   https://github.com/devconcept/multer-gridfs-storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});
const upload = multer({ storage });

// @route GET /
// @desc Loads form
app.get('/', (req, res) => {
  res.render('index');
});

// @route POST /upload
// @desc Uploads files to DB
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ file: req.file });
});

const port = 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

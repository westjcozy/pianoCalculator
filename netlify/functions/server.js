const serverless = require('serverless-http');
const express = require('express');
const ejs = require('ejs'); // Explicitly require ejs

const mongoose = require('mongoose');
const Song = require('../../models/song.js');
const path = require('path');
const axios = require('axios');
const app = express();

mongoose
  .connect(
    'mongodb+srv://asj980819:sky5868@pianocalculator-cluster.zwqql.mongodb.net/pianoCalculator'
  )
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Could not connect to MongoDB...', err));

axios
  .get('https://jsonplaceholder.typicode.com/todos/1') // 실제 API 엔드포인트로 수정
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error('Error fetching data:', error);
  });

// app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.json());

// app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../views')); // Adjust path if needed

// Serve static files
app.use(express.static(path.join(__dirname, '../../public')));

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/songs', async (req, res) => {
  const song = new Song({
    notes: req.body.songNotes,
  });

  await song.save();

  res.json(song);
});

app.get('/songs/:id', async (req, res) => {
  let song;
  try {
    song = await Song.findById(req.params.id);
  } catch (e) {
    song = undefined;
  }
  res.render('index', { song: song });
});

// Export the app to be used as a Netlify function
module.exports.handler = serverless(app);

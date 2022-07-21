const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.send('hello')
});

app.get('/killServer', (req, res) => {
  process.exit();
});

app.listen(3000, () => console.log('Server ready'));

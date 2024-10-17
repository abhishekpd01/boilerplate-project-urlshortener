require('dotenv').config();
const express = require('express');
const cors = require('cors');
const urlParser = require('url');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({extended : true}));
app.use('/public', express.static(`${process.cwd()}/public`));

const urlDatabase = [];
var urlCounter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);
  const hostname = parsedUrl.hostname;

  if(!hostname) {
    return res.json({error : 'invalid url'});
  }

  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    urlDatabase.push({ original_url: originalUrl, short_url: urlCounter });
    res.json({ original_url: originalUrl, short_url: urlCounter });

    // Increment the counter for the next URL
    urlCounter++;
  });
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = parseInt(req.params.short_url, 10);
  const urlEntry = urlDatabase.find(entry => entry.short_url === shortUrl);

  if(urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'No short URL found for the given input' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

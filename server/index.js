const express = require('express');
const http = require('http');
const path = require('path');
const keys = require('../config/keys');
const Twit = require('twit');
const socketIO = require('socket.io');
const publicPath = path.join(__dirname, '../client/');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));


//---------------------setting up keys to use twitter api-------------------------------
var T = new Twit({
  consumer_key:         keys.TWITTER_CONSUMER_KEY,
  consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
  access_token:         keys.TWITTER_Access_Token,
  access_token_secret:  keys.TWITTER_Access_Token_Secret,
  timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

app.get('/',(res,rep) => {
  rep.sendFile(publicPath + 'views/index.html');
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

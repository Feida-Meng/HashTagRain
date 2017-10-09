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

//--------------------routing-------------------
app.get('/adminlogin',(res,rep) => {
  rep.sendFile(publicPath + 'views/adminLogin.html');
});

app.get('/admin',(res,rep) => {
  rep.sendFile(publicPath + 'views/admin.html');
});

app.get('/',(res,rep) => {
  rep.sendFile(publicPath + 'views/index.html');
});


//---------------------setting up keys to use twitter api-------------------------------
var T = new Twit({
  consumer_key:         keys.TWITTER_CONSUMER_KEY,
  consumer_secret:      keys.TWITTER_CONSUMER_SECRET,
  access_token:         keys.TWITTER_Access_Token,
  access_token_secret:  keys.TWITTER_Access_Token_Secret,
  timeout_ms:           60*1000  // optional HTTP request timeout to apply to all requests.
});

//------------------init the filter for fetching twit ----------------------------
var rawFilter = {};
var filter = {};
var stream;
var currentUserHashtag = null;

//---------------io listens on new socket connected on the client side ---------------------
io.on('connection',(socket) => {
  var userId;
  var adminId;
  console.log(stream);

  const updateCurrentFilterAtAmin = () => {
    console.log('filter,', filter );
    console.log('rawFilter,', rawFilter );
    io.to(adminId).emit('updateCurrentFilterAtAmin', rawFilter );
  }

  //-------Display the current filter when admin login---------
  socket.on('I-am-Admin',() => {
    adminId = socket.id
    updateCurrentFilterAtAmin();
  });

  const fetchAndPostTwit = () => {

    // stop current streaming (if there is one) to update the filter
    if (stream) {
      stream.stop();
    }

    //start a streaming with a filter
    console.log('filter:',filter)
    stream = T.stream('statuses/filter', filter);

    //listen on new tweet
    stream.on('tweet', (tweet) => {
      console.log('new tweet, ', filter.track);

      // emit new tweet to front.
      io.to(userId).emit('newTwt',tweet);
    });

    //stop the stream when the socket is disconnected
    if (socket.id !== adminId) {
      socket.on('disconnect',() => {
        if (stream) {
          stream.stop();
        }
      });
    }

  }

  console.log(`New user connected, ${Date.now()}`);




  // listen to filter changes made by admin
  socket.on('adminFilterInput', async (adminFilterInput) => {

    //clone the filter changes from admin,
    //location and username in filterInput will be converted
    //to GPS coordinates and twitter userID
    //since Streaming API can only use filter input in those formtype
    //the data in adminFilterInput[0] will not be converted
    //the raw data,location and username e.g. toronto, twitter_user_name
    // will be displayed at the admin page
    //which is more readable than GPS coordinates and a long twitter userId
    const filterInput = {...adminFilterInput[0]};

    //-----if admin input username, convert it to twitter id for Streaming API to search--------------
    if (adminFilterInput[0].follow) {
      try {
        const resp = await  T.get('users/lookup',{ screen_name: adminFilterInput[0].follow });
        console.log(resp.data);

        //send warning back
        if ( resp.data.errors ) {
          throw `User ${adminFilterInput[0].follow} cannot be found!`;
        }
        //adminFilterInput[0].follow is not updated, since
        //its raw value e.g. @twitter_user_name other than 92323422412342
        //will be send back to admin page
        //to display the most updated filter settings
        filterInput.follow = resp.data[0].id_str;
      } catch(warning) {
        socket.emit('warning', warning);
        console.log(warning);
        //delete submitted but not available filter parameters from filter changes
        delete filterInput.follow;
        delete adminFilterInput[0].follow;
      }
    }
    //--------------------------------------------------------------------------------------------------------

  //-----------Convert location to boundingBox for straming API to search-----------------------------------
  if (adminFilterInput[0].location) {
    try {

      const response = await T.get('geo/search', {query: adminFilterInput[0].location, "granularity": "neighborhood"});
      const locationList = response.data.result.places;

      if (locationList === undefined || locationList == 0) {
        throw `Location, ${adminFilterInput[0].location} cannot be found!`;
      }

      //find the boundingBox
      const geoInfo = response.data.result.places[0].bounding_box.coordinates[0];
      const lng = geoInfo.map(elem => elem[0]);
      const lat = geoInfo.map(elem => elem[1]);
      const maxLng = lng.reduce((a, b) => Math.max(a, b));
      const minLng = lng.reduce((a, b) => Math.min(a, b));
      const maxLat = lat.reduce((a, b) => Math.max(a, b));
      const minLat = lat.reduce((a, b) => Math.min(a, b));

      //adminFilterInput[0].location is not updated, since
      //its raw value e.g. toronto will be send back to admin page
      //to display the most updated filter settings
      filterInput.location = [minLng, minLat, maxLng, maxLat];

    } catch(warning) {
      console.log(warning);
      socket.emit('warning', warning);
      //delete submitted but not available filter parameters from filter changes
      delete filterInput.location;
      delete adminFilterInput[0].location;
    }
  }
  //-----------------------------------------------------------------------------------------------
    console.log('filterInput2',filterInput);


  //--------------add new or delete or overwrite current filter-------------------------------------

    //adminFilterInput[1] contains the type of operation admin would like to do
    //location value is managed differently from others, i.e.username and hashtag
    //for twitter Streaming, filter is set as the following pattern
    //{
    // track:[hashtag1,2....],
    // username:[twitterID1,ID2..],
    // location:[-79.63, 43.40, -78.90, 43.85, 115.42, 39.43, 117.50, 41.05]
    //}
    //for locatiton property, the each location contains four GPS coordinates,
    //and each of those four numbers are not supposed to be contained in their
    //own array

    if (adminFilterInput[1] === 'overwrite') {
      rawFilter = {};
      filter = {};
    }

    for(let key in adminFilterInput[0]) {
      switch (adminFilterInput[1]) {

        case 'addNew':
          rawFilter[key] ? rawFilter[key].push(adminFilterInput[0][key]) : rawFilter[key] = [adminFilterInput[0][key]];
          if (key === 'location') {
            filter[key] ? filterInput[key].forEach(elem => filter[key].push(elem)) : filter[key] = filterInput[key];
          } else {
            filter[key] ? filter[key].push(filterInput[key]) : filter[key] = [filterInput[key]];
          }
          break;

        case 'delete':
          if (rawFilter[key]) {
            rawFilter[key] = rawFilter[key].filter(elem => elem !== adminFilterInput[0][key]);
          }
          if (filter[key]) {
            if (key === 'location') {
              for (let i = 0; i < filterInput[key].length; i++) {
                filter[key] = filter[key].filter(elem => elem !== filterInput[key][i]);
              }
            } else {
              filter[key] = filter[key].filter(elem => elem !== filterInput[key]);
            }
          }
          break;

        default:
          rawFilter[key] = [adminFilterInput[0][key]]
          filter[key] = (key === 'location' ? filterInput[key] : [filterInput[key]] );
      }
    }
   //---------------------------------------------------------------------------------------------------

    updateCurrentFilterAtAmin();

    if (stream) {
      fetchAndPostTwit();
    }
  });


//-----------It listens the event that user submits the hashtag----------------------------
  socket.on('searchHashtag', (newHashtag) => {
    userId = socket.id;
    console.log('currentUserHashtag: ', currentUserHashtag);
    //Sanitize the user input
    newHashtag = newHashtag.trim();
    newHashtag = newHashtag.charAt(0) === '#' ? newHashtag : `#${newHashtag}`;

    //update the filter, user other than admin cannot add the location and username
    //therefore, hashtag can be saved to filter directly
    if (currentUserHashtag) {
      filter.track[filter.track.indexOf(currentUserHashtag)] = newHashtag;
    } else {
      filter['track'] ? filter['track'].push(newHashtag) : filter['track'] = [newHashtag];
    }
    currentUserHashtag = newHashtag;
    socket.emit('currentUserHashtag', currentUserHashtag);
    fetchAndPostTwit();
  });

});
//--------------------------------------------------------------------------------

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

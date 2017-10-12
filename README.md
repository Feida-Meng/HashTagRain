# HashTagRain, a social wall to display posts from Twitter using a specific hashtag provided by the user  

Twits are fetched through twitter API `POST statuses/filter` in realtime. Fetched Twits are then passed to frontend from backend using Socket.io.The app is built using `Nodejs` for server, `jQuery` for the frontend. Admin login password is managed by  `Bcrypt` for hashing and salting.  

`OR filter`  
`POST statuses/filter` returns twits that match one or more filter predicates defined by admin for this app. Multiple parameters may be specified which allows most users to use a single connection to the Streaming API. The track, follow, and locations fields should be considered to be combined with an OR operator. e.g. `track=foo&follow=1234 returns Tweets matching “foo” OR created by user 1234`.  
(`https://developer.twitter.com/en/docs/tweets/filter-realtime/api-reference/post-statuses-filter.html`)  

`AND filter`  
In addition to a default OR filter from the Twitter API, POST statuses/filter, an AND filter was build for this app as well. It allows admin to define filter parameters that all of them must be matched by the fetched twits in order to be passed to the frontend and displayed on the user page.

If you would like to try this app locally please follow the procedures below:

1.Make sure you have NodeJS installed on your machine.<br />2.Get Twitter API keys and a Bcrypt hash with 10 salt rounds as following:  
{TWITTER_CONSUMER_KEY,   
 TWITTER_CONSUMER_SECRET,   
 TWITTER_Access_Token,   
 TWITTER_Access_Token_Secret,  
 Admin_Login_Hash}  
 and put them in config/keys.js.  
3.Run npm install.  
4.Run npm start to start the app.  
5.Check out the app in localhost:5000  

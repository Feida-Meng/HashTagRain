# HashTagRain, a social wall to display posts from Twitter using a specific hashtag provided by the user

Twits are fetched through Twitter Streaming API(POST statuses/filter) then passed to frontend from backend using Socket.io.  
The app is built using Nodejs for server, jQuery for the frontend. Admin login password is managed by  Bcrypt for hashing and salting. If you would like to try this app locally please follow the procedures below:

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

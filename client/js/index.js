var socket = io();

//add new twit
socket.on('newTwt',function(newTwt) {
  console.log(newTwt);
  var max_twit = 5;

  var twitter = $('<div></div>').addClass(`twit`);
  var user = $('<p></p>').addClass(`twit-user`).html(newTwt.user.name).appendTo(twitter);
  var text = $('<p></p>').addClass(`twit-text`).html(newTwt.text).appendTo(twitter);
  var time = $('<p></p>').addClass(`twit-time`).html(newTwt.created_at).appendTo(twitter);

  if ( $(`.twit`).length === max_twit ) {
    $('.twit').last().remove();
  }

  $('#twit-list').prepend(twitter);

});

//search #hashtag
$('#hashtag-form').on('submit', function(e) {
  e.preventDefault();
  var hashtagInputBox = $('#hashtag-input');
  socket.emit('searchHashtag', hashtagInputBox.val());
  hashtagInputBox.val('');
  $('.twit').remove();

});

//update current hashtag
socket.on('currentUserHashtag', function(currentHashTag) {
  $('#currentUserHashtag').html(currentHashTag);
});

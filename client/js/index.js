var socket = io();

//search #hashtag
$('#hashtag-form').on('submit', function(e) {
  e.preventDefault();
  var hashtagInputBox = $('#hashtag-input');
  socket.emit('searchHashtag', hashtagInputBox.val());
  hashtagInputBox.val('');
  $('.twit').remove();

});

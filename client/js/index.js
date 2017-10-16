var socket = io();

//add new twit
socket.on('newTwt',function(newTwt) {

  //console.log(newTwt);
  var width = $(window).width()
  if (width <= 576) {
    max_twit = 3;
  } else if (width <= 768) {
    max_twit = 6;
  } else if (width <= 992) {
    max_twit = 6;
  } else {
    max_twit = 8;
  }

  var card = $('<div></div>').addClass(`card border-info text-white mb-3 col-xm-12 col-sm-6 col-md-4 col-lg-3 bg-primary`);
  var user = $('<h4></h4>').addClass(`twit-user card-header`).html(newTwt.user.name).appendTo(card);
  var twitter = $('<div></div>').addClass(`twit card-body`).appendTo(card);
  var text = $('<p></p>').addClass(`twit-text`).html(newTwt.text).appendTo(twitter);
  var time = $('<h6></h6>').addClass(`twit-time`).html(newTwt.created_at).appendTo(twitter);

  if ( $(`.card`).length === max_twit ) {
    $('.card').last().remove();
  }
  $('#twit-list').prepend(card);
});

//search #hashtag
$('#hashtag-form').on('submit', function(e) {
  e.preventDefault();

  //show pause button
  socket.emit("pauseOrContinueFetching",false);
  $('#pause-btn').css('visibility', 'visible').text('Pause');
  $('#pause-btn').text('Pause');
  $('#pause-btn').removeClass().addClass("btn-danger text-light float-right");

  var hashtagInputBox = $('#hashtag-input');
  socket.emit('searchHashtag', hashtagInputBox.val());
  hashtagInputBox.val('');
  // $('.twit').remove();
});

//update current hashtag
socket.on('currentUserHashtag', function(currentHashTag) {

  if ($('#currentUserHashtag').length == 0) {
    var hashTag = $('<p></p>').attr('id','currentUserHashtag').addClass('text-center text-primary');
    $('#currentUserHashtagDiv').append(hashTag);
  }
  $('#currentUserHashtag').html("Current Hashtag: " + currentHashTag);
  $('.card').remove();
});

//Sumbit login password
$('#login-submit').click(function() {
  $( "#admin-login-form" ).submit();
});

//pause or restart fetching twit
$('#pause-btn').click(function() {
  var btnFunction;
  if ($(this).text() === 'Pause') {
    stopFetch = true;
    $(this).text('Continue');
    $(this).removeClass().addClass("btn-success text-light float-right");
  } else {
    $(this).text('Pause');
    stopFetch = false;
    $(this).removeClass().addClass("btn-danger text-light float-right");
  }
  socket.emit("pauseOrContinueFetching",stopFetch);
});

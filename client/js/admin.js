var socket = io();
var currentFilterSettings = {};
var logic;

socket.emit('I-am-Admin');

socket.on('updateCurrentFilterAtAmin',(currentFilter) => {
  $('.tag').remove();
  for (var prop in currentFilter) {
    for (var i = 0; i < currentFilter[prop].length; i++) {
      $(`[name=${prop}]`).before(createNewTag(currentFilter[prop][i]));
    }
  }
});

$('#logic-select').change(function(){
  socket.emit('logic',$(this).val());
});


//admin delete filter parameters
$(document).on('click','.deleteTag',function() {
  var input = {};
  input[$(this).parent().parent().find('input').attr('name')] = $(this).prev().text();
  socket.emit('adminFilterInput', [input,'delete']);
  $(this).parent().remove();
});

//admin submit new filter parameters
$('.admin-input').on('keypress', function(e) {

  if(e.which === 13) {
    var txt = $.trim(this.value);
    if(txt) {
      var input = {};
      if ($(this).attr('name') === 'track' && txt.charAt(0) !== '#') {
        txt = `#${txt}`;
      };

      input[$(this).attr('name')] = txt;

      //send new filter parameters to server
      socket.emit('adminFilterInput', [input,'addNew']);

      //create new parameter tag
      $(this).before(createNewTag(txt));
      $(this).val('');
    }
  }
});

//pop up warning when search location cannot be found
socket.on('warning', function(warning){
  console.log(warning);
  alert(warning);
});

var createNewTag = function(txt) {
  var tag = $(`<div class="tag d-inline-block bg-primary text-light p-1 m-1"></div>`);
  $(`<div class='tagText d-inline-block'></div>`).text(txt).appendTo(tag);
  $("<span class='deleteTag'> x </span>").appendTo(tag);
  return tag;
}

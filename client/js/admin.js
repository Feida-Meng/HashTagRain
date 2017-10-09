var socket = io();

//Based on input of dropdown above the form, change the formtype(custom attr)
$('#admin-filter-form-select').change(function(){
  var form = $('#admin-filter-form');
  form.attr('formtype', $('#admin-filter-form-select').val());


  if (form.attr('formtype') === 'delete') {
    //load current filter parameters for admin to choose for form with 'delete' formtype
    addDeleteOptions();
  } else {
    // remove all the options if formtype is not 'delete'
    $('.delete-option').remove();
  }

});

//load current filter parameters for admin to choose for form with 'delete' formtype
var addDeleteOptions = function() {

  if ($('.delete-option')[0]) {
    $('.delete-option').remove();
  }

  for(var key in currentFilterSettings) {
    currentFilterSettings[key].forEach(function(element) {
      $(`#delete-${key}-options`).append(`<option class='delete-option'>${element}</option>`);
    });
  }
}

//admin submit new filter parameters
$('#admin-filter-form').on('submit', function(e) {
  e.preventDefault();

  //Convert input values into obj
  var adminFilter = $(this).serializeArray().reduce(function(obj, arrElement) {
    if (arrElement.value) {
      obj[arrElement.name] = arrElement.value.trim();
      if (obj['track'] && obj['track'].charAt(0) !== '#') {
        obj['track'] = '#' + obj['track'];
      }
    }
    return obj;
  }, {});

  //send input obj and formtype to server to update filter
  socket.emit('adminFilterInput', [adminFilter, $('#admin-filter-form').attr('formtype')]);
  $('#admin-filter-form')[0].reset();

});

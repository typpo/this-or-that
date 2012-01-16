$(function() {
  window.vote = function(which) {
    var id = $('#main-img').attr('code');
    $.get(
      '/vote/' + id + '/' + which,
      function(data) {
        location.reload();
      }
    );
  }

});

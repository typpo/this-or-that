$(function() {
  function catchange() {
    var a = $('#category_a').val() == '' ? '?' : $('#category_a').val();
    var b = $('#category_b').val() == '' ? '?' : $('#category_b').val();
    var txt= a + ' or ' + b;
    $('#title-a').text(a);
    $('#title-b').text(b);
  }
  $('#category_a').keyup(catchange);
  $('#category_b').keyup(catchange);

  function imgchange() {
    var img = $('<img>')
      .attr('src', $(this).val())
      .css('height', 'auto').css('width', '125px');
    $(this).parent().append(img);
  }
  $('#fields-a input').change(imgchange);
  $('#fields-b input').change(imgchange);

});

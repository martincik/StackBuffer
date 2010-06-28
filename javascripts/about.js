var About = {
  init: function() {
    jQuery(function($) {
      About.registerTagsLoad();
    });
  },
  
  registerTagsLoad: function() {
    Layout.livePath('success', /about/, function(event, result) {
      $('section#detail').html("<h1 style='text-align: center;'>Not implemented yet! Sorry!</h1>");
    });
  }
};

About.init();

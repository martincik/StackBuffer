var Badges = {
  init: function() {
    jQuery(function($) {
      Badges.registerTagsLoad();
    });
  },
  
  registerTagsLoad: function() {
    Layout.livePath('success', /badges/, function(event, result) {
      $('section#detail').html("<h1 style='text-align: center;'>Not implemented yet! Sorry!</h1>");
    });
  }
};

Badges.init();

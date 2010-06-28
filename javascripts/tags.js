var Tags = {
  init: function() {
    jQuery(function($) {
      Tags.registerTagsLoad();
    });
  },
  
  registerTagsLoad: function() {
    Layout.livePath('success', /tags/, function(event, result) {
      $('section#detail').html("<h1 style='text-align: center;'>Not implemented yet! Sorry!</h1>");
    });
  }
};

Tags.init();

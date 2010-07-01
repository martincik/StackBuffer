var About = {
  init: function() {
    jQuery(function($) {
      About.registerTagsLoad();
    });
  },
  
  registerTagsLoad: function() {
    Layout.livePath('success', /about/, function(event, result) {
      $('section#detail').html($('section#templates div#about').html());
    });
  }
};

About.init();

var Spinner = {
  init: function() {
    jQuery(function($) {
      Spinner.registerAjaxLoad();
      Spinner.registerAjaxSuccess();
    });
  },
  
  registerAjaxLoad: function() {
    $(document).bind('path:loading', function(event, status) {
      log('show spinner');
      $('#content-spinner').css('display', 'block');
    });
  },
  
  registerAjaxSuccess: function() {
    $(document).bind('path:success', function(event, status) {
      log('hide spinner');
      $('#content-spinner').css('display', 'none');
    });
  }
};

Spinner.init();
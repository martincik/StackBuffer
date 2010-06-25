var Search = {
  init: function() {
    jQuery(function($) {
      Search.reqisterFormHandler();
    });
  },
  
  reqisterFormHandler: function() {
    $("form#searchform").bind('form:success', function(event, result) {
      Questions.renderQuestions(result, 'Search');
    });
  }
};

Search.init();
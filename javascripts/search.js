var Search = {
  init: function() {
    jQuery(function($) {
      Search.reqisterFormHandler();
      Questions.observeScroller();
    });
  },
  
  reqisterFormHandler: function() {
    $("form#searchform").bind('form:success', function(event, result) {
      Questions.lastListURL = "#/" + event[0];
      Questions.pagination.update(result.total, result.page, result.pagesize);
      Questions.renderQuestions(result, 'Search');
    });
  }
};

Search.init();
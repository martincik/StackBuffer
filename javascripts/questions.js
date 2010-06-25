var Questions = {
  init: function() {
    jQuery(function($) {
      Questions.reqisterQuestionsHandler();
      Questions.reqisterQuestionHandler();
    });
  },
  
  reqisterQuestionsHandler: function() {
    Layout.livePath('success', /questions$|questions[^\/]+/, function(event, result) {
      var title = 'Active questions'
      if (event[0].match(/votes/)) {
        title = 'Questions sorted by votes'
      }
      if (event[0].match(/featured/)) {
        title = 'Featured questions'
      }
      if (event[0].match(/hot/)) {
        title = 'Hot questions'
      }
      if (event[0].match(/week/)) {
        title = 'Questions for this week'
      }
      if (event[0].match(/month/)) {
        title = 'Questions for this month'
      }
      
    	Questions.renderQuestions(result, title);
    });
  },
  
  reqisterQuestionHandler: function() {
    Layout.livePath('success', /questions\/[0-9]+/, function (event, result) {
      Questions.renderQuestion(result);
    });
  },
  
  renderQuestion: function(result) {
    var template = $('#templates div#question').html();
    $('section#detail').html($.mustache(template, result));
    
    // Hightight code with prettyprint plugin
    $('pre').addClass('prettyprint');
    prettyPrint();    
  },
  
  // Default questions are active
  renderQuestions: function(result, title) {
    var template = $('#templates div#questions').html();
    
    result.title = title || 'Active';
    
    // Transform question object to readable form for users
    _.each(result.questions, function(q) {
      var newDate = new Date( );
      newDate.setTime( q.creation_date*1000 );    
      q.created_at = newDate.toDateString();

      // q.tags = _.map(q.tags, function(t) {
      //   tag = new Object();
      //   tag.name = t;
      //   var bgColor = md5(t).substr(0, 6);
      //   tag.backgroundColor = 'white' // bgColor;
      //   tag.color =  '#888' // adjustColour(bgColor);
      //   return tag;
      // });
    });

  	$('section#content').html($.mustache(template, result));
  }
};

Questions.init();
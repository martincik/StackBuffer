var Questions = {
  init: function() {
    jQuery(function($) {
      Questions.reqisterQuestionsHandler();
      Questions.reqisterQuestionHandler();
    });
  },
  
  reqisterQuestionsHandler: function() {
    Layout.livePath('success', /questions$|questions[^\/]+|questions\/unanswered/, function(event, result) {
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
      if (event[0].match(/unanswered/)) {
        title = 'Unanswered questions'
      }
      
    	Questions.renderQuestions(result, title);
    });
  },
  
  reqisterQuestionHandler: function() {
    Layout.livePath('success', /questions\/[0-9]+.*$/, function (event, result) {
      if (event[0].match(/answers/)) {
        Questions.renderAnswers(result);
      } else {
        Questions.renderQuestion(result);
      }
    });
  },
  
  renderQuestion: function(result) {
    log(result);
    var template = $('#templates div#question').html();    
    
    // Determine if show comments or not
    var question = result.questions[0];
    question.show_comments = (question.comments.length > 0);
    
    $('section#detail').html($.mustache(template, question));
    
    // Hightight code with prettyprint plugin
    $('pre').addClass('prettyprint');
    prettyPrint();
    
    // Now load the answers
    Layout.load('#' + question.question_answers_url + '?comments=true&sort=votes&body=true');
  },
  
  // Default questions are active
  renderQuestions: function(result, title) {
    var template = $('#templates div#questions').html();
    
    result.title = title || 'Active';
    
    // Transform question object to readable form for users
    _.each(result.questions, function(q) {
      q.created_at = Helpers.convertInt2DateTime(q.creation_date);
      q.question_relative_url = q.question_id + '?comments=true&body=true'
    });

  	$('section#content').html($.mustache(template, result));
  },
  
  renderAnswers: function(result) {
    var template = $('#templates div#answers').html();

    _.each(result.answers, function(a) {
      a.created_at = Helpers.convertInt2DateTime(a.creation_date);
      a.show_comments = (a.comments.length > 0);
      a.owner.gravatar_url = Helpers.gravatarURL(a.owner.email_hash);
    });
    
    $('section#detail answers').html($.mustache(template, result));
    
    $('section#detail answers pre').addClass('prettyprint');
    prettyPrint();
  }
};

Questions.init();
// only outputs if console available and does each argument on its own line
function log() {
  if (window && window.console && window.console.log) {
    var i, len;
    for (i=0, len=arguments.length; i<len; i++) {
      console.log(arguments[i]);
    }
  }
}

// Mustache.js global method
(function ($) {
  
  $.mustache = function(template, view, partials) {
    return Mustache.to_html(template, view, partials);
  };

})(jQuery);

// Pretty output of rails errors when doing ajax requests with jQuery
$(document).bind('ajaxError', function (event, response, options, error) {
  var html, heading, paragraph, pre;
    
  if (response.status == 500) {
    html      = $(response.responseText);
    heading   = $(html[1]).text();
    paragraph = $(html[3]).text();
    pre       = $(html[4]).text();
    log('');
    log('[ERROR] ' + response.status.toString());
    log($.trim(heading));
    log($.trim(paragraph));
    log($.trim(pre));
    log('');
  } else {
    log('');
    log('[ERROR] ' + response.status.toString());
    log(response.responseText);
    log('');
  }
});

// bind document to custom event
$(document).bind('path:loading', function(event, status) {
  log('path::loading');
  log(status);
});

$(document).bind('path:success:/users', function(event, result) {
	log('path::success::users');
	log(event);
	log(result);
	var template = $('#templates div#users').html();
	log(template);
	$('section#content').html($.mustache(template, result));
});

$(document).bind('path:success:/stats', function(event, result) {
	log('path::success::stats');
	log(event);
	log(result);
	var template = $('#templates div#stats').html();
	log(template);
	$('section#content').html($.mustache(template, result));
});

$(document).bind('path:success:/questions', function(event, result) {
	log('path::success::questions');
	log(event);
	log(result);
	var template = $('#templates div#questions').html();
	log(template);
	var bind_string = _.map(result.questions, function(q) {
	  return 'path:success:/questions/' + q.question_id.toString();
	}).join(' ');
	console.log(bind_string);
	$(document).bind(bind_string, function(event, result2) {
	  log(result2);
	  var template2 = $('#templates div#question').html();
	  $('section#detail').html($.mustache(template2, result2));
	});
	$('section#content').html($.mustache(template, result));
});


// only outputs if console available and does each argument on its own line
function log() {
  if (window && window.console && window.console.log) {
    var i, len;
    for (i=0, len=arguments.length; i<len; i++) {
      console.log(arguments[i]);
    }
  }
}

// window.onerror = function(err, file, line) {
//  log('The following error occurred: ' + err + '\nIn file: ' + file + '\nOn line: ' + line);
//  return true;
// }

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

function HexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function HexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function HexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

function rgbstringToTriplet(rgbstring)
{
  var R = HexToR(rgbstring);
  var G = HexToG(rgbstring);
  var B = HexToB(rgbstring);
  
  return [R,G,B];
}

function adjustColour(rgbstring)
{
   var triplet = rgbstringToTriplet(rgbstring);
   var newtriplet = [];
   // black or white:
   var total = 0; for (var i=0; i<triplet.length; i++) { total += triplet[i]; } 
   if(total > (3*256/2)) {
     newtriplet = [0,0,0];
   } else {
     newtriplet = [255,255,255];
   }
   return "rgb("+newtriplet.join(",")+")";
}

function processQuestionsResult(result) {
  var template = $('#templates div#questions').html();
	log(result.questions);
	var bind_string = _.map(result.questions, function(q) {
	  return 'path:success:/questions/' + q.question_id.toString();
	}).join(' ');
	
  _.each(result.questions, function(q) {
    q.tags = _.map(q.tags, function(t) {
      tag = new Object();
      tag.name = t;
      var bgColor = md5(t).substr(0, 6);
      tag.backgroundColor = 'white' // bgColor;
      tag.color =  '#888' // adjustColour(bgColor);
      return tag;
    });
  });
  
	$(document).bind(bind_string, function(event, result2) {
	  var template2 = $('#templates div#question').html();
	  $('section#detail').html($.mustache(template2, result2));
	  $('pre').addClass('prettyprint');
	  prettyPrint();
	});
	result.formId = 'searchform';
	$('section#content').html($.mustache(template, result));
	
	$("#searchform").bind('form:success', function(event, result) {
    log(event);
    log('processing search results');
    processQuestionsResult(result);
  });
}

$(document).bind('path:success:/questions', function(event, result) {
	processQuestionsResult(result);
});

function collapseContent() {
  if ($('#toggleContent').data("state") == "open") {
    hideCode();
  } else {
    showCode();
  }
  return false;
}

jQuery(function($) {
  $("#toggleContent").data("state","open").click(collapseContent);
});

$(document).shortkeys({ 'h': collapseContent });

function hideCode() {
  var c = $("#content"), 
      b = $("#detail"),
      a = c.width(),
      d = $("#toggleContent");
  
  c.animate({ left: "-" + a + "px" }, "easeOutQuad", function() {
    $("#toggleContent").data("state", "closed").toggleClass("collapsed");
  });
  d.animate({ left: 0 }, "easeOutQuad");
  b.animate({ left: 0 }, "easeOutQuad");
}

function showCode() {
  var c = $("#content"),
      b = $("#detail"),
      a = c.width(),
      d = $("#toggleContent");
  
  c.animate({ left: 0 }, "easeInQuad", function() {
    $("#toggleContent").data("state", "open").toggleClass("collapsed");
  });
  d.animate({ left: a + "px" }, "easeInQuad");
  b.animate({ left: a + "px" }, "easeInQuad");
}


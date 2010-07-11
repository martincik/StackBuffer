const API_VERSION = '1.0';
const API_URI = 'http://api.stackoverflow.com/' + API_VERSION;
const ROOT_URL = '#/questions';

var Layout = {
  live_path_regex: {'loading':[], 'success':[]},
  current_xhr: null,
  loading: false,
  api_url: API_URI,
  
  init: function() {
    jQuery(function($) {
      var needs_default_hash = !window.location.hash || (window.location.hash && !window.location.hash.match(/^#\/admin/));
      if (needs_default_hash) {
      	window.location.hash = ROOT_URL;
      }
      
      window.currentHash = window.location.hash;
      Layout.handlePageLoad();
      Layout.addObservers();
      Layout.makeBackFowardButtonsWork();
      
      // Init mustache for JQuery
      $.mustache = function(template, view, partials) {
        return Mustache.to_html(template, view, partials);
      };
      
      // Toggle
      $("#toggle-content").data("state","open").click(Layout.collapseContent);
      $(document).shortkeys({ 'h': Layout.collapseContent });
    });
  },
  
  post: function(url, data, options) {
    var ajax = {
      type     : 'post',
      dataType : 'jsonp',
			jsonp		 : 'jsonp',
      url      : url,
      success  : function (json) {
        Layout.onSuccess(json);
        if (options && options.success) {
          options.success(json);
        }
      }
    }
    
    if (data) {
      ajax['data'] = data;
      ajax['data'].merge({ apiKey: '-c3cp3WHf0C9apKxTIFKdQ' });
    } else {
      ajax['data'] = { apiKey: '-c3cp3WHf0C9apKxTIFKdQ' };
    }
    
    
    $.ajax(ajax);
  },
  
  addObservers: function() {
    Layout.observeHashChange();
    Layout.observeLinks();
    Layout.observeForms();
    Layout.observeLivePath();
  },
  
  observeLinks: function() {
    $("a[href^='#/']").live('click', function(event) {
      if (Layout.loading) {
        return false;
      }
      
      var $link   = $(this),
          loading = $link.attr('data-loading');
      
      Layout.updateHashWithoutLoad($link.attr('href'));
      
      $(document).trigger('hashchange');
      
      if (loading) {
        $(document).trigger('loading:indicator',[loading])
      }
      
      return false;
    });    
  },
  
  observeForms: function() {
    $(document).bind('layout:success', function() {
      $('form').removeErrors();
    });
    
    $('form').livequery('submit', function(event) {
      log("Form:");
      log($(this));
      event.preventDefault();
      var $form       = $(this),
          data_type   = $form.attr('data-type') || 'jsonp',
          remote_form = $form.attr('action').substr(0, 2) == '#/';
      
      if (!remote_form) {
        return true;
      }
      
      try {
        
      $form.ajaxSubmit({
        url       : Layout.api_url + $form.attr('action').replace(/^#/, ''),
        dataType  : data_type,
        jsonp     : 'jsonp',
        data      : { apiKey: '-c3cp3WHf0C9apKxTIFKdQ'},
        beforeSubmit: function(data, form, options) {
          $form.trigger('form:beforeSubmit', [data, form, options]);
        },
        beforeSend: function() {
          $form.trigger('form:beforeSend');
        },
        success: function(json) {
          // hack for iframe file uploads
          if (data_type == 'xml') {
            json_str   = $(json).find('response').text(),
            json       = JSON.parse(json_str);
          }
          
          if (json.errors) {
            var $errors_container    = $form,
                data_error_placement = $form.attr('data-error-placement');
            
            if (typeof(data_error_placement) !== undefined) {
              $errors_container = $form.find(data_error_placement);
            }
            
            $errors_container.showErrors(json.errors);
            $form.trigger('form:error', [json]);
          } else {
            //Layout.onSuccess(json);
            $form.trigger('form:success', [json]);
          }
        }, 
        error: function(response, status, error) {
          $form.trigger('form:error', [response, status, error]);
          alert(error);
        },
        complete: function() {
          log("form ajax complete");
          $form.trigger('form:complete');
        }
      });
      
    }  catch(err)
        {
          log(err);
          return false;
        }
      
      return false;
    });
  },
  
  observeHashChange: function() {
    $(document).bind('hashchange', Layout.reload);
  },
  
  updateHashWithoutLoad: function(location) {
    window.currentHash = window.location.hash = location;
  },
  
  makeBackFowardButtonsWork: function() {
    setInterval(function() {
      var hash_is_new = window.location.hash && window.currentHash != window.location.hash;
      
      if (hash_is_new) {
        window.currentHash = window.location.hash;
        Layout.handlePageLoad();
      }
    }, 300);
  },
  
  // Options are success and complete callbacks  
  load: function(path, options) {
    if (Layout.current_xhr) {
      Layout.current_xhr.abort();
    }
    
    path = path.replace(/^#/, '');
    $(document).trigger('path:loading', [path]);
    $(document).trigger('path:loading:' + path);
    log("Loading: " + path);
    Layout.current_xhr = $.ajax({
      url				: Layout.api_url + path,
      dataType	: 'jsonp',
			jsonp		 	: 'jsonp',
			data			: { apiKey: '-c3cp3WHf0C9apKxTIFKdQ' },
      success		: function(json) {
        $(document).trigger('path:success', [path, json]);
        $(document).trigger('path:success:' + path, [json]);
        if (options && options.success) {
          options.success();
        }
        Layout.current_xhr = null;
      },
      complete: function() {
        if (options && options.complete) {
          options.complete();
        }
      }
    });
  },
  
  // See Layout.load for options
  reload: function() {
    Layout.load(window.location.hash);
  },

  livePath: function(event, path, callback) {
    if (typeof(test) === 'string') {
      $(document).bind('path:' + event + ':' + path, callback);
    } else {
      Layout.live_path_regex[event].push([path, callback]);
    }
  },
  
  observeLivePath: function() {
    $(document).bind('path:loading', function(event, path) {
      $(Layout.live_path_regex['loading']).each(function() {
        if (matches = path.match(this[0])) {
          this[1](matches);
        }
      });
    });
    
    $(document).bind('path:success', function(event, path, json) {
      $(Layout.live_path_regex['success']).each(function() {
        if (matches = path.match(this[0])) {
          this[1](matches, json);
        }
      });
    });
  },
  
  handlePageLoad: function() {
    var segments = window.location.hash.replace(/^#\//, '').split('/'),
        total    = segments.length,
        path     = '';
    
    $(document).trigger('page:loading');
    
    function loadSectionsInOrder() {
      var segment = segments.shift();
      path += '/' + segment;
      
      var onComplete = function() {
        var loaded   = total - segments.length,
            finished = loaded == total;
            
        $(document).trigger('page:progress', [total, loaded]);
        
        if (finished) {
          $(document).trigger('page:loaded');
        } else {
          loadSectionsInOrder();
        }
      };
      
      Layout.load(path, {complete: onComplete});
    }
    
    // start the recursive loading of sections
    loadSectionsInOrder();
  },
  
  // Toggle functionality

  hideContent: function() {
    var c = $("#content"), 
        b = $("#detail"),
        a = c.width(),
        d = $("#toggle-content");

    c.animate({ left: "-" + a + "px" }, "easeOutQuad", function() {
      $("#toggle-content").data("state", "closed").toggleClass("collapsed");
    });
    d.animate({ left: 0 }, "easeOutQuad");
    b.animate({ left: 0 }, "easeOutQuad");
  },

  showContent: function() {
    var c = $("#content"),
        b = $("#detail"),
        a = c.width(),
        d = $("#toggle-content");

    c.animate({ left: 0 }, "easeInQuad", function() {
      $("#toggle-content").data("state", "open").toggleClass("collapsed");
    });
    d.animate({ left: a + "px" }, "easeInQuad");
    b.animate({ left: a + "px" }, "easeInQuad");
  },

  collapseContent: function() {
    if ($('#toggle-content').data("state") == "open") {
      Layout.hideContent();
    } else {
      Layout.showContent();
    }
    return false;
  }
};

Layout.init();

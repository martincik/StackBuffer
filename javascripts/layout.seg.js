/**
  IMPORTANT: Requires this version of jquery 
             until 1.3.3 comes out http://gist.github.com/186325

  ALSO:      This is very dirty still and has not been 
             abstracted for use. It is just solving our immediate problems.

  Use cases that must pass (and should be tested someday):
    * Clicking on links updates layout
    * Click around a bit and then use back/forward buttons
    * Make sure recursive loading is working (#/sections/23)
    * Forms should send beforeSubmit, beforeSend, success, error, valid 
      and invalid events
    * Safari should send connection close url to ajaxSubmit for file uploads
    * Should fire events for page loading, progress for each step and loaded
*/

(function ($) {
  
  $.mustache = function(template, view, partials) {
    return Mustache.to_html(template, view, partials);
  };
  
  // errors is an array of errors
  // render :json => {:errors => @item.errors.full_messages}
  function FormErrors(errors) {
    var error_count = errors.length;
    
    function errorUl() {
      var lis = '';
      errors.forEach(function(error) {
        lis += '<li>' + error + '</li>';
      });
      return '<ul>' + lis + '</ul>';
    }

    function errorHeading() {
      var error_str = error_count === 1 ? 'error' : 'errors';
      return '<h2>' + error_count + ' ' + error_str + ' prevented this form from being saved</h2>';
    }
    
    this.html = function () {
      var html = '';
      html += '<div class="errorExplanation" id="errorExplanation">';
      html += errorHeading();
      html += errorUl();
      html += '</div>';
      return html;
    };
  }

  $.fn.removeErrors = function () {
    return this.each(function () {
      $(this).find('.errorExplanation').remove();
    });
  };

  $.fn.showErrors = function (errors) {
    return this.each(function () {
      $(this).removeErrors().prepend(new FormErrors(errors).html());
    });
  };
})(jQuery);

var Layout = {
  live_path_regex: {'loading':[], 'success':[]},
  current_xhr: null,
  loading: false,
  api_url: 'http://api.stackoverflow.com/0.8',
  
  init: function() {
    jQuery(function($) {
      var needs_default_hash = !window.location.hash || (window.location.hash && !window.location.hash.match(/^#\/admin/));
      if (needs_default_hash) {
      	window.location.hash = '#/stats';
      }
      
      window.currentHash = window.location.hash;
      Layout.handlePageLoad();
      Layout.addObservers();
      Layout.makeBackFowardButtonsWork();
    });
  },
  
  destroy: function(url, options) {
    Layout.post(url, {'_method':'delete'}, options);
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
    
    $('.remote_destroy').live('click', function(event) {
      var $target = $(this);
      
      confirmDialog('Are you sure you want to delete this?', {
        ok: function() {
          Layout.destroy($target.attr('href'), {
            success: function(json) { $target.trigger('destroy:success', [json]); }
          });
        }
      });
      
      return false;
    });
  },
  
  observeForms: function() {
    $(document).bind('layout:success', function() {
      $('form').removeErrors();
    });
    
    $('form').live('submit', function(event) {
      var $form        = $(this),
          data_type   = $form.attr('data-type') || 'json',
          remote_form = $form.attr('action').substr(0, 2) == '#/';
      
      if (!remote_form) {
        return true;
      }
      
      $form.ajaxSubmit({
        url       : $form.attr('action').replace(/^#/, ''),
        dataType  : data_type,
        data      : {iframe: 1},
        closeKeepAlive: $.browser.safari ? '/admin/connection_close' : false,
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
            Layout.onSuccess(json);
            $form.trigger('form:success', [json]);
          }
        }, 
        error: function(response, status, error) {
          $form.trigger('form:error', [response, status, error]);
        },
        complete: function() {
          $form.trigger('form:complete');
        }
      });
      
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
    Layout.current_xhr = $.ajax({
      url				: Layout.api_url + path,
      dataType	: 'jsonp',
			jsonp		 	: 'jsonp',
			data			: { apiKey: '-c3cp3WHf0C9apKxTIFKdQ', body: true },
      success		: function(json) {
//        Layout.onSuccess(json);
        console.log('path:success:' + path);
        $(document).trigger('path:success', [path, json]);
        $(document).trigger('path:success:' + path, [json]);
        if (options && options.success) {
          options.success();
        }
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
  
  onSuccess: function(json) {
    $('li.item.loading').removeClass('loading');
//    Layout.applyJSON(json);
    $(document).trigger('layout:success');
    Layout.current_xhr = null;
  },
  
  applyJSON: function(json) {
    for(action in json) {
      var selectors = json[action];
      switch(action) {
        case 'replace'      : for(selector in selectors) $(selector).html(selectors[selector]);            break;
        case 'append'       : for(selector in selectors) $(selector).append(selectors[selector]);          break;
        case 'prepend'      : for(selector in selectors) $(selector).prepend(selectors[selector]);         break;
        case 'replaceWith'  : for(selector in selectors) $(selector).replaceWith(selectors[selector]);     break;
        case 'insertBefore' : for(selector in selectors) $(selectors[selector]).insertBefore($(selector)); break;
        case 'sidebar'      : Sidebar.add(selectors);                                                      break;
        case 'remove'       : $(selectors.join(',')).remove();                                             break;
      }
    }
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
  }
};

Layout.init();
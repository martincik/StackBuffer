var Users = {
  pagination: null,
  
  init: function() {
    jQuery(function($) {
      Users.registerUsersLoad();
      Users.observeScroller();
    });
  },
  
  registerUsersLoad: function() {
    Layout.livePath('success', /users$|users[^\/]+/, function(event, result) {
      var title = 'Users by reputation'
      if (event[0].match(/name/)) {
        title = 'Users by name'
      }
      if (event[0].match(/creation/)) {
        title = 'Users by creation date'
      }
      
      Users.pagination.update(result.total, result.page, result.pagesize);
      Users.renderUsers(result, title);    	
    });
  },
  
  renderUsers: function(result, title) {
    result.title = title || 'Active users';
    
    _.each(result.users, function(u) {
      u.created_at = Helpers.convertInt2DateTime(u.creation_date);
      u.last_access_at = Helpers.convertInt2DateTime(u.last_access_date);
      u.gravatar_url = Helpers.gravatarURL(u.email_hash, 60);
    });
    
    var template = $('#templates div#users_partial').html();
    
    if (Users.pagination.isOnFirstPage()) {
      // reset scroll position
      $('section#content').animate({ scrollTop: 0 }, "easeOutBack");

      // layout needs ugly hack because of > gets escaped in jQuery and
      // mustache.js has this not-smart syntax :(
      var layout = $('#templates div#users').html().replace(/&gt;/, '>');
      var partial = { users_partial: template };
      $('section#content').html($.mustache(layout, result, partial));
    } else {
      $('section#content > users').append($.mustache(template, result));
      Users.pagination.loadingFinished();
    }
  },
  
  observeScroller: function() {
    Users.pagination = new Pagination()
    Users.pagination.observe("section#content", Layout.load)
  }
  
};

Users.init();

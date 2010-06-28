var Users = {
  init: function() {
    jQuery(function($) {
      Users.registerUsersLoad();
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
      
    	Users.renderUsers(result, title);
    });
  },
  
  renderUsers: function(result, title) {
    var template = $('#templates div#users').html();
    
    result.title = title || 'Active users';
    
    _.each(result.users, function(u) {
      u.created_at = Helpers.convertInt2DateTime(u.creation_date);
      u.last_access_at = Helpers.convertInt2DateTime(u.last_access_date);
      u.gravatar_url = Helpers.gravatarURL(u.email_hash, 60);
    });
    
  	$('section#content').html($.mustache(template, result));
  }
};

Users.init();

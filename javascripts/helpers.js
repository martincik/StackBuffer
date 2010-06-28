var Helpers = {
  
  // Transforms integer provided by Stackoverflow to datetime string
  // Could be improved much more!
  convertInt2DateTime: function(i) {
    var newDate = new Date();
    newDate.setTime( i*1000 );
    return newDate.toDateString()
  },
  
  gravatarURL: function(email_hash, size) {
    if (size == undefined) size = 40
    return "http://www.gravatar.com/avatar/" + email_hash + "?s=" + size + "&d=mm&r=g"
  }
};

function Pagination() {

  // private
  var total = 0;
  var page = 1;
  var pagesize = 30;
  var loading = false;

  // returns  percentage value between 0 and 100%
  var positionOfScrollBar = function(element) {
    return Math.round($(element).attr('scrollTop') / ($(element).attr( 'scrollHeight' ) - $(element).attr('clientHeight')) * 100)
  }

  // public
  return {    
    update: function(_total, _page, _pagesize) {
      total = parseInt(_total) || 0;
      page = parseInt(_page) || 1;
      pagesize = parseInt(_pagesize) || 30;
      loading = false;
    },
    
    loadingFinished: function() {
      loading = false;
    },
    
    // returns true if page equal to 1 otherwise false
    isOnFirstPage: function() {
      return (page == 1)
    },
    
    // simple impl. of URL with pagination
    urlWithPagination: function(_url) {
      var url = _url || window.location.hash;
      url += (url.indexOf('?') != -1) ? "&" : "?";
      url += "page=" + (page+1)
      return url
    },
    
    observe: function(element, loadFun, urlFun, _bottomThreshold, _topThreshold) {
      // set bottom treshold to 90% on bottom and 10% on top
      var bottomThreshold = _bottomThreshold || 90
      var topThreshold = _topThreshold || 10
      
      loading = false
      var self = this;
      $(element).scroll(function() {
        // do not load more than there is or if loading
        if (((page * pagesize) > total) || loading)
          return;
        
        if (positionOfScrollBar(element) > bottomThreshold) {
          log("page: " + page);
          log("pagesize: " + pagesize);
          log("total: " + total);

          loading = true;
          loadFun((urlFun ? self.urlWithPagination(urlFun()) : self.urlWithPagination()));
        }
      })
    }
  }
}
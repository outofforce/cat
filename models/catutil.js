
exports.split = function(doc,dem) {
  var pos = 0;
  pos = doc.indexOf(dem);
  var pair={};
  if (pos == -1) { pair[0]=1; return pair; }
  pair[0]= 0;
  pair[1]= doc.substring(0,pos);
  pair[2]= doc.substring(pos+dem.length,doc.length);
  return pair;
};

exports.stringToDateTime = function(postdate) {
    var second = 1000;
    var minutes = second*60;
    var hours = minutes*60;
    var days = hours*24;
    var months = days*30;
    var twomonths = days*365;
    var myDate = postdate;
    if (isNaN(myDate)) {
      myDate =new Date(postdate.replace(/-/g, "/"));
    }
    var nowtime = new Date();
    var longtime =nowtime.getTime()- myDate.getTime();
    var showtime = 0;
    if( longtime > months*2 ) {
      return postdate;
    } else if (longtime > months) {
      return "1个月前";
    } else if (longtime > days*7) {
      return ("1周前");
    } else if (longtime > days) {
      return(Math.floor(longtime/days)+"天前");
    } else if ( longtime > hours) {
      return(Math.floor(longtime/hours)+"小时前");
    } else if (longtime > minutes) {
      return(Math.floor(longtime/minutes)+"分钟前");
    } else if (longtime > second) {
      return(Math.floor(longtime/second)+"秒前");
    } else {
      return("刚刚");
    }
};
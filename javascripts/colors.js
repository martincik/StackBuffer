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

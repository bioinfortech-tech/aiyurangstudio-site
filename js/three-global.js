/* One three.js (r160, ES module via the importmap) for the whole page: the hero shader and the iris share it.
   The hero starts when this fires; if the module cannot load, the hero takes its existing no-WebGL path. */
(function(){
"use strict";
function done(m){if(m)window.THREE=m;window.dispatchEvent(new Event("three-ready"));}
try{import("three").then(done,function(){done(null);});}catch(e){done(null);}
})();

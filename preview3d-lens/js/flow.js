/* Process timelines (main #process and /tools "how we work"): a line draws as you scroll, each step rises in as it is reached,
   and a small per-step sketch draws itself. Smooth easing only; nothing blinks or shakes. Decorative; the text stays in the DOM. */
(function(){
"use strict";
var rm=document.documentElement.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var NS="http://www.w3.org/2000/svg";
/* small sketches, 120x72 viewBox; every shape draws with pathLength=1 */
var V={
 plan:'<rect x="30" y="8" width="60" height="56" rx="3"/><path d="M40 22h30"/><path d="M40 32h40"/><path d="M40 42h34"/><path class="ac" d="M40 52h16"/>',
 board:'<rect x="14" y="10" width="92" height="52" rx="3"/><path d="M14 46l24-16 20 12 18-10 30 14"/><circle class="ac" cx="84" cy="26" r="6"/><path d="M26 54h22"/>',
 make:'<path d="M12 18h96"/><rect x="14" y="26" width="34" height="10" rx="2"/><rect x="52" y="26" width="22" height="10" rx="2"/><rect x="78" y="26" width="28" height="10" rx="2"/><rect x="14" y="42" width="52" height="10" rx="2"/><rect x="70" y="42" width="36" height="10" rx="2"/><path class="ac ph" d="M50 12v50"/>',
 done:'<circle cx="60" cy="36" r="24"/><circle cx="60" cy="36" r="30" opacity=".4"/><path class="ac" d="M48 37l9 9 17-20"/>',
 talk:'<rect x="12" y="10" width="56" height="26" rx="6"/><path d="M24 36l-2 9 11-9"/><path d="M24 20h30"/><path d="M24 27h18"/><rect class="ac" x="52" y="34" width="56" height="26" rx="6"/><path d="M64 46h32"/><path d="M64 53h20"/>',
 design:'<rect x="14" y="8" width="92" height="56" rx="3"/><path d="M14 20h92"/><rect x="22" y="28" width="30" height="28" rx="2"/><path d="M60 30h38"/><path d="M60 40h30"/><path class="ac" d="M60 50h22"/>',
 build:'<path d="M42 20l-18 16 18 16"/><path d="M78 20l18 16-18 16"/><path class="ac" d="M66 16l-12 40"/>',
 ship:'<path d="M20 30l40-18 40 18v26l-40 12-40-12z"/><path d="M20 30l40 16 40-16"/><path d="M60 46v22"/><path class="ac" d="M84 12l8 8 14-16" />'
};
var OFF={plan:-28,board:-12,make:-12,done:-28,talk:-10,design:-12,build:-22,ship:-18};
function sketch(key){
  var svg=document.createElementNS(NS,"svg");svg.setAttribute("viewBox","0 0 120 72");svg.setAttribute("class","fv");svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
  svg.innerHTML=V[key]||"";svg.style.marginLeft=(OFF[key]||0)+"px";
  var els=svg.querySelectorAll("path,rect,circle"),i=0;
  [].forEach.call(els,function(e){e.setAttribute("pathLength","1");e.style.setProperty("--d",i++);});
  return svg;
}
function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
function setup(ol){
  var keys=(ol.getAttribute("data-flow")||"plan,board,make,done").split(",");
  var items=[].slice.call(ol.children);
  ol.classList.add("flow");
  var line=document.createElement("i");line.className="fl-line";line.setAttribute("aria-hidden","true");ol.insertBefore(line,ol.firstChild);
  items.forEach(function(li,i){
    var box=document.createElement("span");box.className="fl-box";box.appendChild(sketch(keys[i]||"plan"));
    li.insertBefore(box,li.firstChild);
    var dot=document.createElement("b");dot.className="fl-dot";dot.setAttribute("aria-hidden","true");li.appendChild(dot);
  });
  var cur=0,tgt=0,raf=0,vert=false,reached=-1;
  function measure(){vert=getComputedStyle(ol).gridTemplateColumns.split(" ").length===1;}
  function calc(){
    var r=ol.getBoundingClientRect(),vh=innerHeight;
    if(vert)tgt=Math.max(0,Math.min(1,(vh*.78-r.top)/Math.max(1,r.height)));
    else tgt=Math.max(0,Math.min(1,(vh*.86-r.top)/(vh*.5)));
    if(rm)tgt=1;
  }
  function paint(){
    ol.style.setProperty("--p",cur.toFixed(4));
    var L=vert?ol.offsetHeight:ol.offsetWidth,head=cur*L,n=0;
    items.forEach(function(li,i){
      var mk=vert?li.offsetTop+10:li.offsetLeft+10;
      var on=head>=mk;li.classList.toggle("reached",on);if(on)n=i+1;
    });
    ol.style.setProperty("--prog",items.length?(n/items.length).toFixed(3):0);
  }
  function tick(){
    raf=0;calc();
    var d=tgt-cur;cur+=d*(rm?1:.085);
    if(Math.abs(d)<.0005)cur=tgt;
    paint();
    if(cur!==tgt)raf=requestAnimationFrame(tick);
  }
  function kick(){if(!raf)raf=requestAnimationFrame(tick);}
  measure();calc();cur=rm?tgt:0;paint();kick();
  addEventListener("scroll",kick,{passive:true});
  addEventListener("resize",function(){measure();kick();},{passive:true});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();kick();});
}
[].forEach.call(document.querySelectorAll("ol.st,ol.flow-src"),setup);
})();

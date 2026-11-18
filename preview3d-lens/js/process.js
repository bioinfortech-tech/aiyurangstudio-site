/* Main page process: all four steps sit on one row from the start; as you scroll, a filled pill slides and resizes along the row
   (기획 → 콘티 → 제작 → 마감), the active step brightens, the others dim, and the description below crossfades.
   Scroll-linked with smoothing. Nothing pops in, nothing blinks. Content stays in the DOM. */
(function(){
"use strict";
var sec=document.getElementById("process"),row=document.getElementById("prRow"),panel=document.getElementById("prPanel");
if(!sec||!row||!panel)return;
var rm=document.documentElement.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
if(rm){sec.classList.add("pr-static");return;} /* reduced motion: static grid of the four panels (CSS) */
var pill=row.querySelector(".pr-pill"),lis=[].slice.call(row.querySelectorAll("li")),ds=[].slice.call(panel.querySelectorAll(".pr-d")),arts=[].slice.call(panel.querySelectorAll(".pr-art"));
var N=lis.length,L=[],W=[],cur=0,tgt=0,raf=0,last=performance.now(),secTop=0,len=1;
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function sstep(t){t=clamp(t,0,1);return t*t*(3-2*t);}
function measure(){
  var vh=innerHeight;
  sec.style.height=Math.round(vh*(innerWidth<=760?2.6:2.9))+"px";
  secTop=sec.getBoundingClientRect().top+scrollY;len=Math.max(1,sec.offsetHeight-vh);
  var rr=row.getBoundingClientRect();
  L=lis.map(function(li){var r=li.getBoundingClientRect();return r.left-rr.left;});
  W=lis.map(function(li){return li.getBoundingClientRect().width;});
  var h=row.getBoundingClientRect().height;pill.style.height=h+"px";
}
function target(){
  var p=clamp((scrollY-secTop)/len,0,1);
  p=clamp((p-.06)/.88,0,1);                 /* a short rest at both ends */
  var x=p*(N-1),i=Math.min(N-2,Math.floor(x)),f=x-i;
  return i+sstep(f);                         /* eases into every step, so the pill lingers on each one */
}
function paint(t,pp){
  var i=Math.min(N-2,Math.max(0,Math.floor(t))),f=t-i;
  var x=L[i]+(L[i+1]-L[i])*f,w=W[i]+(W[i+1]-W[i])*f;
  pill.style.transform="translate3d("+x.toFixed(1)+"px,0,0)";pill.style.width=w.toFixed(1)+"px";
  lis.forEach(function(li,k){li.style.setProperty("--a",Math.max(0,1-Math.abs(t-k)).toFixed(3));});
  ds.forEach(function(d,k){
    var dd=k-t,a=Math.max(0,1-Math.abs(dd)*1.9);
    d.style.opacity=a.toFixed(3);
    
    d.style.visibility=a<.01?"hidden":"visible";
  });
  arts.forEach(function(d,k){var a=Math.max(0,1-Math.abs(k-t));d.style.opacity=a.toFixed(3);d.style.visibility=a<.01?"hidden":"visible";});
}
function tick(now){
  raf=0;var dt=Math.min(.05,(now-last)/1000)||.016;last=now;
  tgt=target();  var d=tgt-cur;cur+=d*(rm?1:1-Math.exp(-dt*7));  if(Math.abs(tgt-cur)<.001)cur=tgt;
  paint(cur);
  if(cur!==tgt)raf=requestAnimationFrame(tick);
}
function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(tick);}}
measure();tgt=target();cur=tgt;paint(cur);
addEventListener("scroll",kick,{passive:true});
addEventListener("resize",function(){measure();kick();},{passive:true});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();kick();});
addEventListener("load",function(){measure();kick();});
})();

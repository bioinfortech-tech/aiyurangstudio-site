/* Three doors: each previews its page's mood. AI = light particles forming the iris over a thumbnail,
   live = film frame with grain (CSS), tools = blueprint window (CSS/SVG). Decorative only. */
(function(){
"use strict";
var cv=document.querySelector(".dr-fx");if(!cv)return;
var rm=document.documentElement.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var ctx=cv.getContext("2d");if(!ctx)return;
var small=Math.min(screen.width||9999,innerWidth)<=760,dpr=Math.min(devicePixelRatio||1,small?1.5:2);
var W=0,H=0,P=[],N=small?150:260,t0=0,raf=0,running=false,visible=false;
var spr=document.createElement("canvas");spr.width=spr.height=24;
(function(){var c=spr.getContext("2d"),g=c.createRadialGradient(12,12,0,12,12,12);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.3,"rgba(190,200,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.fillRect(0,0,24,24);})();
function targets(){
  var T=[],cx=W/2,cy=H/2,R=Math.min(W,H)*.34,i,n7=Math.floor(N*.55),nr=N-n7;
  for(i=0;i<n7;i++){var k=i/n7*7,s=Math.floor(k),f=k-s,a1=s/7*Math.PI*2-Math.PI/2,a2=(s+1)/7*Math.PI*2-Math.PI/2;
    T.push([cx+(Math.cos(a1)*(1-f)+Math.cos(a2)*f)*R,cy+(Math.sin(a1)*(1-f)+Math.sin(a2)*f)*R]);}
  for(i=0;i<nr;i++){var a=i/nr*Math.PI*2;T.push([cx+Math.cos(a)*R*1.45,cy+Math.sin(a)*R*1.45]);}
  return T;
}
function size(){
  W=cv.clientWidth||300;H=cv.clientHeight||225;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
  var T=targets();
  for(var i=0;i<N;i++){var p=P[i]||(P[i]={x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,ph:Math.random()*6.28});p.tx=T[i][0];p.ty=T[i][1];}
}
function still(){ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation="lighter";ctx.globalAlpha=.8;for(var i=0;i<N;i++)ctx.drawImage(spr,P[i].tx-5,P[i].ty-5,10,10);}
function draw(now){
  raf=0;if(!running)return;var t=(now-t0)/1000;
  ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation="lighter";
  for(var i=0;i<N;i++){var p=P[i],e=Math.min(1,Math.max(0,(t-i/N*.8)/1.6));
    p.vx=(p.vx+(p.tx-p.x)*.014*(.2+e))*.88;p.vy=(p.vy+(p.ty-p.y)*.014*(.2+e))*.88;
    p.x+=p.vx+Math.sin(t*1.2+p.ph)*.12;p.y+=p.vy+Math.cos(t*1.1+p.ph)*.12;
    ctx.globalAlpha=(.25+.65*e)*(.6+.4*Math.sin(t*2+p.ph));ctx.drawImage(spr,p.x-5,p.y-5,10,10);}
  raf=requestAnimationFrame(draw);
}
size();addEventListener("resize",function(){size();if(rm)still();},{passive:true});
if(rm){for(var i=0;i<N;i++){P[i].x=P[i].tx;P[i].y=P[i].ty;}still();return;}
if("IntersectionObserver" in window)new IntersectionObserver(function(es){
  visible=es[0].isIntersecting;
  if(visible&&!running){running=true;t0=performance.now();raf=requestAnimationFrame(draw);}else if(!visible){running=false;}
},{threshold:.2}).observe(cv);
})();

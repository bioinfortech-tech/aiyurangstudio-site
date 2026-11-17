/* Lens chapter: one 3D lens stays pinned while five colour bands scroll past.
   Each band drops one part onto the lens (front glass, iris, focus ring, barrel, camera body).
   The front glass is a window: it plays the studio reel (media/hero*.mp4, muted, looping a short segment per piece);
   the clip changes on the iris blink. At the end the glass opens up to full screen and flows into #work.
   Pure CSS 3D + SVG, vanilla JS, one rAF per scroll, transform/opacity only. All decorative: the chapter is aria-hidden. */
(function(){
"use strict";
var root=document.documentElement;
var chap=document.getElementById("chap");if(!chap)return;
var cs=chap.querySelector(".cs"),ob=document.getElementById("ob"),oz=document.getElementById("oz"),rot=document.getElementById("rot");
var dv=document.getElementById("dv"),dk=document.getElementById("dk"),pgn=document.getElementById("pgn");
var panels=[].slice.call(chap.querySelectorAll(".cp")),slats=[].slice.call(chap.querySelectorAll(".cslats i")),dots=[].slice.call(chap.querySelectorAll(".cpg u"));
var reduce=root.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var small=Math.min(screen.width||9999,innerWidth)<=760;
var N=small?20:30,OX=-34,NS="http://www.w3.org/2000/svg";
var COL=[{bg:"#EFE7D6",ink:"#1B1A17"},{bg:"#111113",ink:"#F3EEE4"},{bg:"#EE8B76",ink:"#1E1210"},{bg:"#9DB095",ink:"#12190F"},{bg:"#F5F3EE",ink:"#141414"}];
var DARK="#0B0B0D";
var VIDEO="media/hero.mp4",VIDEO_M="media/hero_m.mp4";
/* reel segments [start,end] and the existing work each one stands for (id from data.js) */
var SEG=[[4.3,7.0],[8.3,11.6],[12.3,14.0],[14.6,16.7],[.3,3.8]];
var WORK=["ET5HAefyeU8","4CLaS99kBs0","wAwgIWlP6T0","f4Lieu1fhyo","tprAaZzA1Sw"];

function f0(n){return Math.max(0,Math.min(255,Math.round(n)));}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function ss(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
function eBack(t){var c=.8,u=t-1;return 1+(c+1)*u*u*u+c*u*u;}
function eIO(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}

/* ---------- geometry builders (design space px, x = lens axis, front = -x) ---------- */
function cyl(x0,x1,R,n,base,o){o=o||{};
  var L=x1-x0,xc=(x0+x1)/2+OX,w=2*R*Math.sin(Math.PI/n)+1,ap=R*Math.cos(Math.PI/n),s="";
  for(var k=0;k<n;k++){
    var a=k*360/n,ra=a*Math.PI/180,b=.75*Math.sin(ra)+.66*Math.cos(ra),bp=Math.max(0,b);
    var kk=.24+.76*bp,sp=Math.pow(bp,o.gloss||16)*(o.spec||120);
    var c="rgb("+f0(base[0]*kk+sp)+","+f0(base[1]*kk+sp)+","+f0(base[2]*kk+sp*1.03)+")";
    var bg=(o.tex?o.tex+",":"")+"linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,0) 20%,rgba(0,0,0,0) 72%,rgba(0,0,0,.26)),"+c;
    s+='<i class="f" style="width:'+L+'px;height:'+w.toFixed(1)+'px;margin:'+(-w/2).toFixed(1)+'px 0 0 '+(-L/2)+'px;background:'+bg+';transform:translateX('+xc.toFixed(1)+'px) rotateX('+a.toFixed(1)+'deg) translateZ('+ap.toFixed(1)+'px)"></i>';
  }
  return s;
}
function disc(x,R,bg,extra,inner,cls){
  return '<i class="d '+(cls||"")+'" style="width:'+2*R+'px;height:'+2*R+'px;margin:'+(-R)+'px 0 0 '+(-R)+'px;background:'+(bg||"none")+';transform:translateX('+(x+OX)+'px) rotateY(-90deg);'+(extra||"")+'">'+(inner||"")+'</i>';
}
function ann(x,Ro,Ri,bg){
  var p=(Ri/Ro*100).toFixed(2),m="radial-gradient(circle closest-side,transparent "+p+"%,#000 "+(+p+.6).toFixed(2)+"%)";
  return disc(x,Ro,bg,"-webkit-mask:"+m+";mask:"+m+";");
}
var METAL="conic-gradient(from 30deg,#e6e8ee,#7d8088 .18turn,#2b2c31 .45turn,#8a8d95 .7turn,#f1f2f6 .85turn,#e6e8ee)";
var METAL_D="conic-gradient(from 30deg,#8c8f97,#4a4c52 .2turn,#1c1d21 .45turn,#55575e .7turn,#9a9da5 .85turn,#8c8f97)";
function glass(r){return "radial-gradient(circle,rgba(40,60,150,.03),rgba(120,70,190,.06) 60%,rgba(50,190,170,.10) 86%,rgba(255,255,255,.26) 100%)";}
function box(cx,cy,cz,dx,dy,dz,sk){ /* faces: -x(front), +z, top, back, -z, bottom */
  var X=cx+OX,s="";
  function face(w,h,tr,bg){return '<i class="f" style="width:'+w+'px;height:'+h+'px;margin:'+(-h/2)+'px 0 0 '+(-w/2)+'px;background:'+bg+';transform:translate3d('+tr[0]+'px,'+tr[1]+'px,'+tr[2]+'px) '+tr[3]+'"></i>';}
  s+=face(dz,dy,[X-dx/2,cy,cz,"rotateY(-90deg)"],sk.front);
  s+=face(dx,dy,[X,cy,cz+dz/2,""],sk.side);
  s+=face(dx,dz,[X,cy-dy/2,cz,"rotateX(90deg)"],sk.top);
  s+=face(dz,dy,[X+dx/2,cy,cz,"rotateY(90deg)"],sk.back||sk.side);
  s+=face(dx,dy,[X,cy,cz-dz/2,"rotateY(180deg)"],sk.back||sk.side);
  s+=face(dx,dz,[X,cy+dy/2,cz,"rotateX(-90deg)"],sk.back||sk.side);
  return s;
}
function irisSVG(){
  var n=7,o='<svg class="irs" viewBox="-150 -150 300 300" width="300" height="300" focusable="false"><defs><clipPath id="irc"><circle r="146"/></clipPath>'+
   '<linearGradient id="irg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a5c63"/><stop offset=".5" stop-color="#24252a"/><stop offset="1" stop-color="#0d0d10"/></linearGradient></defs><g clip-path="url(#irc)">';
  for(var i=0;i<n;i++){o+='<path class="ir-b" fill="url(#irg)" d="M128 -70L128 330L360 330L360 -70Z" transform="rotate('+(i*360/n).toFixed(2)+')"/>';}
  return o+'</g><circle r="146" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/></svg>';
}

var RIDGE="repeating-linear-gradient(180deg,rgba(0,0,0,.42) 0 1.2px,rgba(255,255,255,.07) 1.2px 3.4px)";
var SEAMS="linear-gradient(90deg,transparent 55%,rgba(0,0,0,.6) 55% 56%,rgba(255,255,255,.14) 56% 57%,transparent 57% 76%,rgba(0,0,0,.55) 76% 77%,transparent 77%)";
var LEATHER="radial-gradient(rgba(255,255,255,.07) 1px,transparent 1.5px) 0 0/6px 6px";

var P_FG=
  cyl(-262,-200,162,N,[126,128,136],{gloss:14,spec:110})+
  ann(-262,162,146,METAL)+
  disc(-246,146,"#050507","overflow:hidden;","<video class=\"wv\" muted playsinline preload=\"metadata\" disablepictureinpicture></video>","win")+
  disc(-248,146,"radial-gradient(circle,rgba(0,0,0,0) 52%,rgba(0,0,0,.55) 100%)","")+
  disc(-250,146,"#000","opacity:0;","","blk")+
  disc(-264,148,glass(),"border:1px solid rgba(255,255,255,.42);")+
  disc(-271,124,glass(),"border:1px solid rgba(160,120,255,.38);")+
  disc(-277,92,glass(),"border:1px solid rgba(90,220,200,.34);")+
  disc(-281,56,glass(),"border:1px solid rgba(255,255,255,.3);")+
  disc(-285,128,"radial-gradient(ellipse 36% 17% at 34% 24%,rgba(255,255,255,.62),rgba(255,255,255,0) 72%),radial-gradient(ellipse 16% 40% at 80% 70%,rgba(255,255,255,.10),rgba(255,255,255,0))","");
var P_IR=ann(-258,152,140,METAL_D)+disc(-256,150,"none","","<div class=\"irw\">"+irisSVG()+"</div>");
var P_FR=
  cyl(-120,-10,172,N,[60,61,66],{tex:RIDGE,gloss:8,spec:50})+
  cyl(-124,-120,174,N,[196,198,205],{spec:150})+cyl(-10,-6,174,N,[196,198,205],{spec:150})+
  ann(-124,174,150,METAL_D);
var P_BR=
  cyl(-200,100,150,N,[106,109,116],{tex:SEAMS,gloss:22,spec:140})+
  cyl(100,152,128,N,[84,86,92],{gloss:18,spec:100})+
  cyl(152,176,116,N,[200,202,208],{spec:170});
var P_MT=
  box(260,0,0,180,370,540,{front:LEATHER+",linear-gradient(135deg,#31323a,#17181c 60%,#202127)",side:"linear-gradient(180deg,#3b3c44,#1e1f24)",top:"linear-gradient(90deg,#8e919a,#d9dbe0 38%,#a3a6ae 70%,#767981)",back:"#141417"})+
  box(262,0,298,90,340,56,{front:"linear-gradient(135deg,#34353d,#1a1b1f)",side:"linear-gradient(180deg,#2b2c32,#15161a)",top:"#2a2b31",back:"#141417"})+
  box(246,-221,0,150,72,170,{front:"linear-gradient(180deg,#4a4c54,#23242a)",side:"linear-gradient(180deg,#585a62,#2a2b31)",top:"linear-gradient(90deg,#9a9da5,#d5d7dc 40%,#8a8d95)",back:"#1a1b1f"})+
  box(300,-193,196,28,16,28,{front:"#b8bac1",side:"linear-gradient(180deg,#e6e7ea,#8d9098)",top:"radial-gradient(circle,#f1f2f4,#9a9da5)",back:"#6e7077"})+
  box(206,-193,-150,60,16,60,{front:"#1c1d21",side:"linear-gradient(180deg,#3d3e45,#1d1e22)",top:"repeating-conic-gradient(#8e919a 0 6deg,#2a2b31 6deg 12deg)",back:"#1c1d21"});

var PARTS=[
  {k:"fg",html:P_FG,spin:-9},{k:"ir",html:P_IR,spin:7},{k:"fr",html:P_FR,spin:-8,roll:200},{k:"br",html:P_BR,spin:6},{k:"mt",html:P_MT,spin:-5}
];
rot.innerHTML=PARTS.map(function(p){return '<div class="pt" data-k="'+p.k+'">'+p.html+'</div>';}).join("");
PARTS.forEach(function(p){p.el=rot.querySelector('.pt[data-k="'+p.k+'"]');p.el.style.visibility="hidden";});
var video=rot.querySelector(".wv"),winEl=rot.querySelector(".d.win"),blk=rot.querySelector(".blk"),blades=[].slice.call(rot.querySelectorAll(".ir-b"));
var irsW=rot.querySelector(".irw");

/* ---------- video: one element, one source, segment per piece ---------- */
var vOK=false,vWant=false,vTried=false,seg=0,vPlaying=false;
function vInit(){
  if(vTried)return;vTried=true;
  video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute("playsinline","");video.setAttribute("muted","");video.loop=false;
  var fb=false;
  video.addEventListener("error",function(){if(small&&!fb){fb=true;video.src=VIDEO;video.load();}else vOK=false;});
  video.addEventListener("loadedmetadata",function(){vOK=true;try{video.currentTime=reduce?0:SEG[seg][0];}catch(e){}vSync();});
  video.addEventListener("timeupdate",function(){
    if(reduce){return;}
    if(video.currentTime>=SEG[seg][1]){try{video.currentTime=SEG[seg][0];}catch(e){}}
  });
  video.addEventListener("ended",function(){try{video.currentTime=reduce?0:SEG[seg][0];}catch(e){}vSync();});
  video.preload="metadata";
  video.src=small?VIDEO_M:VIDEO;
}
function vSync(){
  if(!vOK)return;
  var want=vWant&&!document.hidden&&!(window.YR&&window.YR.modalOpen);
  if(want&&video.paused){var pr=video.play();if(pr&&pr.catch)pr.catch(function(){});}
  else if(!want&&!video.paused)video.pause();
}
function setSeg(i){
  if(i===seg)return;seg=i;
  if(vOK&&!reduce){try{video.currentTime=SEG[i][0];}catch(e){}}
}
function curWork(){
  var i=seg;
  if(reduce&&vOK){var t=video.currentTime;i=0;for(var k=0;k<SEG.length;k++){if(t>=SEG[k][0]-.3)i=k;}}
  var V=(window.YR&&window.YR.V)||[];
  for(var j=0;j<V.length;j++){if(V[j][0]===WORK[i])return V[j];}
  return V[0];
}
if("IntersectionObserver" in window){
  new IntersectionObserver(function(es){var on=es[0].isIntersecting;if(on)vInit();vWant=on;vSync();},{rootMargin:"60% 0px 60% 0px"}).observe(chap);
}else{vInit();vWant=true;}
document.addEventListener("visibilitychange",vSync);addEventListener("yr-modal",vSync);

/* ---------- layout / scale ---------- */
var sc=1,drop=900,UNIT=1,vw=innerWidth,vh=innerHeight,cx0=0,cy0=0;
function measure(){
  vw=cs.clientWidth;vh=cs.clientHeight;
  var r=ob.getBoundingClientRect(),cr=cs.getBoundingClientRect();
  sc=Math.min(r.width/(small?1010:900),r.height/500);if(!(sc>0))sc=.5;
  oz.style.transform="scale("+sc.toFixed(4)+")";
  cx0=r.left-cr.left+r.width/2;cy0=r.top-cr.top+r.height/2;
  drop=(cy0/sc)+340;
  var scrollable=chap.offsetHeight-vh;
  UNIT=Math.max(1,scrollable/TOTAL);
}
var TOTAL=5.7;

/* ---------- frame ---------- */
var raf=0,lastKey="",U0=-1,active=-1;
function update(){
  raf=0;
  var r=chap.getBoundingClientRect();
  var U=reduce?4.5:clamp(-r.top/UNIT,0,TOTAL);
  var inChap=r.top<=0&&r.bottom>=innerHeight*.4;
  root.classList.toggle("in-chap",inChap);
  var i=Math.min(4,Math.floor(U)),f=U-i;
  var col=COL[i];
  var key=i+"|";
  if(key!==lastKey){
    lastKey=key;cs.style.background=col.bg;
    var nx=i<4?COL[i+1].bg:DARK;
    cs.style.setProperty("--nc",nx);
    for(var d=0;d<dots.length;d++)dots[d].className=d===i?"on":(d<i?"p":"");
    pgn.textContent="0"+(i+1);
  }
  /* slats: next colour rises (bottom first) in the last part of each unit */
  var g=i<4?clamp((f-.78)/.22,0,1):0;
  if(reduce)g=0;
  for(var s=0;s<slats.length;s++){
    var st=(slats.length-1-s)*.07,pr=eIO(clamp((g-st)/.58,0,1));
    slats[s].style.transform="scaleY("+pr.toFixed(3)+")";
  }
  slats[0].parentNode.style.visibility=g>0?"visible":"hidden";
  /* text */
  for(var p=0;p<panels.length;p++){
    var el=panels[p],o=0,y=0;
    if(p===i||(p===i+1&&false)){
      var inn=reduce?1:ss(.02,.22,f),outv;
      if(i<4)outv=1-ss(.66,.86,f);else outv=1-ss(.5,.62,f);
      if(reduce)outv=1;
      o=Math.min(inn,outv);
      y=(1-inn)*26-(1-outv)*16;
    }
    el.style.opacity=o.toFixed(3);
    el.style.transform="translate3d(0,"+y.toFixed(1)+"px,0)";
    el.style.visibility=o<=0.01?"hidden":"visible";
    el.style.pointerEvents=o>.6?"auto":"none";
    if(p===i){el.parentNode.style.setProperty("--pi",(g>.5&&i<4?COL[i+1].ink:col.ink));}
  }
  /* parts: drop in */
  for(var j=0;j<PARTS.length;j++){
    var pt=PARTS[j],q=reduce?1:clamp((U-j-.08)/.44,0,1),el2=pt.el;
    if(q<=0.001){el2.style.visibility="hidden";continue;}
    el2.style.visibility="visible";
    var qe=q>=1?1:eBack(q);
    var yy=-(1-qe)*drop,rz=(1-q)*pt.spin;
    var rl=pt.roll?(1-q)*pt.roll+Math.max(0,U-j-.5)*0:0;
    el2.style.transform="rotateZ("+rz.toFixed(2)+"deg) translate3d(0,"+yy.toFixed(1)+"px,0) rotateX("+rl.toFixed(1)+"deg)";
  }
  /* iris blink + clip swap */
  var near=Math.round(U),tri=0;
  if(near>=1&&near<=4)tri=Math.max(0,1-Math.abs(U-near)/.2);
  var land=Math.max(0,1-Math.abs(U-1.64)/.12);
  var irisIn=PARTS[1].el.style.visibility==="visible"&&U>1.45;
  var b=reduce?0:Math.max(tri,irisIn?land:0);
  var h=128-(128-3)*eIO(b);
  for(var k2=0;k2<blades.length;k2++){blades[k2].setAttribute("transform","rotate("+(k2*360/7).toFixed(2)+") translate("+(h-128).toFixed(1)+" 0)");}
  irsW.style.transform="rotate("+((U*50)%360).toFixed(1)+"deg)";
  blk.style.opacity=(reduce?0:(irisIn?b*.35:Math.max(tri,0))).toFixed(3);
  if(!reduce)setSeg(clamp(Math.floor(U+.0001),0,4));
  /* orientation */
  var yaw=reduce?24:31-U*2.6,tilt=reduce?-11:-11+Math.sin(U*1.1)*3;
  rot.style.transform="rotateX("+tilt.toFixed(2)+"deg) rotateY("+yaw.toFixed(2)+"deg)";
  /* dive: the glass opens to full screen and flows into #work */
  var dp=reduce?0:ss(4.62,5.3,U);
  if(dp>0){
    var wr=winEl.getBoundingClientRect(),cr=cs.getBoundingClientRect();
    var cxw=wr.left-cr.left+wr.width/2,cyw=wr.top-cr.top+wr.height/2;
    var B=Math.hypot(vw,vh)+40,s0=Math.max(.02,(wr.height*.98)/B);
    var e=eIO(dp);
    var x=cxw+(vw/2-cxw)*e,y2=cyw+(vh/2-cyw)*e,sv=s0+(1-s0)*e;
    dv.style.width=dv.style.height=B+"px";dv.style.margin=(-B/2)+"px 0 0 "+(-B/2)+"px";
    dv.style.transform="translate3d("+x.toFixed(1)+"px,"+y2.toFixed(1)+"px,0) scale("+sv.toFixed(4)+")";
    dv.style.opacity=clamp(dp*14,0,1).toFixed(3);dv.style.visibility="visible";
    placeVideo(true);
  }else{dv.style.visibility="hidden";placeVideo(false);}
  dk.style.opacity=reduce?"0":ss(5.25,5.7,U).toFixed(3);
  cs.style.setProperty("--pgo",(1-ss(4.55,4.75,U)).toFixed(2));
  ob.style.pointerEvents=(U>.6&&U<4.6)?"auto":"none";
  cs.classList.toggle("click",U>.6&&U<4.6);
}
var inDv=false;
/* the same <video> is re-parented into the dive disc so only one element ever plays */
function placeVideo(toDive){
  if(toDive===inDv)return;inDv=toDive;
  if(toDive){dv.appendChild(video);video.classList.add("big");}
  else{winEl.insertBefore(video,winEl.firstChild);video.classList.remove("big");}
  if(vOK&&!video.paused===false){vSync();}
  else vSync();
}
function kick(){if(!raf)raf=requestAnimationFrame(update);}
measure();update();
addEventListener("scroll",kick,{passive:true});
addEventListener("resize",function(){measure();kick();},{passive:true});
if(window.ResizeObserver)new ResizeObserver(function(){measure();kick();}).observe(cs);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();kick();});
addEventListener("load",function(){measure();kick();});

/* click the lens = open the current piece (same modal as the work cards) */
ob.addEventListener("click",function(e){
  if(!e.target.closest||!e.target.closest(".pt"))return;
  var v=curWork();if(v&&window.YR&&window.YR.open)window.YR.open(v[0],v[2],v[3],v[4]);
});
})();

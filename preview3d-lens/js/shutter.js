/* Shutter run: the hero's iris, upgraded, stays pinned while five colour bands scroll past.
   Each section opens the aperture one step wider, so the studio reel inside it grows section by section.
   Between sections the blades snap shut and reopen; the clip changes while they are closed.
   At the end the iris opens until it fills the screen and flows into the doors section.
   Vanilla JS + SVG/CSS, one rAF per scroll, transform/opacity only. Decorative: the chapter is aria-hidden. */
(function(){
"use strict";
var root=document.documentElement;
var chap=document.getElementById("chap");if(!chap)return;
var cs=chap.querySelector(".cs"),ob=document.getElementById("ob"),iris=document.getElementById("iris"),itilt=document.getElementById("itilt"),ibl=document.getElementById("ibl"),dk=document.getElementById("dk"),pgn=document.getElementById("pgn");
var video=chap.querySelector(".wv"),glassB=chap.querySelector(".iglass b");
var panels=[].slice.call(chap.querySelectorAll(".cp")),slats=[].slice.call(chap.querySelectorAll(".cslats i")),dots=[].slice.call(chap.querySelectorAll(".cpg u"));
var reduce=root.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var small=Math.min(screen.width||9999,innerWidth)<=760;
var NS="http://www.w3.org/2000/svg";
var COL=[{bg:"#EFE7D6",ink:"#1B1A17"},{bg:"#111113",ink:"#F3EEE4"},{bg:"#EE8B76",ink:"#1E1210"},{bg:"#9DB095",ink:"#12190F"},{bg:"#F5F3EE",ink:"#141414"}];
var DARK="#0B0B0D";
var HS=[76,94,110,124,134],HMIN=3,HFULL=140,BW=.16,TOTAL=6;
var VIDEO="media/hero.mp4",VIDEO_M="media/hero_m.mp4";
/* reel segments [start,end] and the existing work each one stands for (id from data.js); used only for click-to-open */
var SEG=[[4.3,7.0],[8.3,11.6],[12.3,14.0],[14.6,16.7],[.3,3.8]];
var WORK=["ET5HAefyeU8","4CLaS99kBs0","wAwgIWlP6T0","f4Lieu1fhyo","tprAaZzA1Sw"];

function clamp(v,a,b){return v<a?a:v>b?b:v;}
function ss(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
function eIO(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}

/* ---------- blades: heptagon aperture, same language as the hero shutter ---------- */
var BLN=7,blades=[];
(function build(){
  var d='<defs><clipPath id="ic"><circle r="146"/></clipPath>'+
   '<linearGradient id="ibg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="150" y2="0"><stop offset="0" stop-color="#e6e8ee"/><stop offset=".04" stop-color="#a8abb4"/><stop offset=".14" stop-color="#5b5d65"/><stop offset=".45" stop-color="#2d2e33"/><stop offset="1" stop-color="#17171a"/></linearGradient>'+
   '<linearGradient id="ish" gradientUnits="userSpaceOnUse" x1="0" y1="-70" x2="120" y2="330"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".3" stop-color="#fff" stop-opacity=".02"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>'+
   '<pattern id="ibr" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><rect width=".7" height="2.6" fill="#fff" fill-opacity=".075"/></pattern></defs><g clip-path="url(#ic)"><g id="ibg2">';
  var P="M0 -70L0 330L330 330L330 -70Z";
  for(var i=0;i<BLN;i++){
    d+='<g class="ib" transform="rotate('+(i*360/BLN).toFixed(2)+') translate(60 0)">'+
      '<path d="'+P+'" fill="none" stroke="#000" stroke-opacity=".10" stroke-width="26" stroke-linejoin="round"/>'+
      '<path d="'+P+'" fill="none" stroke="#000" stroke-opacity=".16" stroke-width="12" stroke-linejoin="round"/>'+
      '<path d="'+P+'" fill="url(#ibg)"/><path d="'+P+'" fill="url(#ibr)"/><path d="'+P+'" fill="url(#ish)"/>'+
      '<path d="M0 -70L0 330" stroke="#fff" stroke-opacity=".6" stroke-width="1.1" fill="none"/>'+
      '<path d="M2.4 -70L2.4 330" stroke="#000" stroke-opacity=".35" stroke-width="1" fill="none"/></g>';
  }
  d+='</g></g>';
  ibl.innerHTML=d;
  blades=[].slice.call(ibl.querySelectorAll(".ib"));
})();
var grp=document.getElementById("ibg2"),lastH=-1;
function setAperture(h){
  if(Math.abs(h-lastH)<.05)return;lastH=h;
  for(var i=0;i<BLN;i++)blades[i].setAttribute("transform","rotate("+(i*360/BLN).toFixed(2)+") translate("+h.toFixed(2)+" 0)");
  grp.setAttribute("transform","rotate("+((140-h)*.1).toFixed(2)+")");
}

/* ---------- video: one element, one source, a segment per section ---------- */
var vOK=false,vWant=false,vTried=false,seg=0;
function vInit(){
  if(vTried)return;vTried=true;
  video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute("playsinline","");video.setAttribute("muted","");video.loop=false;
  var fb=false;
  video.addEventListener("error",function(){if(small&&!fb){fb=true;video.src=VIDEO;video.load();}else vOK=false;});
  video.addEventListener("loadedmetadata",function(){vOK=true;try{video.currentTime=reduce?0:SEG[seg][0];}catch(e){}vSync();});
  video.addEventListener("timeupdate",function(){if(!reduce&&video.currentTime>=SEG[seg][1]){try{video.currentTime=SEG[seg][0];}catch(e){}}});
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
function setSeg(i){if(i===seg)return;seg=i;if(vOK&&!reduce){try{video.currentTime=SEG[i][0];}catch(e){}}}
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

/* ---------- layout ---------- */
var vw=innerWidth,vh=innerHeight,UNIT=1,D=560,ccx=0,ccy=0,smax=3;
function measure(){
  vw=cs.clientWidth;vh=cs.clientHeight;
  var r=ob.getBoundingClientRect(),cr=cs.getBoundingClientRect();
  D=Math.max(200,Math.min(r.width*.97,r.height));
  iris.style.setProperty("--D",D.toFixed(0)+"px");
  ccx=r.left-cr.left+r.width/2;ccy=r.top-cr.top+r.height/2;
  var apo=(HFULL/320)*D;
  smax=(Math.hypot(vw,vh)/2*1.05)/apo;
  UNIT=Math.max(1,(chap.offsetHeight-vh)/TOTAL);
}

/* ---------- frame ---------- */
var raf=0,lastKey="";
function aperture(U){
  if(U>=5)return HS[4]+(HFULL-HS[4])*ss(5,5.8,U);
  var i=Math.floor(U),f=U-i,h=HS[i],c=0;
  if(f<BW)c=1-f/BW;else if(i<4&&f>1-BW)c=(f-(1-BW))/BW;
  if(c>0){var e=eIO(c);h=h*(1-e)+HMIN*e;}
  return h;
}
function update(){
  raf=0;
  var r=chap.getBoundingClientRect();
  var U=reduce?4.5:clamp(-r.top/UNIT,0,TOTAL);
  root.classList.toggle("in-chap",r.top<=0&&r.bottom>=innerHeight*.4);
  var i=Math.min(4,Math.floor(U)),f=U-i,col=COL[i];
  if(lastKey!==String(i)){
    lastKey=String(i);cs.style.background=col.bg;
    cs.style.setProperty("--nc",i<4?COL[i+1].bg:DARK);
    for(var d=0;d<dots.length;d++)dots[d].className=d===i?"on":(d<i?"p":"");
    pgn.textContent="0"+(i+1);
  }
  /* colour band: the next colour rises, bottom strip first, while the blades close */
  var g=(i<4&&!reduce)?clamp((f-.78)/.22,0,1):0;
  for(var s=0;s<slats.length;s++){
    var st=(slats.length-1-s)*.07,pr=eIO(clamp((g-st)/.58,0,1));
    slats[s].style.transform="scaleY("+pr.toFixed(3)+")";
  }
  slats[0].parentNode.style.visibility=g>0?"visible":"hidden";
  /* text */
  for(var p=0;p<panels.length;p++){
    var el=panels[p],o=0,y=0;
    if(p===i){
      var inn=reduce?1:ss(.1,.3,f),outv=reduce?1:(i<4?1-ss(.66,.84,f):1-ss(.5,.7,f));
      o=Math.min(inn,outv);y=(1-inn)*26-(1-outv)*16;
      el.parentNode.style.setProperty("--pi",(g>.5?COL[i+1].ink:col.ink));
    }
    el.style.opacity=o.toFixed(3);
    el.style.transform="translate3d(0,"+y.toFixed(1)+"px,0)";
    el.style.visibility=o<=.01?"hidden":"visible";
    el.style.pointerEvents=o>.6?"auto":"none";
  }
  /* iris */
  var h=reduce?HS[4]:aperture(U);
  setAperture(h);
  if(!reduce)setSeg(clamp(Math.floor(U+.0001),0,4));
  var dp=reduce?0:ss(5,5.8,U);
  var e2=eIO(dp),sc=1+(smax-1)*e2,dx=(vw/2-ccx)*e2,dy=(vh/2-ccy)*e2;
  iris.style.transform="translate3d("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px,0) scale("+sc.toFixed(4)+")";
  var ry=reduce?-5:Math.sin(U*1.3)*6,rx=reduce?3:-Math.cos(U*.9)*3.5;
  itilt.style.transform="perspective(1500px) rotateY("+ry.toFixed(2)+"deg) rotateX("+rx.toFixed(2)+"deg)";
  glassB.style.setProperty("--sx",(U*46-70).toFixed(1)+"px");
  dk.style.opacity=reduce?"0":ss(5.72,6,U).toFixed(3);
  cs.style.setProperty("--pgo",(1-ss(4.75,4.95,U)).toFixed(2));
  var act=U>.25&&U<4.9;
  ob.style.pointerEvents=act?"auto":"none";
  cs.classList.toggle("click",act);
}
function kick(){if(!raf)raf=requestAnimationFrame(update);}
measure();update();
addEventListener("scroll",kick,{passive:true});
addEventListener("resize",function(){measure();kick();},{passive:true});
if(window.ResizeObserver)new ResizeObserver(function(){measure();kick();}).observe(cs);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();kick();});
addEventListener("load",function(){measure();kick();});

/* click the iris = open the current piece (same modal as the work cards) */
ob.addEventListener("click",function(){
  var v=curWork();if(v&&window.YR&&window.YR.open)window.YR.open(v[0],v[2],v[3],v[4]);
});
})();

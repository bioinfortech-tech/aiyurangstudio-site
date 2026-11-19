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
var panels=[].slice.call(chap.querySelectorAll(".cp")),dots=[].slice.call(chap.querySelectorAll(".cpg u"));
var reduce=root.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var small=Math.min(screen.width||9999,innerWidth)<=760;
var NS="http://www.w3.org/2000/svg";
var COL=[{bg:"#EFE7D6",ink:"#1B1A17"},{bg:"#111113",ink:"#F3EEE4"},{bg:"#EE8B76",ink:"#1E1210"},{bg:"#9DB095",ink:"#12190F"},{bg:"#F5F3EE",ink:"#141414"}];
var DARK="#0B0B0D";
var BGL=COL.map(function(c){return toLch(c.bg);}),INKL=COL.map(function(c){return toLch(c.ink);}),DARKL=toLch("#0B0B0D");
var HS=[84,102,118,130,138],HMIN=3,HFULL=140,BW=.16,TOTAL=6;
var FLAGS={irisBlink:false};if(window.YR_FLAGS){for(var fk in window.YR_FLAGS)FLAGS[fk]=window.YR_FLAGS[fk];}
var VIDEO=(window.YR_ROOT||"")+"media/promo.mp4",VIDEO_M=(window.YR_ROOT||"")+"media/promo_m.mp4",POSTER=(window.YR_ROOT||"")+"media/promo_poster.jpg",VSTART=3.4; /* studio promo film, one continuous muted loop */

function clamp(v,a,b){return v<a?a:v>b?b:v;}
function ss(a,b,v){var t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);}
function eIO(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}

/* ---------- perceptual colour (OKLCH) ---------- */
function s2l(c){c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4);}
function l2s(c){c=c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055;return c;}
function hexRgb(h){h=h.replace("#","");return [parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
function toLch(hex){
  var c=hexRgb(hex),r=s2l(c[0]),g=s2l(c[1]),b=s2l(c[2]);
  var l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),q=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  var L=.2104542553*l+.793617785*m-.0040720468*q,A=1.9779984951*l-2.428592205*m+.4505937099*q,B=.0259040371*l+.7827717662*m-.808675766*q;
  return [L,Math.hypot(A,B),Math.atan2(B,A)];
}
function lchRgb(L,C,H){
  for(var it=0;it<10;it++){
    var A=C*Math.cos(H),B=C*Math.sin(H),l=L+.3963377774*A+.2158037573*B,m=L-.1055613458*A-.0638541728*B,q=L-.0894841775*A-1.291485548*B;
    l=l*l*l;m=m*m*m;q=q*q*q;
    var r=4.0767416621*l-3.3077115913*m+.2309699292*q,g=-1.2684380046*l+2.6097574011*m-.3413193965*q,b=-.0041960863*l-.7034186147*m+1.707614701*q;
    if(r>=-.001&&r<=1.001&&g>=-.001&&g<=1.001&&b>=-.001&&b<=1.001||C<.001){
      return [Math.round(clamp(l2s(clamp(r,0,1)),0,1)*255),Math.round(clamp(l2s(clamp(g,0,1)),0,1)*255),Math.round(clamp(l2s(clamp(b,0,1)),0,1)*255)];
    }
    C*=.88;
  }
  return [128,128,128];
}
function mixLch(a,b,t){
  var L=a[0]+(b[0]-a[0])*t,C=a[1]+(b[1]-a[1])*t,h1=a[2],h2=b[2];
  if(a[1]<.02)h1=h2;else if(b[1]<.02)h2=h1;
  var d=h2-h1;if(d>Math.PI)d-=2*Math.PI;if(d<-Math.PI)d+=2*Math.PI;
  return [L,C,h1+d*t];
}
function css(rgb,a){return a===undefined?"rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")":"rgba("+rgb[0]+","+rgb[1]+","+rgb[2]+","+a+")";}
function sm5(t){t=clamp(t,0,1);return t*t*t*(t*(t*6-15)+10);}

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
  video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute("playsinline","");video.setAttribute("muted","");video.loop=false;video.poster=POSTER;
  var fb=false;
  video.addEventListener("error",function(){if(small&&!fb){fb=true;video.src=VIDEO;video.load();}else vOK=false;});
  video.addEventListener("loadedmetadata",function(){vOK=true;try{video.currentTime=VSTART;}catch(e){}vSync();});
  /* the film opens with a small typing animation; the loop skips it so the iris never shows a text box */
  video.addEventListener("ended",function(){try{video.currentTime=VSTART;}catch(e){}vSync();var pr=video.play();if(pr&&pr.catch)pr.catch(function(){});});
  video.preload="metadata";
  video.src=small?VIDEO_M:VIDEO;
}
function vSync(){
  if(!vOK)return;
  var want=vWant&&!document.hidden&&!(window.YR&&window.YR.modalOpen);
  if(want&&video.paused){var pr=video.play();if(pr&&pr.catch)pr.catch(function(){});}
  else if(!want&&!video.paused)video.pause();
}
function setSeg(){}
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
  if(FLAGS.irisBlink&&c>0){var e=eIO(c);h=h*(1-e)+HMIN*e;}else if(!FLAGS.irisBlink){h=HS[i]+(HS[Math.min(4,i+1)]-HS[i])*ss(0,1,f);}
  return h;
}
function update(){
  raf=0;
  var r=chap.getBoundingClientRect();
  var U=reduce?4.5:clamp(-r.top/UNIT,0,TOTAL);
  root.classList.toggle("in-chap",r.top<=0&&r.bottom>=innerHeight*.4);
  var i=Math.min(4,Math.floor(U)),f=U-i;
  if(lastKey!==String(i)){
    lastKey=String(i);
    for(var d=0;d<dots.length;d++)dots[d].className=d===i?"on":(d<i?"p":"");
    pgn.textContent="0"+(i+1);
  }
  /* background + ink: continuous OKLCH blend, no hard edges */
  var e=0,a=BGL[i],b=BGL[Math.min(4,i+1)],ia=INKL[i],ib=INKL[Math.min(4,i+1)];
  if(i<4)e=sm5((f-.55)/.45);
  else if(U>=5){b=DARKL;ib=INKL[4];e=sm5((U-5)/.7);}
  if(reduce)e=0;
  var bl=mixLch(a,b,e),il=mixLch(ia,ib,e);
  var tl=ss(.5,.66,bl[0]);il[0]=.94*(1-tl)+.2*tl;
  var bg=lchRgb(bl[0],bl[1],bl[2]),ink=lchRgb(il[0],il[1],il[2]);
  var gl=lchRgb(Math.min(.985,bl[0]+(bl[0]>.5?.045:.07)),bl[1]*1.08,bl[2]);
  cs.style.backgroundColor=css(bg);
  cs.style.backgroundImage="radial-gradient(ellipse 58% 78% at "+ccx.toFixed(0)+"px "+ccy.toFixed(0)+"px,"+css(gl,.9)+","+css(gl,0)+" 72%)";
  cs.style.setProperty("--ink",css(ink));cs.style.setProperty("--bg",css(bg));cs.style.setProperty("--pi",css(ink));
  /* text: fades out before the colour moves, fades in after it settled */
  for(var p=0;p<panels.length;p++){
    var el=panels[p],o=0,y=0;
    if(p===i){
      var inn=reduce?1:ss(.06,.22,f),outv=reduce?1:(i<4?1-ss(.7,.86,f):1-ss(.5,.7,f));
      o=Math.min(inn,outv);y=(1-inn)*26-(1-outv)*16;
    }
    el.style.opacity=o.toFixed(3);
    el.style.transform="translate3d(0,"+y.toFixed(1)+"px,0)";
    el.style.visibility=o<=.01?"hidden":"visible";
    el.style.pointerEvents=o>.6?"auto":"none";
    if(el.classList.contains("pfl"))el.classList.toggle("go",o>.55);
  }
  /* iris: WebGL when available, SVG otherwise */
  if(window.YR_I3&&window.YR_I3.ready){
    window.YR_I3.frame({U:U,ccx:ccx,ccy:ccy,D:D,W:vw,H:vh});
  }else{
    setAperture(reduce?HS[4]:aperture(U));
    if(!reduce)setSeg(clamp(Math.floor(U+.0001),0,4));
    var dp=reduce?0:ss(5,5.8,U);
    var e2=eIO(dp),sc=1+(smax-1)*e2,dx=(vw/2-ccx)*e2,dy=(vh/2-ccy)*e2;
    iris.style.transform="translate3d("+dx.toFixed(1)+"px,"+dy.toFixed(1)+"px,0) scale("+sc.toFixed(4)+")";
    var ry=reduce?-5:Math.sin(U*1.3)*6,rx=reduce?3:-Math.cos(U*.9)*3.5;
    itilt.style.transform="perspective(1500px) rotateY("+ry.toFixed(2)+"deg) rotateX("+rx.toFixed(2)+"deg)";
    glassB.style.setProperty("--sx",(U*46-70).toFixed(1)+"px");
  }
  dk.style.opacity=reduce?"0":ss(5.72,6,U).toFixed(3);
  cs.style.setProperty("--pgo",(1-ss(4.75,4.95,U)).toFixed(2));
  var act=U>.25&&U<4.9;
  ob.style.pointerEvents=act?"auto":"none";
  
}
function kick(){if(!raf)raf=requestAnimationFrame(update);}
window.YR_SH={setSeg:function(i){setSeg(i);},refresh:function(){measure();kick();}};
measure();update();
addEventListener("scroll",kick,{passive:true});
addEventListener("resize",function(){measure();kick();},{passive:true});
if(window.ResizeObserver)new ResizeObserver(function(){measure();kick();}).observe(cs);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();kick();});
addEventListener("load",function(){measure();kick();});

})();

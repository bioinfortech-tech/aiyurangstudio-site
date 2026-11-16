/* detail pages: nav, reveal, work grid + filter + modal, tools extras */
(function(){
"use strict";
var root=document.documentElement,rm=root.classList.contains("rm");
function $(id){return document.getElementById(id);}
function pad(n){return (n<10?"0":"")+n;}
/* nav */
var burger=$("burger"),mnav=$("mnav");
function setMenu(o){mnav.classList.toggle("open",o);burger.setAttribute("aria-expanded",o);burger.setAttribute("aria-label",o?"메뉴 닫기":"메뉴 열기");document.body.style.overflow=o?"hidden":"";}
burger.addEventListener("click",function(){setMenu(!mnav.classList.contains("open"));});
mnav.addEventListener("click",function(e){if(e.target.closest("a"))setMenu(false);});
/* work */
var pg=$("pg");
if(pg&&window.YR_V){
  var V=window.YR_V,CATS=[["all","전체"],["brand","광고 · 브랜드"],["product","제품"],["vh","버추얼 휴먼"],["short","숏폼"]];
  var m=$("modal"),host=$("mhost"),lastFocus=null;
  var openM=function(id,cat,t,d){lastFocus=document.activeElement;
    host.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1" title="'+t+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    $("mcat").textContent=cat;$("mt").textContent=t;$("md").textContent=d;
    m.classList.add("open");document.body.style.overflow="hidden";$("mclose").focus();};
  var closeM=function(){m.classList.remove("open");host.innerHTML="";document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();};
  $("mclose").addEventListener("click",closeM);
  m.addEventListener("click",function(e){if(e.target===m)closeM();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape"&&m.classList.contains("open"))closeM();});
  var items=V.map(function(v,i){
    var b=document.createElement("button");b.type="button";b.className="pi";b.setAttribute("aria-label",v[3]+" 재생");
    var src="https://img.youtube.com/vi/"+v[0]+"/maxresdefault.jpg";
    b.innerHTML='<span class="pi-img"><img loading="lazy" decoding="async" alt="" src="'+src+'"><span class="pi-play"></span></span><span class="pi-meta"><span class="n">'+pad(i+1)+'</span><b>'+v[3]+'</b><em>'+v[2]+'</em></span>';
    var img=b.querySelector("img");
    function fb(){if(!img.dataset.fb){img.dataset.fb=1;img.src="https://img.youtube.com/vi/"+v[0]+"/hqdefault.jpg";}}
    img.addEventListener("load",function(){if(img.naturalWidth<=120)fb();});img.addEventListener("error",fb);
    b.addEventListener("click",function(){openM(v[0],v[2],v[3],v[4]);});
    pg.appendChild(b);return b;
  });
  var chips=$("chips");
  CATS.forEach(function(c){
    var n=c[0]==="all"?V.length:V.filter(function(v){return v[5]===c[0];}).length;
    if(!n)return; /* hide chips with no works */
    var b=document.createElement("button");b.type="button";b.className="chip";b.textContent=c[1];b.dataset.c=c[0];
    b.setAttribute("aria-pressed",c[0]==="all");chips.appendChild(b);
  });
  chips.addEventListener("click",function(e){
    var b=e.target.closest(".chip");if(!b)return;var c=b.dataset.c;
    [].forEach.call(chips.children,function(x){x.setAttribute("aria-pressed",x===b);});
    items.forEach(function(it,i){it.hidden=!(c==="all"||V[i][5]===c);});
  });
}
/* tools: waveform + review pin */
var wv=$("wv"),NS="http://www.w3.org/2000/svg";
if(wv){for(var i=0;i<54;i++){var r=document.createElementNS(NS,"rect"),h=6+Math.abs(Math.sin(i*.9)*Math.cos(i*.31))*20;r.setAttribute("x",40+i*7.7);r.setAttribute("width",3);r.setAttribute("y",244-h/2);r.setAttribute("height",h);r.style.animationDelay=(i%9)*.15+"s";wv.appendChild(r);}}
var fr=$("rvFrame"),svg=$("rvSvg"),pin=$("rvPin"),head=$("rvHead"),tc=$("rvTc"),tx=$("rvTxt"),notes=["컷 길이 조정","색감 확인","자막 위치","BGM 볼륨"],ni=0;
if(fr){fr.addEventListener("click",function(e){
  var r=svg.getBoundingClientRect(),k=480/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;
  x=Math.max(34,Math.min(x,336));y=Math.max(34,Math.min(y,170));
  var sec=Math.round(Math.max(0,Math.min(1,(x-24)/432))*17);
  pin.style.transform="translate("+x+"px,"+y+"px)";head.style.transform="translateX("+x+"px)";
  tc.textContent="00:"+pad(sec);tx.textContent=notes[ni++%notes.length];});}
/* reveal */
var all=[].slice.call(document.querySelectorAll(".sh,.chips,.pi,.tool,.tool-cta"));
all.forEach(function(e){e.classList.add("rv");});
if(!("IntersectionObserver" in window)||rm){all.forEach(function(e){e.classList.add("in");});}
else{var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target);}});},{threshold:.08,rootMargin:"0px 0px -5% 0px"});all.forEach(function(e){io.observe(e);});}
})();

/* 유랑스튜디오 v2 — site logic */
(function(){
"use strict";
/* ---- one-line swaps ---- */
var HEADLINES=["상상만 하던 장면,|유랑이 현실로 만듭니다.","세상에 없던 컷을|만듭니다.","유랑이 만들면,|장면이 다릅니다.","AI가 그리고,|우리가 연출합니다.","보는 순간,|기억되는 영상."];
var HEADLINE_INDEX=0;
var SHOWREEL_YT="";   /* YouTube id for the SHOWREEL block, e.g. "abc123XYZ_-" */

var V=window.YR_V||[];
window.YR={modalOpen:false,V:V};
var root=document.documentElement;

/* headline */
var h1=document.getElementById("headline");
if(h1&&HEADLINE_INDEX>0){h1.innerHTML=HEADLINES[HEADLINE_INDEX].split("|").join("<br>");}

/* portfolio */
var pf=document.getElementById("pf");
function pad(n){return (n<10?"0":"")+n;}
var PREVIEW=6;
V.slice(0,PREVIEW).forEach(function(v,i){
  var b=document.createElement("button");b.type="button";b.className="pi rv"+(i<2?" big":"");
  b.setAttribute("aria-label",v[3]+" 재생");
  var src="https://img.youtube.com/vi/"+v[0]+"/maxresdefault.jpg";
  b.innerHTML='<span class="pi-img"><img loading="lazy" decoding="async" alt="" src="'+src+'"><span class="pi-play"></span></span><span class="pi-meta"><span class="n">'+pad(i+1)+'</span><b>'+v[3]+'</b><em>'+v[2]+'</em></span>';
  var img=b.querySelector("img");
  img.addEventListener("load",function(){if(img.naturalWidth<=120&&!img.dataset.fb){img.dataset.fb=1;img.src="https://img.youtube.com/vi/"+v[0]+"/hqdefault.jpg";}});
  img.addEventListener("error",function(){if(!img.dataset.fb){img.dataset.fb=1;img.src="https://img.youtube.com/vi/"+v[0]+"/hqdefault.jpg";}});
  b.addEventListener("click",function(){openM(v[0],v[2],v[3],v[4]);});
  pf.appendChild(b);
});

/* mobile carousel counter */
(function(){
  var c=document.createElement("div");c.className="pf-count";c.setAttribute("aria-hidden","true");
  c.innerHTML='<span class="pc-n"><b id="pcCur">01</b> / '+pad(Math.min(V.length,PREVIEW))+'</span><i class="pc-bar"><u id="pcBar"></u></i><span class="pc-hint">Swipe</span>';
  pf.parentNode.insertBefore(c,pf.nextSibling);
  var cur=document.getElementById("pcCur"),bar=document.getElementById("pcBar");
  function upd(){
    var items=pf.children,max=pf.scrollWidth-pf.clientWidth,idx=0,best=1e9,left=pf.getBoundingClientRect().left;
    for(var i=0;i<items.length;i++){var d=Math.abs(items[i].getBoundingClientRect().left-left-parseFloat(getComputedStyle(pf).paddingLeft||0));if(d<best){best=d;idx=i;}}
    if(max>0&&pf.scrollLeft>=max-4)idx=items.length-1;
    cur.textContent=pad(idx+1);bar.style.transform="scaleX("+((idx+1)/items.length)+")";
  }
  pf.addEventListener("scroll",function(){requestAnimationFrame(upd);},{passive:true});
  addEventListener("resize",upd);upd();
})();

/* modal */
var m=document.getElementById("modal"),host=document.getElementById("mhost"),lastFocus=null;
function openM(id,cat,t,d){
  window.YR.modalOpen=true;window.dispatchEvent(new Event("yr-modal"));lastFocus=document.activeElement;
  host.innerHTML='<iframe src="https://www.youtube.com/embed/'+id+'?autoplay=1&rel=0&playsinline=1" title="'+t+'" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  document.getElementById("mcat").textContent=cat;document.getElementById("mt").textContent=t;document.getElementById("md").textContent=d;
  m.classList.add("open");document.body.style.overflow="hidden";document.getElementById("mclose").focus();
}
function closeM(){
  window.YR.modalOpen=false;window.dispatchEvent(new Event("yr-modal"));
  m.classList.remove("open");host.innerHTML="";document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
document.getElementById("mclose").addEventListener("click",closeM);
m.addEventListener("click",function(e){if(e.target===m)closeM();});
document.addEventListener("keydown",function(e){
  if(!m.classList.contains("open"))return;
  if(e.key==="Escape"){closeM();return;}
  if(e.key!=="Tab")return;
  var cl=document.getElementById("mclose"),f=[cl],fr=host.querySelector("iframe");if(fr)f.push(fr);
  var i=f.indexOf(document.activeElement);
  if(e.shiftKey){if(i<=0){e.preventDefault();f[f.length-1].focus();}}
  else if(i===-1||i===f.length-1){e.preventDefault();f[0].focus();}
});

/* scrollspy: mark the nav link of the section in view */
(function(){
  if(!("IntersectionObserver" in window))return;
  var map={work:"work/",services:"#services",tools:"tools/",process:"#process",contact:"#contact"};
  var links=[].slice.call(document.querySelectorAll(".nav a,.mnav a"));
  function mark(id){links.forEach(function(a){if(map[id]&&a.getAttribute("href")===map[id])a.setAttribute("aria-current","true");else if(a.getAttribute("aria-current")==="true")a.removeAttribute("aria-current");});}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting)mark(en.target.id);});},{rootMargin:"-40% 0px -55% 0px"});
  Object.keys(map).forEach(function(k){var el=document.getElementById(k);if(el)io.observe(el);});
  addEventListener("scroll",function(){if(scrollY<innerHeight*.5)mark("");},{passive:true});
})();

/* showreel placeholder -> YouTube id */
var fr=document.getElementById("srFrame");
if(fr&&SHOWREEL_YT){var _s=document.getElementById("showreel");if(_s)_s.hidden=false;
  fr.setAttribute("data-yt",SHOWREEL_YT);fr.classList.add("live");
  var hostEl=document.getElementById("srHost");
  hostEl.innerHTML='<img alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" src="https://img.youtube.com/vi/'+SHOWREEL_YT+'/maxresdefault.jpg"><button type="button" class="pi" style="position:absolute;inset:0" aria-label="쇼릴 재생"><span class="pi-play" style="opacity:1;transform:none"></span></button>';
  hostEl.querySelector("button").addEventListener("click",function(){openM(SHOWREEL_YT,"Showreel","유랑스튜디오 쇼릴","");});
}

/* form */
var f=document.getElementById("quoteForm"),fb=document.getElementById("formBody");
var SENDHTML='<span>문의 보내기</span><i aria-hidden="true"></i>';
f.addEventListener("submit",function(ev){
  ev.preventDefault();if(!f.checkValidity()){f.reportValidity();return;}
  var b=f.querySelector("button[type=submit]");b.disabled=true;b.innerHTML="<span>전송 중</span>";
  fetch("https://formspree.io/f/mnjyjgkw",{method:"POST",body:new FormData(f),headers:{"Accept":"application/json"}}).then(function(r){
    if(r.ok){fb.innerHTML='<div class="ok"><h3>문의가 접수되었습니다.</h3><p>확인 후 직접 연락드리겠습니다.</p></div>';}
    else{b.disabled=false;b.innerHTML=SENDHTML;alert("전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");}
  }).catch(function(){b.disabled=false;b.innerHTML=SENDHTML;alert("네트워크 오류입니다. 연결을 확인해주세요.");});
});

/* nav */
var hdr=document.getElementById("hdr"),burger=document.getElementById("burger"),mnav=document.getElementById("mnav");
function onS(){hdr.classList.toggle("solid",window.scrollY>40);}
addEventListener("scroll",onS,{passive:true});onS();
function setMenu(o){mnav.classList.toggle("open",o);burger.setAttribute("aria-expanded",o);burger.setAttribute("aria-label",o?"메뉴 닫기":"메뉴 열기");document.body.style.overflow=o?"hidden":"";}
burger.addEventListener("click",function(){setMenu(!mnav.classList.contains("open"));});
mnav.addEventListener("click",function(e){if(e.target.closest("a"))setMenu(false);});
document.addEventListener("click",function(e){
  var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
  var id=a.getAttribute("href").slice(1),el=id==="top"?document.body:document.getElementById(id);
  if(el){e.preventDefault();window.scrollTo({top:id==="top"?0:el.getBoundingClientRect().top+scrollY-(id==="showreel"?40:0),behavior:root.classList.contains("rm")?"auto":"smooth"});}
});

/* sticky mobile CTA */
(function(){
  var b=document.getElementById("stickyCta"),ct=document.getElementById("contact"),ctIn=false;
  function upd(){
    var past=scrollY>innerHeight*.7,off=ctIn||window.YR.modalOpen||mnav.classList.contains("open");
    b.classList.toggle("show",past&&!off);
  }
  if("IntersectionObserver" in window){new IntersectionObserver(function(es){ctIn=es[0].isIntersecting;upd();},{threshold:.15}).observe(ct);}
  addEventListener("scroll",upd,{passive:true});addEventListener("yr-modal",upd);burger.addEventListener("click",function(){setTimeout(upd,0);});mnav.addEventListener("click",function(){setTimeout(upd,0);});upd();
})();


/* in-house tools: tabs, autoplay, review pin */
(function(){
  var tl=document.getElementById("tl");if(!tl)return;
  var tabs=[].slice.call(tl.querySelectorAll("[role=tab]")),panels=tabs.map(function(t){return document.getElementById(t.getAttribute("aria-controls"));});
  var cur=0,timer=0,inView=false,touched=false,DUR=7000,rm=document.documentElement.classList.contains("rm");
  function sel(i,user){
    cur=(i+tabs.length)%tabs.length;
    tabs.forEach(function(t,k){var on=k===cur;t.setAttribute("aria-selected",on);t.tabIndex=on?0:-1;panels[k].hidden=!on;});
    tl.classList.remove("run");void tl.offsetWidth;
    if(user){touched=true;stopT();}else if(inView&&!touched)tl.classList.add("run");
    if(!user)schedule();
  }
  function stopT(){clearTimeout(timer);timer=0;tl.classList.remove("run");}
  function schedule(){clearTimeout(timer);if(rm||touched||!inView)return;tl.style.setProperty("--dur",DUR+"ms");tl.classList.add("run");timer=setTimeout(function(){sel(cur+1,false);},DUR);}
  tabs.forEach(function(t,k){
    t.addEventListener("click",function(){sel(k,true);});
    t.addEventListener("keydown",function(e){var d=e.key==="ArrowDown"||e.key==="ArrowRight"?1:e.key==="ArrowUp"||e.key==="ArrowLeft"?-1:0;if(!d)return;e.preventDefault();sel(cur+d,true);tabs[cur].focus();});
  });
  if("IntersectionObserver" in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting;if(inView)schedule();else{clearTimeout(timer);timer=0;tl.classList.remove("run");}},{threshold:.35}).observe(tl);}
  /* editor waveform */
  var wv=document.getElementById("wv"),NS="http://www.w3.org/2000/svg";
  if(wv){for(var i=0;i<54;i++){var r=document.createElementNS(NS,"rect"),h=6+Math.abs(Math.sin(i*.9)*Math.cos(i*.31))*20;r.setAttribute("x",40+i*7.7);r.setAttribute("width",3);r.setAttribute("y",244-h/2);r.setAttribute("height",h);r.style.animationDelay=(i%9)*.15+"s";wv.appendChild(r);}}
  /* review: click the frame to drop a timecode pin */
  var fr=document.getElementById("rvFrame"),svg=document.getElementById("rvSvg"),pin=document.getElementById("rvPin"),head=document.getElementById("rvHead"),tc=document.getElementById("rvTc"),tx=document.getElementById("rvTxt");
  var notes=["컷 길이 조정","색감 확인","자막 위치","BGM 볼륨"];var ni=0;
  if(fr){fr.addEventListener("click",function(e){
    var r=svg.getBoundingClientRect(),k=480/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k;
    x=Math.max(34,Math.min(x,336));y=Math.max(34,Math.min(y,170));
    var sec=Math.round(Math.max(0,Math.min(1,(x-24)/432))*17);
    pin.style.transform="translate("+x+"px,"+y+"px)";head.style.transform="translateX("+x+"px)";
    tc.textContent="00:"+(sec<10?"0":"")+sec;tx.textContent=notes[ni++%notes.length];
  });}
})();
/* reveal */
var els=[].slice.call(document.querySelectorAll(".sh,.sv li,.st li,.ci,.form,.frame,.tl,.tl-note"));
els.forEach(function(e){e.classList.add("rv");});
var all=[].slice.call(document.querySelectorAll(".rv"));
if(!("IntersectionObserver" in window)||root.classList.contains("rm")){all.forEach(function(e){e.classList.add("in");});}
else{
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var e=en.target;
    var sib=e.parentNode?[].indexOf.call(e.parentNode.children,e):0;e.style.transitionDelay=Math.min(sib%4,3)*90+"ms";
    e.classList.add("in");io.unobserve(e);setTimeout(function(){e.style.transitionDelay="";},1800);});},{threshold:.1,rootMargin:"0px 0px -6% 0px"});
  all.forEach(function(e){io.observe(e);});
}

/* intro */
function ready(){root.classList.add("ready");}
if(document.fonts&&document.fonts.ready){Promise.race([document.fonts.ready,new Promise(function(r){setTimeout(r,900)})]).then(function(){requestAnimationFrame(ready);});}else{ready();}
})();


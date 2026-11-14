/* 유랑스튜디오 v2 — site logic */
(function(){
"use strict";
/* ---- one-line swaps ---- */
var HEADLINES=["상상만 하던 장면,|유랑이 찍습니다.","세상에 없던 컷을|만듭니다.","유랑이 만들면,|장면이 다릅니다.","AI가 그리고,|우리가 연출합니다.","보는 순간,|기억되는 영상."];
var HEADLINE_INDEX=0;
var SHOWREEL_YT="";   /* YouTube id for the SHOWREEL block, e.g. "abc123XYZ_-" */

var V=[["ET5HAefyeU8","ad","AI 광고","햄버거 AI 광고","햄버거 브랜드 AI 광고 영상 · 자체 제작"],["4CLaS99kBs0","ad","AI 광고","청정 맥주 AI 광고","청량함이 다른 맥주 광고 스타일 AI 영상 · 자체"],["h6zmosiLe4o","ad","AI 광고","촉촉함이 다르다","제품의 촉촉함을 담은 AI 광고 · 자체"],["wAwgIWlP6T0","ad","AI 광고","메디힐 AI 광고 공모전 출품작","메디힐 AI 영상 광고 공모전 출품작 · 자체 기획·제작"],["tprAaZzA1Sw","ad","AI 광고","스낵 영상","스낵 영상"],["uVeVCR_NMME","ad","AI 광고","유랑팟 3D 제품","유랑팟 3D제품"],["f4Lieu1fhyo","promo","브랜드","유랑금융주식회사","유랑금융 AI 브랜드 영상 · 자체"],["rI1oPPyVCMo","promo","브랜드","유랑학원 홍보","성적이 쑥쑥 오르는 유랑학원!"],["Pm5SviZVw94","promo","브랜드","유랑X 스마트폰","유랑X 스마트폰"],["XlTJHLi0Xv4","promo","홍보","케어힐 투자 홍보","몸이 불편하신 분들을 위한 차세대 침대"],["jy2FvJQTdak","promo","홍보","승전속기사무소 홍보","유퀴즈 출연 속기사무소 AI 홍보 영상"],["W5rB_ckfgPw","promo","설명 영상","아이오닉5 모터 설명","아이오닉5 모터 설명 · 개인작"],["TgWq4ziPLAY","campaign","캠페인","전세사기 예방 · 우리의 첫 집","전세사기 예방 우리의 첫 집"],["EqEpL450REk","campaign","캠페인","보이스피싱 예방 공익 캠페인","보이스피싱 예방 공익 캠페인"],["q2hmAwE2bco","campaign","캠페인","아이들의 소원은?","아동학대 예방 공익 캠페인 · 자체"],["Cga9_M-Nslc","campaign","캠페인","대한민국 홍보 영상","대한민국을 담은 홍보 영상 · 자체"],["R6FduPmKKxU","campaign","캠페인","분리수거 방법","분리수거 방법"],["SQVc_2Md7wA","promo","오리지널","도트 히어로즈 1편","도트 히어로즈 1편"]];
window.YR={modalOpen:false,V:V};
var root=document.documentElement;
if(/[?&]shot/.test(location.search)){root.classList.add("shotm");var st=document.createElement("style");st.textContent=".hero-outer,.hero{height:"+Math.min(innerHeight,innerWidth<500?844:900)+"px!important}"+(/skip/.test(location.search)?".pi:nth-child(n+99){display:none}":"");document.head.appendChild(st);var ym=location.search.match(/y=(\d+)/);if(ym){addEventListener("load",function(){setTimeout(function(){window.scrollTo(0,+ym[1]);},300);});}}

/* headline */
var h1=document.getElementById("headline");
if(h1&&HEADLINE_INDEX>0){h1.innerHTML=HEADLINES[HEADLINE_INDEX].split("|").join("<br>");}

/* portfolio */
var pf=document.getElementById("pf");
function pad(n){return (n<10?"0":"")+n;}
V.forEach(function(v,i){
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
  c.innerHTML='<span class="pc-n"><b id="pcCur">01</b> / '+pad(V.length)+'</span><i class="pc-bar"><u id="pcBar"></u></i><span class="pc-hint">Swipe</span>';
  pf.parentNode.appendChild(c);
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
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&m.classList.contains("open"))closeM();});

/* showreel placeholder -> YouTube id */
var fr=document.getElementById("srFrame");
if(fr&&SHOWREEL_YT){
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

/* reveal */
var els=[].slice.call(document.querySelectorAll(".sh,.sv li,.st li,.ci,.form,.frame"));
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
if(/dbg/.test(location.search))addEventListener("load",function(){var f=document.getElementById("srFrame").getBoundingClientRect();console.log("DBG iw="+innerWidth+" cw="+document.documentElement.clientWidth+" frame="+f.left+"-"+f.right+" sw="+document.documentElement.scrollWidth);});

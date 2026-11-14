(function(){
var V=[["ET5HAefyeU8", "ad", "AI 광고", "햄버거 AI 광고", "햄버거 브랜드 AI 광고 영상 · 자체 제작"], ["4CLaS99kBs0", "ad", "AI 광고", "청정 맥주 AI 광고", "청량함이 다른 맥주 광고 스타일 AI 영상 · 자체"], ["h6zmosiLe4o", "ad", "AI 광고", "촉촉함이 다르다", "제품의 촉촉함을 담은 AI 광고 · 자체"], ["wAwgIWlP6T0", "ad", "AI 광고", "메디힐 AI 광고 공모전 출품작", "메디힐 AI 영상 광고 공모전 출품작 · 자체 기획·제작"], ["tprAaZzA1Sw", "ad", "AI 광고", "스낵 영상", "스낵 영상"], ["uVeVCR_NMME", "ad", "AI 광고", "유랑팟 3D 제품", "유랑팟 3D제품"], ["f4Lieu1fhyo", "promo", "브랜드", "유랑금융주식회사", "유랑금융 AI 브랜드 영상 · 자체"], ["rI1oPPyVCMo", "promo", "브랜드", "유랑학원 홍보", "성적이 쑥쑥 오르는 유랑학원!"], ["Pm5SviZVw94", "promo", "브랜드", "유랑X 스마트폰", "유랑X 스마트폰"], ["XlTJHLi0Xv4", "promo", "홍보", "케어힐 투자 홍보", "몸이 불편하신 분들을 위한 차세대 침대"], ["jy2FvJQTdak", "promo", "홍보", "승전속기사무소 홍보", "유퀴즈 출연 속기사무소 AI 홍보 영상"], ["W5rB_ckfgPw", "promo", "설명 영상", "아이오닉5 모터 설명", "아이오닉5 모터 설명 · 개인작"], ["TgWq4ziPLAY", "campaign", "캠페인", "전세사기 예방 · 우리의 첫 집", "전세사기 예방 우리의 첫 집"], ["EqEpL450REk", "campaign", "캠페인", "보이스피싱 예방 공익 캠페인", "보이스피싱 예방 공익 캠페인"], ["q2hmAwE2bco", "campaign", "캠페인", "아이들의 소원은?", "아동학대 예방 공익 캠페인 · 자체"], ["Cga9_M-Nslc", "campaign", "캠페인", "대한민국 홍보 영상", "대한민국을 담은 홍보 영상 · 자체"], ["R6FduPmKKxU", "campaign", "캠페인", "분리수거 방법", "분리수거 방법"], ["SQVc_2Md7wA", "promo", "오리지널", "도트 히어로즈 1편", "도트 히어로즈 1편"]];
window.YR={V:V,modalOpen:false,open:function(i){openM(V[i]);}};
function th(id,q){return "https://img.youtube.com/vi/"+id+"/"+(q||"hqdefault")+".jpg";}
var grid=document.getElementById("pfGrid");
V.forEach(function(v,i){
  var a=document.createElement("button");a.type="button";a.className="pf";a.setAttribute("data-cat",v[1]);
  a.innerHTML='<span class="pf-img"><img loading="lazy" alt="" src="'+th(v[0],"hqdefault")+'"><i class="pf-play"></i></span><span class="pf-meta"><em>'+v[2]+'</em><b>'+v[3]+'</b></span>';
  a.className+=" rv";a.addEventListener("click",function(){openM(v);});grid.appendChild(a);
});
document.querySelectorAll(".chip").forEach(function(c){c.addEventListener("click",function(){
  document.querySelectorAll(".chip").forEach(function(x){x.classList.remove("on");});c.classList.add("on");
  var k=c.getAttribute("data-cat");grid.querySelectorAll(".pf").forEach(function(p){p.hidden=!(k==="all"||p.getAttribute("data-cat")===k);});});});
var m=document.getElementById("modal"),host=document.getElementById("mhost");
function openM(v){window.YR.modalOpen=true;window.dispatchEvent(new Event("yr-modal"));host.innerHTML='<iframe src="https://www.youtube.com/embed/'+v[0]+'?autoplay=1&rel=0&playsinline=1" title="'+v[3]+'" frameborder="0" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  document.getElementById("mcat").textContent=v[2];document.getElementById("mt").textContent=v[3];document.getElementById("md").textContent=v[4];
  m.classList.add("open");document.body.style.overflow="hidden";}
function closeM(){window.YR.modalOpen=false;window.dispatchEvent(new Event("yr-modal"));m.classList.remove("open");host.innerHTML="";document.body.style.overflow="";}
document.getElementById("mclose").addEventListener("click",closeM);
m.addEventListener("click",function(e){if(e.target===m)closeM();});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeM();});
var f=document.getElementById("quoteForm"),fb=document.getElementById("formBody");
f.addEventListener("submit",function(ev){ev.preventDefault();if(!f.checkValidity()){f.reportValidity();return;}
  var b=f.querySelector("button[type=submit]");b.disabled=true;b.textContent="전송 중...";
  fetch("https://formspree.io/f/mnjyjgkw",{method:"POST",body:new FormData(f),headers:{"Accept":"application/json"}}).then(function(r){
    if(r.ok){fb.innerHTML='<div class="ok"><h3>문의가 접수되었습니다</h3><p>영업일 기준 1일 이내에 연락드리겠습니다.<br>감사합니다 — YURANGSTUDIO</p></div>';}
    else{b.disabled=false;b.innerHTML='견적 문의 보내기 <span>→</span>';alert("전송 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");}
  }).catch(function(){b.disabled=false;b.innerHTML='견적 문의 보내기 <span>→</span>';alert("네트워크 오류입니다. 인터넷 연결을 확인해주세요.");});});
document.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;var el=document.getElementById(a.getAttribute("href").slice(1));if(el){e.preventDefault();el.scrollIntoView({behavior:"smooth",block:"start"});}});
})();
document.getElementById("burger").addEventListener("click",function(){document.getElementById("mnav").classList.toggle("open");});
document.getElementById("mnav").addEventListener("click",function(){this.classList.remove("open");});

/* reveal + light 3D tilt */
(function(){
var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
var els=[].slice.call(document.querySelectorAll(".sr,.sg>div,.st,.pf,.lead,.lab,section h2,.ci,.form"));
els.forEach(function(e){e.classList.add("rv");});
if(rm||!("IntersectionObserver" in window)){els.forEach(function(e){e.classList.add("in");});return;}
var io=new IntersectionObserver(function(es){es.forEach(function(en){if(!en.isIntersecting)return;var e=en.target,sib=e.parentNode?[].indexOf.call(e.parentNode.children,e):0;
  e.style.transitionDelay=Math.min(sib,6)*70+"ms";e.classList.add("in");io.unobserve(e);setTimeout(function(){e.style.transitionDelay="";},1200);});},{threshold:.12,rootMargin:"0px 0px -6% 0px"});
els.forEach(function(e){io.observe(e);});
new MutationObserver(function(m){m.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1&&n.classList.contains("pf")){n.classList.add("rv");io.observe(n);}});});}).observe(document.getElementById("pfGrid"),{childList:true});
if(matchMedia("(hover:hover)").matches){
  document.addEventListener("pointermove",function(e){var t=e.target.closest&&e.target.closest(".sg>div,.pf,.sr");
    if(window._tl&&window._tl!==t){window._tl.style.setProperty("--rx","0deg");window._tl.style.setProperty("--ry","0deg");window._tl=null;}
    if(!t||!t.classList.contains("in"))return;var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    t.style.setProperty("--ry",(x*8).toFixed(2)+"deg");t.style.setProperty("--rx",(-y*8).toFixed(2)+"deg");window._tl=t;});
}
})();

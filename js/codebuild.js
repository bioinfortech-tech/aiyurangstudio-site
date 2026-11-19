/* "Being built" scene: a few generic lines type out in an editor, the editor slides away and the
   rendered page assembles, a "완성 ✓" chip lands, hold, soft reset. Decorative; CSS transitions only.
   Without JS or with reduced motion the finished page is shown. Used by door 03 and the /tools hero. */
(function(){
"use strict";
/* header turns light (translucent, dark text) while it sits over a light section; the remote scene's click ripple plays when seen */
(function(){
  var hd=document.querySelector(".hdr"),lights=[].slice.call(document.querySelectorAll(".tx-light"));
  if(hd&&lights.length){var tick=0;function chk(){tick=0;var on=false;for(var i=0;i<lights.length;i++){var r=lights[i].getBoundingClientRect();if(r.top<=36&&r.bottom>=36){on=true;break;}}hd.classList.toggle("lt",on);}
    addEventListener("scroll",function(){if(!tick)tick=requestAnimationFrame(chk);},{passive:true});addEventListener("resize",chk);chk();}
  var rm0=document.documentElement.classList.contains("rm");
  var rp=[].slice.call(document.querySelectorAll(".rmt"));
  if(rp.length&&"IntersectionObserver" in window&&!rm0){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}});},{threshold:.5});rp.forEach(function(n){io.observe(n);});}
})();
var scenes=[].slice.call(document.querySelectorAll(".cbs"));if(!scenes.length)return;
var rm=document.documentElement.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
if(rm)return;
var T="t",A="a",S="s",P="p",X="x"; /* tag, attr, string, punct, text */
var SNIP={
  mini:[[[T,"<main>"]],[[X,"  "],[T,"<header>"],[X,"우리 가게"],[T,"</header>"]],[[X,"  "],[T,"<p>"],[X,"오늘 예약 가능"],[T,"</p>"]],[[X,"  "],[T,"<button>"],[X,"예약하기"],[T,"</button>"]],[[X,"  "],[A,"onclick"],[P," = "],[X,"book"],[P,"();"]],[[T,"</main>"]]],
  hero:[[[A,"function "],[X,"Booking"],[P,"() {"]],[[X,"  "],[A,"return "],[P,"("]],[[X,"    "],[T,"<section "],[A,"class"],[P,"="],[S,'"hero"'],[T,">"]],[[X,"      "],[T,"<h1>"],[X,"우리 가게 예약"],[T,"</h1>"]],[[X,"      "],[T,"<button "],[A,"onClick"],[P,"={"],[X,"book"],[P,"}"],[T,">"]],[[X,"        예약하기"]],[[X,"      "],[T,"</button>"]],[[X,"    "],[T,"</section>"]],[[P,"  );"]],[[P,"}"]]]
};
function build(sc){
  var code=sc.querySelector(".cbs-code"),snip=SNIP[sc.getAttribute("data-snip")||"mini"],gen=0,vis=false,timer=0,run=false;
  var speed=+sc.getAttribute("data-speed")||36;
  function after(ms,fn,g){timer=setTimeout(function(){if(g===gen)fn();},ms);}
  function cycle(){
    var g=++gen;code.textContent="";sc.classList.add("run","rs");
    var W=[46,62,38,70,54,30,64,42,58,34];
    for(var q=0;q<snip.length;q++){var l0=document.createElement("div");l0.className="ln sk";var b0=document.createElement("span");b0.className="sk-b";b0.style.width=W[q%W.length]+"%";l0.appendChild(b0);code.appendChild(l0);}
    var lines=code.children;sc.classList.remove("b","d","x");
    void sc.offsetWidth;sc.classList.remove("rs");
    var cr=document.createElement("span");cr.className="cr";
    var li=0,ti=0,ci=0,ln=null,sp=null;
    function nextLine(){
      if(li>=snip.length){after(500,built,g);return;}
      ln=lines[li];ln.className="ln";ln.textContent="";ti=0;ci=0;sp=null;step();
    }
    function step(){
      if(g!==gen)return;
      var line=snip[li];
      if(ti>=line.length){li++;after(120,nextLine,g);return;}
      var tok=line[ti];
      if(!sp){sp=document.createElement("span");sp.className="k-"+tok[0];ln.appendChild(sp);}
      var ch=tok[1].charAt(ci++);sp.textContent+=ch;ln.appendChild(cr);
      if(ci>=tok[1].length){ti++;ci=0;sp=null;}
      after(/\s/.test(ch)?6:speed,step,g);
    }
    function built(){
      sc.classList.add("b");
      after(500,function(){sc.classList.add("d");after(3500,function(){sc.classList.add("x");after(650,cycle,g);},g);},g);
    }
    after(500,nextLine,g);
  }
  function go(){if(run)return;run=true;cycle();}
  function stop(){run=false;gen++;clearTimeout(timer);}
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis&&!document.hidden)go();else stop();},{threshold:.25}).observe(sc);
  else go();
  document.addEventListener("visibilitychange",function(){if(document.hidden)stop();else if(vis)go();});
  sc.__shot=function(phase){stop();cycle();gen++; /* screenshot helper: jump to a phase */
    code.textContent="";snip.forEach(function(l){var d=document.createElement("div");d.className="ln";l.forEach(function(t){var s=document.createElement("span");s.className="k-"+t[0];s.textContent=t[1];d.appendChild(s);});code.appendChild(d);});
    sc.classList.remove("b","d","x");if(phase>=1)sc.classList.add("b");if(phase>=2)sc.classList.add("d");};
}
scenes.forEach(build);
})();

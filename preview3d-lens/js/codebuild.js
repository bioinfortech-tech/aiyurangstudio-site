/* "Being built" scene: a few generic lines type out in an editor, the editor slides away and the
   rendered page assembles, a "완성 ✓" chip lands, hold, soft reset. Decorative; CSS transitions only.
   Without JS or with reduced motion the finished page is shown. Used by door 03 and the /tools hero. */
(function(){
"use strict";
/* headline caret: blinks a couple of times when the custom-build heading first scrolls into view */
(function(){var h=document.querySelector(".tx-custom .tx-sh h2");if(!h||!("IntersectionObserver" in window))return;
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){h.classList.add("caret");io.disconnect();}},{threshold:.8});io.observe(h);})();
var scenes=[].slice.call(document.querySelectorAll(".cbs"));if(!scenes.length)return;
var rm=document.documentElement.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
if(rm)return;
var T="t",A="a",S="s",P="p",X="x"; /* tag, attr, string, punct, text */
var SNIP={
  mini:[[[T,"<header>"],[X,"우리 가게"],[T,"</header>"]],[[T,"<img "],[A,"src"],[P,"="],[S,'"hero.jpg"'],[T,">"]],[[T,"<button>"],[X,"예약하기"],[T,"</button>"]],[[A,"onclick"],[P," = "],[X,"book"],[P,"();"]]],
  hero:[[[A,"function "],[X,"Booking"],[P,"() {"]],[[X,"  "],[A,"return "],[P,"("]],[[X,"    "],[T,"<section "],[A,"class"],[P,"="],[S,'"hero"'],[T,">"]],[[X,"      "],[T,"<h1>"],[X,"우리 가게 예약"],[T,"</h1>"]],[[X,"      "],[T,"<button "],[A,"onClick"],[P,"={"],[X,"book"],[P,"}"],[T,">"]],[[X,"        예약하기"]],[[X,"      "],[T,"</button>"]],[[X,"    "],[T,"</section>"]],[[P,"  );"]],[[P,"}"]]]
};
function build(sc){
  var code=sc.querySelector(".cbs-code"),snip=SNIP[sc.getAttribute("data-snip")||"mini"],gen=0,vis=false,timer=0,run=false;
  var speed=+sc.getAttribute("data-speed")||36;
  function after(ms,fn,g){timer=setTimeout(function(){if(g===gen)fn();},ms);}
  function cycle(){
    var g=++gen;code.textContent="";sc.classList.add("run","rs");sc.classList.remove("b","d","x");
    void sc.offsetWidth;sc.classList.remove("rs");
    var cr=document.createElement("span");cr.className="cr";
    var li=0,ti=0,ci=0,ln=null,sp=null;
    function nextLine(){
      if(li>=snip.length){after(500,built,g);return;}
      ln=document.createElement("div");ln.className="ln";code.appendChild(ln);ti=0;ci=0;sp=null;step();
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
      after(1900,function(){sc.classList.add("d");after(2600,function(){sc.classList.add("x");after(650,cycle,g);},g);},g);
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

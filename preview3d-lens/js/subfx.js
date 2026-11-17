/* Sub-page personalities under one site system:
   /work = AI (light particles + pixel-form frames), /work/live = analog film strip (projector gate),
   /tools = blueprint (UI windows assembling). Shared: iris/shutter blink on opening/closing a piece.
   Everything here is decorative and additive; the page content/DOM from sub.js is untouched. */
(function(){
"use strict";
var root=document.documentElement,body=document.body;
var rm=root.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
var small=Math.min(screen.width||9999,innerWidth)<=760;
var NS="http://www.w3.org/2000/svg";
/* effects that were removed on request; flip a flag to bring one back (window.YR_FLAGS = {irisBlink:true,flicker:true,gateFlash:true}) */
var FLAGS={irisBlink:false,flicker:false,gateFlash:false};
if(window.YR_FLAGS){for(var fk in window.YR_FLAGS)FLAGS[fk]=window.YR_FLAGS[fk];}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function eIn(t){return t*t*t;}function eOut(t){t=1-t;return 1-t*t*t;}

/* ---------- shared: iris blink ---------- */
var BL=8,blades=[],blinkEl=null,wg=null,busy=false;
function buildBlink(){
  if(blinkEl)return;
  blinkEl=document.createElementNS(NS,"svg");
  blinkEl.setAttribute("class","yr-blink");blinkEl.setAttribute("aria-hidden","true");blinkEl.setAttribute("focusable","false");
  blinkEl.setAttribute("viewBox","-1000 -1000 2000 2000");blinkEl.setAttribute("preserveAspectRatio","xMidYMid slice");
  wg=document.createElementNS(NS,"g");blinkEl.appendChild(wg);
  for(var i=0;i<BL;i++){var p=document.createElementNS(NS,"path");p.setAttribute("d","M0 -620L0 2800L2800 2800L2800 -620Z");p.setAttribute("class","bl"+(i%2));wg.appendChild(p);blades.push(p);}
  body.appendChild(blinkEl);blinkEl.style.visibility="hidden";
}
function setC(c){
  if(c<=.002){blinkEl.style.visibility="hidden";return;}
  blinkEl.style.visibility="visible";
  var r=1500*Math.pow(1-c,1.7);
  for(var i=0;i<BL;i++)blades[i].setAttribute("transform","rotate("+(i*360/BL).toFixed(1)+") translate("+r.toFixed(1)+" 0)");
  wg.setAttribute("transform","rotate("+(c*26).toFixed(1)+")");
}
function blink(fn,opts){
  opts=opts||{};
  if(rm||!FLAGS.irisBlink){fn();return;}
  if(busy){fn();return;}
  buildBlink();busy=true;
  var CL=opts.close||230,OP=opts.open||340,t0=performance.now(),done=false;
  (function step(now){
    var e=now-t0;
    if(e<CL){setC(eIn(e/CL));requestAnimationFrame(step);return;}
    if(!done){done=true;setC(1);try{fn();}catch(x){}t0=now;requestAnimationFrame(step);return;}
    var o=e/OP;
    if(o>=1){setC(0);busy=false;return;}
    setC(1-eOut(o));requestAnimationFrame(step);
  })(t0);
}
function openOnly(){ /* page enter: blades start closed and open */
  if(rm)return;buildBlink();busy=true;setC(1);var t0=performance.now();setTimeout(function(){setC(0);busy=false;},1600);
  (function step(now){var o=(now-t0-120)/620;if(o<0){requestAnimationFrame(step);return;}if(o>=1){setC(0);busy=false;return;}setC(1-eOut(o));requestAnimationFrame(step);})(t0);
}
window.YR_FX={blink:blink};

/* ---------- /work : AI, light particles + pixel-form ---------- */
function themeAI(){
  var head=document.querySelector(".pg-head");if(!head)return;
  var cv=document.createElement("canvas");cv.className="fx-ai";cv.setAttribute("aria-hidden","true");head.insertBefore(cv,head.firstChild);
  var ctx=cv.getContext("2d");if(!ctx)return;
  var W=0,H=0,dpr=Math.min(devicePixelRatio||1,small?1.5:2),P=[],t0=performance.now(),running=false,raf=0,visible=true;
  var N=small?260:620;
  function targets(){
    var T=[],w=W,h=H,fw=Math.min(w*.44,(h-150)*1.78,640),fh=fw*9/16,cx=w*.73,cy=h*.50+20;
    if(small){fw=w*.7;fh=fw*9/16;cx=w*.5;cy=h*.7;}
    var cr=Math.min(fh*.34,fw*.2),i;
    /* 16:9 frame (brackets) */
    var nf=Math.floor(N*.5),per=2*(fw+fh);
    for(i=0;i<nf;i++){var d=i/nf*per,x,y;
      if(d<fw){x=cx-fw/2+d;y=cy-fh/2;}else if(d<fw+fh){x=cx+fw/2;y=cy-fh/2+(d-fw);}else if(d<2*fw+fh){x=cx+fw/2-(d-fw-fh);y=cy+fh/2;}else{x=cx-fw/2;y=cy+fh/2-(d-2*fw-fh);}
      T.push([x,y]);}
    /* iris: outer heptagon + inner heptagon + blade edges (same motif as the main shutter) */
    var ng=N-T.length,n1=Math.floor(ng*.4),n2=Math.floor(ng*.3),n3=ng-n1-n2,ro=cr,ri=cr*.42;
    function hept(R,rot,x){var k=x*7,s=Math.floor(k),f=k-s,a1=s/7*Math.PI*2+rot,a2=(s+1)/7*Math.PI*2+rot;return [cx+(Math.cos(a1)*(1-f)+Math.cos(a2)*f)*R,cy+(Math.sin(a1)*(1-f)+Math.sin(a2)*f)*R];}
    for(i=0;i<n1;i++)T.push(hept(ro,-Math.PI/2,i/n1));
    for(i=0;i<n2;i++)T.push(hept(ri,-Math.PI/2,i/n2));
    for(i=0;i<n3;i++){var v=Math.floor(i/(n3/7)),f2=(i%Math.max(1,Math.floor(n3/7)))/Math.max(1,Math.floor(n3/7)),a3=v/7*Math.PI*2-Math.PI/2,rr=ri+(ro-ri)*f2;T.push([cx+Math.cos(a3)*rr,cy+Math.sin(a3)*rr]);}
    return T;
  }
  function size(){
    W=head.clientWidth;H=small?430:500;
    cv.width=W*dpr;cv.height=H*dpr;cv.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0);
    var T=targets();
    for(var i=0;i<N;i++){
      var p=P[i]||(P[i]={x:Math.random()*W,y:Math.random()*H,vx:0,vy:0,ph:Math.random()*6.28,hue:Math.random()});
      p.tx=T[i][0];p.ty=T[i][1];
      if(!P[i].inited){p.x=W*.58+(Math.random()-.5)*W*1.2;p.y=H*.5+(Math.random()-.5)*H*1.4;p.inited=true;}
    }
  }
  var spr=document.createElement("canvas");spr.width=spr.height=32;
  (function(){var c=spr.getContext("2d"),g=c.createRadialGradient(16,16,0,16,16,16);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.25,"rgba(255,255,255,.55)");g.addColorStop(1,"rgba(255,255,255,0)");c.fillStyle=g;c.fillRect(0,0,32,32);})();
  var COLS=[[140,180,255],[170,140,255],[110,220,230],[255,226,190]];
  function draw(now){
    raf=0;if(!running)return;
    var t=(now-t0)/1000;ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation="lighter";
    for(var i=0;i<N;i++){
      var p=P[i],delay=i/N*1.2,k=clamp((t-delay)/2.2,0,1),e=k*k*(3-2*k);
      var sx=3.2+(1-e)*0,dx=p.tx-p.x,dy=p.ty-p.y;
      p.vx=(p.vx+dx*.012*(.25+e))*.88;p.vy=(p.vy+dy*.012*(.25+e))*.88;
      var jit=e>=1?.35:0;
      p.x+=p.vx+Math.sin(t*1.3+p.ph)*jit*.4;p.y+=p.vy+Math.cos(t*1.1+p.ph)*jit*.4;
      var c=COLS[Math.floor(p.hue*4)],tw=.55+.45*Math.sin(t*2+p.ph),a=(.25+.6*e)*tw;
      ctx.globalAlpha=a;ctx.drawImage(spr,p.x-sx*2,p.y-sx*2,sx*4,sx*4);
      if(i%3===0){ctx.globalAlpha=a*.5;ctx.fillStyle="rgb("+c[0]+","+c[1]+","+c[2]+")";ctx.fillRect(p.x-.8,p.y-.8,1.6,1.6);}
    }
    ctx.globalAlpha=1;
    raf=requestAnimationFrame(draw);
  }
  function stillDraw(){
    ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation="lighter";
    for(var i=0;i<N;i++){var p=P[i];ctx.globalAlpha=.7;ctx.drawImage(spr,p.tx-6,p.ty-6,12,12);}
  }
  function go(){if(rm){size();for(var i=0;i<N;i++){P[i].x=P[i].tx;P[i].y=P[i].ty;}stillDraw();return;}
    if(visible&&!document.hidden&&!running){running=true;raf=requestAnimationFrame(draw);}else if(!(visible&&!document.hidden)){running=false;}}
  size();  addEventListener("resize",function(){size();if(rm)stillDraw();},{passive:true});
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;go();},{threshold:0}).observe(head);
  document.addEventListener("visibilitychange",go);
  go();

  /* cards: the thumbnail forms out of pixels, then the real image takes over */
  var pg=document.getElementById("pg");if(!pg||rm||!("IntersectionObserver" in window))return;
  var steps=[10,22,48,96,0]; /* 0 = full resolution, then the real image takes over crisp */
  function pixelForm(card){
    var wrap=card.querySelector(".pi-img"),img=wrap&&wrap.querySelector("img");if(!img)return;
    var c=document.createElement("canvas");c.className="pix";c.setAttribute("aria-hidden","true");wrap.appendChild(c);
    function run(){
      var w=wrap.clientWidth||320,h=wrap.clientHeight||180;c.width=w;c.height=h;var x=c.getContext("2d");
      var tmp=document.createElement("canvas"),tc=tmp.getContext("2d"),k=0;
      var iw=img.naturalWidth,ih=img.naturalHeight,sc=Math.max(w/iw,h/ih),sw=w/sc,sh=h/sc,sx=(iw-sw)/2,sy=(ih-sh)/2;
      (function tick(){
        var n=steps[k]||w,th=Math.max(2,Math.round(n*h/w));
        tmp.width=n;tmp.height=th;tc.drawImage(img,sx,sy,sw,sh,0,0,n,th);
        x.imageSmoothingEnabled=n>=w*0.9;x.clearRect(0,0,w,h);x.drawImage(tmp,0,0,n,th,0,0,w,h);
        k++;if(k<steps.length)setTimeout(tick,95);else{c.style.opacity="0";setTimeout(function(){c.remove();},700);}
      })();
    }
    try{if(img.complete&&img.naturalWidth>120)run();else img.addEventListener("load",run,{once:true});}catch(e){c.remove();}
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){io.unobserve(en.target);pixelForm(en.target);}});},{threshold:.25});
  [].slice.call(pg.querySelectorAll(".pi")).slice(0,24).forEach(function(c){io.observe(c);});
}

/* ---------- /work/live : horizontal film strip, vertical scroll drives it sideways through a projector gate ---------- */
function themeLive(){
  var pg=document.getElementById("pg"),chips=document.getElementById("chips"),head=document.querySelector(".pg-head");
  if(!pg||!head)return;
  var V=window.YR_L||[];
  /* structure: pinned stage after the heading; chips live inside the stage so categories stay reachable */
  var sec=document.createElement("section");sec.className="lv";sec.id="lv";
  sec.innerHTML='<div class="lv-stage"><div class="lv-top"></div><div class="lv-view"><div class="lv-gate" aria-hidden="true"><i></i><i></i><i></i><i></i></div></div>'+
    '<div class="lv-foot" aria-hidden="true"><b id="lvN">01</b><span id="lvT"></span><div class="lv-bar"><u id="lvBar"></u></div></div></div>';
  head.parentNode.insertBefore(sec,head.nextSibling);
  var top=sec.querySelector(".lv-top"),view=sec.querySelector(".lv-view"),stage=sec.querySelector(".lv-stage");
  var sh=head.querySelector(".sh");if(sh)top.appendChild(sh);
  if(chips)top.appendChild(chips);
  head.style.display="none";
  view.insertBefore(pg,view.firstChild);pg.classList.add("lv-track");
  /* the CTA and the back link move below the strip */
  var tail=document.createElement("section");tail.className="sec lv-end";tail.innerHTML='<div class="wrap"></div>';
  sec.parentNode.insertBefore(tail,sec.nextSibling);
  [].slice.call(head.querySelectorAll(".more,.live-note")).forEach(function(n){tail.firstChild.appendChild(n);});
  var flk=document.createElement("div");flk.className="flicker";flk.setAttribute("aria-hidden","true");
  if(!FLAGS.flicker)flk.style.display="none";
  var gate=document.createElement("div");gate.className="gate";gate.setAttribute("aria-hidden","true");
  body.appendChild(flk);body.appendChild(gate);
  var nEl=document.getElementById("lvN"),tEl=document.getElementById("lvT"),bar=document.getElementById("lvBar");

  var items=[],all=[].slice.call(pg.querySelectorAll(".pi")),fw=500,gap=24,step=524,maxT=0,len=1,lvTop=0;
  var x=0,tx=0,act=-1,ifr=null,raf=0,last=performance.now(),still=0,lastScroll=scrollY,vel=0;
  var K=.8;
  function vis(){items=all.filter(function(c){return !c.hidden;});}
  function layout(){
    vis();
    var vw=stage.clientWidth||innerWidth,small=vw<=760,sh=stage.clientHeight||innerHeight;
    var barB=(top.offsetTop||0)+top.offsetHeight,footH=48,bandPad=88,gapPx=small?14:24;
    var availH=Math.max(160,sh-barB-footH);
    var fh=availH-bandPad,fwTarget=Math.round(fh*16/9),fwMax=Math.round(vw*(small?.92:.9));
    fw=Math.min(fwTarget,fwMax);fh=Math.round(fw*9/16);gap=gapPx;
    step=fw+gap;
    sec.style.setProperty("--vw",vw+"px");sec.style.setProperty("--fw",fw+"px");sec.style.setProperty("--fh",fh+"px");sec.style.setProperty("--gap",gap+"px");sec.style.setProperty("--bar",barB+"px");
    maxT=Math.max(0,(items.length-1)*step);
    len=Math.max(1,maxT*K);
    var stageH=stage.offsetHeight||sh;
    sec.style.height=(stageH+len)+"px";
    lvTop=sec.getBoundingClientRect().top+scrollY;
    kick(true);
  }
  function setActive(n){
    if(n===act)return;
    if(ifr){ifr.remove();ifr=null;}
    if(act>=0&&items[act])items[act].classList.remove("on");
    act=n;
    if(n>=0&&items[n]){
      var c=items[n];c.classList.add("on");
      gate.classList.remove("snap");void gate.offsetWidth;if(!rm&&FLAGS.gateFlash)gate.classList.add("snap");
      var idx=all.indexOf(c),id=V[idx]&&V[idx][0];
      if(id&&!rm){
        ifr=document.createElement("iframe");ifr.className="gatevid";ifr.setAttribute("tabindex","-1");ifr.setAttribute("aria-hidden","true");ifr.setAttribute("title","");
        ifr.allow="autoplay; encrypted-media";var me=ifr;
        ifr.addEventListener("load",function(){try{me.contentWindow.postMessage(JSON.stringify({event:"listening",id:1}),"*");me.contentWindow.postMessage(JSON.stringify({event:"command",func:"addEventListener",args:["onStateChange"]}),"*");}catch(e){}});
        ifr.src="https://www.youtube.com/embed/"+id+"?autoplay=1&mute=1&controls=0&loop=1&playlist="+id+"&playsinline=1&rel=0&modestbranding=1&disablekb=1&enablejsapi=1";
        c.querySelector(".pi-img").appendChild(ifr);
      }
    }
  }
  /* the poster stays until YouTube reports that the clip is actually playing */
  addEventListener("message",function(e){
    if(!ifr||!/youtube\.com$/.test(e.origin.replace(/^https?:\/\//,'')))return;
    var d=e.data;try{if(typeof d==="string")d=JSON.parse(d);}catch(z){return;}
    if(!d)return;var st=(d.event==="onStateChange")?d.info:(d.info&&d.info.playerState);
    if(st===1)ifr.classList.add("ld");
  });
  function frame(now){
    raf=0;
    var dt=Math.min(.05,(now-last)/1000)||.016;last=now;
    var p=clamp((scrollY-lvTop)/len,0,1),f=p*(items.length-1);
    /* smooth: no snap toward frames (removed on request — it made the strip shudder) */
    tx=-f*step;    var k=rm?1:1-Math.exp(-dt*9);
    x+=(tx-x)*k;
    var sp=Math.abs(tx-x)/Math.max(dt,.001);
    /* gate jitter removed on request — plain smooth sideways motion */
    pg.style.transform="translate3d("+x.toFixed(2)+"px,0,0)";
    var cur=items.length?clamp(Math.round(-x/step),0,items.length-1):-1;
    var off=Math.abs(-x-cur*step);
    if(Math.abs(tx-x)<2&&off<step*.25)still+=dt;else still=0;
    if(rm||still>.22){if(off<step*.3)setActive(cur);}else if(Math.abs(tx-x)>step*.35)setActive(-1);
        nEl.textContent=(cur+1<10?"0":"")+(cur+1);
    var tt=items[cur]&&items[cur].querySelector(".pi-meta b");tEl.textContent=items[cur]?" / "+(items.length<10?"0":"")+items.length+(tt?"   "+tt.textContent:""):"";
    bar.style.transform="scaleX("+(items.length>1?(p).toFixed(4):1)+")";
    if(Math.abs(tx-x)>.2||still<.3)raf=requestAnimationFrame(frame);
  }
  function kick(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame);}}
  addEventListener("scroll",function(){var d=scrollY-lastScroll;lastScroll=scrollY;vel=d*60;kick();setTimeout(function(){vel=0;},120);},{passive:true});
  addEventListener("resize",layout,{passive:true});
  if(chips)chips.addEventListener("click",function(){setTimeout(function(){setActive(-1);x=0;layout();scrollTo(0,Math.min(scrollY,lvTop)||0);window.scrollTo({top:lvTop-0,behavior:"auto"});kick();},30);});
  pg.addEventListener("focusin",function(e){var c=e.target.closest&&e.target.closest(".pi");var i=items.indexOf(c);if(i<0)return;scrollTo({top:lvTop+(items.length>1?i/(items.length-1)*len:0),behavior:rm?"auto":"smooth"});});
  pg.addEventListener("click",function(){setTimeout(function(){setActive(-1);},500);});
  document.addEventListener("visibilitychange",function(){if(document.hidden)setActive(-1);else kick();});
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layout);
  layout();
  addEventListener("load",layout);}

/* ---------- /tools : blueprint, UI windows assemble ---------- */
function themeTools(){
  var tools=[].slice.call(document.querySelectorAll(".tool"));
  tools.forEach(function(t){
    var fig=t.querySelector(".tool-fig"),lab=t.querySelector(".tool-head .lab");
    if(fig&&lab)fig.setAttribute("data-t",lab.textContent.replace(/\s*·\s*/g," / ").toLowerCase().replace(/\s+/g,"_"));
  });
}

/* ---------- shared: blink when a piece opens / closes ---------- */
var theme=body.className.match(/th-(ai|live|tools)/);
if(theme){
  if(theme[1]==="ai")themeAI();else if(theme[1]==="live")themeLive();else themeTools();
}
})();

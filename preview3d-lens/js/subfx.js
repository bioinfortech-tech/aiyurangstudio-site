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
  if(rm){fn();return;}
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
  var steps=[10,18,34,64,128];
  function pixelForm(card){
    var wrap=card.querySelector(".pi-img"),img=wrap&&wrap.querySelector("img");if(!img)return;
    var c=document.createElement("canvas");c.className="pix";c.setAttribute("aria-hidden","true");wrap.appendChild(c);
    function run(){
      var w=wrap.clientWidth||320,h=wrap.clientHeight||180;c.width=w;c.height=h;var x=c.getContext("2d");
      var tmp=document.createElement("canvas"),tc=tmp.getContext("2d"),k=0;
      var iw=img.naturalWidth,ih=img.naturalHeight,sc=Math.max(w/iw,h/ih),sw=w/sc,sh=h/sc,sx=(iw-sw)/2,sy=(ih-sh)/2;
      (function tick(){
        var n=steps[k],th=Math.max(2,Math.round(n*h/w));
        tmp.width=n;tmp.height=th;tc.drawImage(img,sx,sy,sw,sh,0,0,n,th);
        x.imageSmoothingEnabled=false;x.clearRect(0,0,w,h);x.drawImage(tmp,0,0,n,th,0,0,w,h);
        k++;if(k<steps.length)setTimeout(tick,95);else{c.style.opacity="0";setTimeout(function(){c.remove();},700);}
      })();
    }
    try{if(img.complete&&img.naturalWidth>120)run();else img.addEventListener("load",run,{once:true});}catch(e){c.remove();}
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){io.unobserve(en.target);pixelForm(en.target);}});},{threshold:.25});
  [].slice.call(pg.querySelectorAll(".pi")).slice(0,24).forEach(function(c){io.observe(c);});
}

/* ---------- /work/live : analog film strip with projector gate ---------- */
function themeLive(){
  var pg=document.getElementById("pg");if(!pg)return;
  var V=window.YR_L||[];
  pg.classList.add("strip");
  var cards=[].slice.call(pg.querySelectorAll(".pi"));
  /* leader frames keep the strip running when there are only a few works (decorative, no text claims) */
  var need=Math.max(0,4-cards.length),before=0,after=need; /* real works first, leaders follow */
  function leader(n){var d=document.createElement("div");d.className="leader";d.setAttribute("aria-hidden","true");d.innerHTML='<span class="ec">YURANG '+(5000+n*7)+'</span>';return d;}
  for(var i=0;i<before;i++)pg.insertBefore(leader(i),pg.firstChild);
  for(var j=0;j<after;j++)pg.appendChild(leader(before+cards.length+j));
  var grain=document.createElement("div");grain.className="grain";grain.setAttribute("aria-hidden","true");
  var flk=document.createElement("div");flk.className="flicker";flk.setAttribute("aria-hidden","true");
  var gate=document.createElement("div");gate.className="gate";gate.setAttribute("aria-hidden","true");
  body.appendChild(grain);body.appendChild(flk);body.appendChild(gate);
  if(rm){return;}
  var act=-1,ifr=null,last=scrollY,off=0,jx=0,raf=0,tick=0;
  /* the poster stays until YouTube reports that the clip is actually playing */
  addEventListener("message",function(e){
    if(!ifr||!/youtube\.com$/.test(e.origin.replace(/^https?:\/\//,'')))return;
    var d=e.data;try{if(typeof d==="string")d=JSON.parse(d);}catch(x){return;}
    if(!d)return;var st=(d.event==="onStateChange")?d.info:(d.info&&d.info.playerState);
    if(st===1)ifr.classList.add("ld");
  });
  function setActive(n){
    if(n===act)return;
    if(ifr){ifr.remove();ifr=null;}
    if(act>=0&&cards[act])cards[act].classList.remove("on");
    act=n;
    if(n>=0){
      var c=cards[n];c.classList.add("on");
      var id=V[n]&&V[n][0];
      if(id){
        ifr=document.createElement("iframe");ifr.className="gatevid";ifr.setAttribute("tabindex","-1");ifr.setAttribute("aria-hidden","true");ifr.setAttribute("title","");
        ifr.allow="autoplay; encrypted-media";ifr.setAttribute("loading","lazy");var me=ifr;ifr.addEventListener("load",function(){try{me.contentWindow.postMessage(JSON.stringify({event:"listening",id:1}),"*");me.contentWindow.postMessage(JSON.stringify({event:"command",func:"addEventListener",args:["onStateChange"]}),"*");}catch(e){}});
        ifr.src="https://www.youtube.com/embed/"+id+"?autoplay=1&mute=1&controls=0&loop=1&playlist="+id+"&playsinline=1&rel=0&modestbranding=1&disablekb=1&enablejsapi=1";
        c.querySelector(".pi-img").appendChild(ifr);
      }
      gate.classList.remove("snap");void gate.offsetWidth;gate.classList.add("snap");
    }
  }
  function frame(){
    raf=0;
    var y=scrollY,v=y-last;last=y;
    var mid=innerHeight/2,best=-1,bd=1e9;
    for(var k=0;k<cards.length;k++){
      var r=cards[k].querySelector(".pi-img").getBoundingClientRect(),d=Math.abs((r.top+r.height/2)-mid);
      if(d<bd){bd=d;best=k;}
    }
    var rr=cards[best]?cards[best].querySelector(".pi-img").getBoundingClientRect():null;
    setActive(rr&&bd<rr.height*.55?best:-1);
    /* gate hunt: the strip lags a little behind the scroll and settles with a tiny jitter */
    off+=(clamp(-v*.22,-16,16)-off)*.2;
    jx=Math.abs(v)>2?(Math.random()-.5)*Math.min(3,Math.abs(v)*.12):jx*.6;
    pg.style.transform="translate3d("+jx.toFixed(2)+"px,"+off.toFixed(2)+"px,0)";
    if(Math.abs(off)>.05||Math.abs(v)>.2||Math.abs(jx)>.05)raf=requestAnimationFrame(frame);
    else pg.style.transform="";
  }
  function kick(){if(!raf)raf=requestAnimationFrame(frame);}
  addEventListener("scroll",kick,{passive:true});addEventListener("resize",kick,{passive:true});
  document.addEventListener("visibilitychange",function(){if(document.hidden)setActive(-1);else kick();});
  addEventListener("yr-modal",function(){if(window.YR&&window.YR.modalOpen)setActive(-1);});
  pg.addEventListener("click",function(){setTimeout(function(){setActive(-1);},500);});
  kick();
}

/* ---------- /tools : blueprint, UI windows assemble ---------- */
function themeTools(){
  var tools=[].slice.call(document.querySelectorAll(".tool"));
  tools.forEach(function(t){
    var fig=t.querySelector(".tool-fig"),lab=t.querySelector(".tool-head .lab");
    if(fig&&lab)fig.setAttribute("data-t",lab.textContent.replace(/\s*·\s*/g," / ").toLowerCase().replace(/\s+/g,"_"));
    var h=document.createElement("span");h.className="reg";h.setAttribute("aria-hidden","true");t.appendChild(h);
  });
}

/* ---------- shared: blink when a piece opens / closes ---------- */
var theme=body.className.match(/th-(ai|live|tools)/);
if(theme){
  if(theme[1]==="ai")themeAI();else if(theme[1]==="live")themeLive();else themeTools();
}
})();

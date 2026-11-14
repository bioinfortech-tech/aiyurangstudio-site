/* Hero: cinema lens (three.js r128, single fullscreen fragment shader).
   Light field behind the glass = procedural by default; swaps to media/hero.mp4 when it plays. */
(function(){
"use strict";
var root=document.documentElement;
var HERO_VIDEO="media/hero.mp4",HERO_VIDEO_M="media/hero_m.mp4"; /* phones try the lighter cut first, fall back to hero.mp4 */           /* optional: short muted loop placed behind the lens */
var outer=document.getElementById("heroOuter"),hero=document.getElementById("hero"),cv=document.getElementById("gl");
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
function fail(){root.classList.add("nogl");}
if(typeof THREE==="undefined"||!cv){return fail();}
var coarse=matchMedia("(pointer:coarse)").matches;
var small=Math.min(screen.width||9999,innerWidth)<=760||coarse;
var renderer;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:false,alpha:false,powerPreference:"high-performance"});}catch(e){return fail();}
if(!renderer||!renderer.getContext()){return fail();}
renderer.setClearColor(0x0B0B0D,1);

var VS="void main(){gl_Position=vec4(position.xy,0.,1.);}";
var FS=[
"#ifdef GL_FRAGMENT_PRECISION_HIGH","precision highp float;","#else","precision mediump float;","#endif",
"uniform vec2 uRes,uC,uL;uniform float uTime,uScroll,uR,uRip,uVid,uVA;uniform sampler2D uTex;",
"#define PI 3.14159265",
"#define BG vec3(.043,.043,.051)",
"float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
"float vn(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h21(vec2(i,1.)),h21(vec2(i+1.,1.)),f);}",
"vec2 rot(vec2 p,float a){float c=cos(a),s=sin(a);return vec2(c*p.x-s*p.y,s*p.x+c*p.y);}",
"const vec3 WARM=vec3(1.,.93,.80);const vec3 COOL=vec3(.40,.57,1.);",
/* procedural light field around light position L */
"vec3 field(vec2 x,vec2 L){vec2 d=x-L;float r2=dot(d,d);",
" float core=.016/(r2+.016);",
" float s1=exp(-abs(d.y)*52.)*exp(-abs(d.x)*.75);",
" float s2=exp(-abs(d.y)*11.)*exp(-abs(d.x)*1.5);",
" float a=atan(d.y,d.x);float rays=pow(vn(a*5.+uTime*.06),3.)*exp(-sqrt(r2)*1.7);",
" float t=smoothstep(0.,1.2,abs(d.x));",
" return WARM*core*1.15+mix(WARM,COOL,t)*s1*1.15+COOL*s2*.16+WARM*rays*.12;}",
"float poly(vec2 p,float n,float r){float a=atan(p.x,p.y)+PI;float s=2.*PI/n;return cos(floor(.5+a/s)*s-a)*length(p)-r;}",
"vec3 vid(vec2 o){vec2 uv=vec2(.5)-o*vec2(.30,.5);return texture2D(uTex,uv).rgb;}",
"void main(){",
" vec2 p=(gl_FragCoord.xy*2.-uRes)/uRes.y;",
" float e=smoothstep(0.,1.,uScroll);",
" vec2 C=mix(uC,vec2(0.),smoothstep(0.,.75,uScroll));",
" float R=uR*(1.+pow(smoothstep(.25,.95,uScroll),1.5)*5.);",
" vec2 q=p-C;float r=length(q);float t=r/R;float ang=atan(q.y,q.x);",
" vec2 Lr=uL-C;float angL=atan(Lr.y,Lr.x);float lat=1./(1.+dot(p-uL,p-uL)*.9);",
" vec3 col=BG;",
/* faint streak across the room from the light */
" col+=field(p,uL)*.20*(1.-e);",
" float aa=2./(uRes.y*R);",
" if(t>1.){",
"  float b=.05+.012*sin(t*11.);",
"  float spec=pow(max(0.,cos(ang-angL)),5.)*lat*.30*(.75+.25*sin(ang*260.+t*3.));",
"  float edges=0.;",
"  edges+=exp(-abs(t-1.012)*260.)*.55;edges+=exp(-abs(t-1.10)*220.)*.18;edges+=exp(-abs(t-1.34)*220.)*.16;",
"  edges+=exp(-abs(t-1.62)*220.)*.12;edges+=exp(-abs(t-1.98)*220.)*.09;",
"  float band=smoothstep(1.10,1.12,t)*(1.-smoothstep(1.32,1.34,t));",
"  float band2=smoothstep(1.36,1.38,t)*(1.-smoothstep(1.60,1.62,t));",
"  float ticks=step(.86,fract(ang/(2.*PI)*120.+uTime*.0))*step(1.40,t)*step(t,1.46)*.35;",
"  float ticks2=step(.5,fract(ang/(2.*PI)*24.))*step(1.50,t)*step(t,1.58)*.22;",
"  vec3 metal=vec3(b)*(1.+band*.5-band2*.3);",
"  metal+=(vec3(.9,.92,1.)*spec*(.5+band*.7+band2*.5));",
"  metal+=vec3(1.)*(edges*lat*.9+edges*.04);",
"  metal+=vec3(.8)*(ticks+ticks2)*(.12+lat*.5);",
"  float fall=smoothstep(2.35,1.35,t);",
"  col=mix(col,metal,smoothstep(0.,1.,fall)*smoothstep(1.,1.+aa*2.,t));",
" }",
" if(t<=1.+aa*2.){",
"  float h=sqrt(max(1.-t*t,0.));",
"  vec2 n2=q/R;",
"  n2+=uRip*.03*vec2(sin(q.y*30./R+uTime*1.3),cos(q.x*27./R-uTime*1.1));",
"  vec2 Lin=C+Lr*.30;",
"  vec2 qi=rot(q/R*1.02+vec2(Lr.x,Lr.y)*.035/R*.4,uTime*.045);",
"  float open=mix(.20,1.25,smoothstep(.02,.82,uScroll));",
"  float sd=poly(qi,7.,open);",
"  float hole=smoothstep(.012,-.012,sd);",
"  float rb=length(qi);",
"  float ba=atan(qi.y,qi.x);",
"  vec3 blade=vec3(.035)+vec3(.05)*pow(max(0.,cos(ba-angL*1.0)),3.)*lat*2.2*(.7+.3*sin(ba*180.));",
"  blade*=smoothstep(1.02,.7,rb)*.9+.1;",
"  blade+=vec3(1.)*exp(-abs(sd)*90.)*(.05+.18*lat);",
/* sample behind-glass field with slight dispersion */
"  vec2 so=-n2*(.55+.25*(1.-h));",
"  vec3 beh;",
"#ifdef HQ",
"  beh=vec3(field(Lin+so*R*1.00,Lin).r,field(Lin+so*R*1.035,Lin).g,field(Lin+so*R*1.07,Lin).b);",
"#else",
"  beh=field(Lin+so*R*1.03,Lin);",
"#endif",
"  beh=mix(beh,vid(so*1.0)*1.05+beh*.12,uVid);",
"  vec3 g=mix(blade,beh,hole)+beh*.05*(1.-hole);",
/* dome reflections */
"  float fres=pow(1.-h,3.);",
"  g+=mix(COOL,WARM,.35)*fres*(.10+.5*lat);",
"  vec2 sp=normalize(Lr+1e-4)*min(length(Lr)/R,1.3)*.5;",
"  g+=vec3(.9,.95,1.)*exp(-dot(n2-sp,n2-sp)*55.)*.30*lat;",
"  g+=vec3(.55,.35,.95)*exp(-pow((t-.86)*26.,2.))*.07*(.3+lat);",
"  g+=COOL*exp(-pow((t-.62)*40.,2.))*.045*(.3+lat);",
"  for(int i=0;i<3;i++){float k=.35+float(i)*.45;vec2 gp=-Lr/R*k;float rr=.10+.06*float(i);",
"   float gd=length(n2-gp);g+=mix(COOL,vec3(.8,.4,.9),float(i)/2.)*smoothstep(.012,0.,abs(gd-rr))*.06*lat;g+=COOL*smoothstep(rr,0.,gd)*.012*lat;}",
"  g*=.55+.45*h;",
"  col=mix(col,g,1.-smoothstep(1.-aa*2.,1.+aa*2.,t));",
" }",
" col=1.-exp(-col*1.35);",
" col*=1.-.38*dot(p*.5,p*.5);",
" float sa=uRes.x/uRes.y;",
" bool por=sa<1.;",
" vec2 fuv=sa>uVA?vec2(p.x/sa*.5+.5,p.y*.5*uVA/sa+.5):vec2(p.x*.5/uVA+.5,p.y*.5+.5);",
" vec3 fv=texture2D(uTex,fuv).rgb*.96;fv*=1.-.28*dot(p*.42,p*.42);",
" vec3 pf=BG+field(p*.8,uL)*.55+vec3(.10,.09,.08)*(1.-.5*length(p));",
" float ff=smoothstep(.55,.9,uScroll);",
" if(por){",
/* phones: lens fades, the heptagon itself grows into a centred 16:9 frame */
"  col=mix(col,BG,smoothstep(.12,.5,uScroll));",
"  vec2 Cp=mix(uC,vec2(0.),smoothstep(0.,.8,uScroll));",
"  float rp=mix(uR*.2,.78,pow(smoothstep(.12,.84,uScroll),1.25));",
"  vec2 qq=rot(p-Cp,uTime*.045);",
"  float sdp=poly(qq,7.,rp);float mp=smoothstep(.012,-.012,sdp);",
"  vec2 lu=vec2(p.x/sa*.5+.5,p.y*.5*uVA/sa+.5);",
"  float rk=smoothstep(.0,.004,.5-abs(lu.y-.5));",
"  vec3 lv=mix(BG,mix(BG+field(p*.8,uL)*.4,texture2D(uTex,lu).rgb*.96,uVid),rk);",
"  col=mix(col,lv,mp*smoothstep(.06,.26,uScroll));",
" }else{",
"  col=mix(col,mix(pf,fv,uVid),ff);",
" }",
" col=mix(col,BG,smoothstep(.9,1.,uScroll)*(1.-uVid));",
" float gr=h21(gl_FragCoord.xy+fract(uTime*.37)*173.)-.5;",
" col+=gr*.045;",
" gl_FragColor=vec4(col,1.);}"
].join("\n");

var scene=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
var dummy=new THREE.DataTexture(new Uint8Array([20,20,22,255]),1,1,THREE.RGBAFormat);dummy.needsUpdate=true;
var U={uRes:{value:new THREE.Vector2(1,1)},uC:{value:new THREE.Vector2(.7,0)},uL:{value:new THREE.Vector2(.2,0)},uTime:{value:0},uScroll:{value:0},uR:{value:.46},uRip:{value:0},uVid:{value:0},uVA:{value:1.7778},uTex:{value:dummy}};
var mat=new THREE.ShaderMaterial({vertexShader:VS,fragmentShader:(small?"":"#define HQ\n")+FS,uniforms:U,depthTest:false,depthWrite:false});
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));

var W=1,H=1,aspect=1,dprCap=small?1.5:2;
function layout(){
  W=hero.clientWidth;H=hero.clientHeight;aspect=W/H;
  var dpr=Math.min(devicePixelRatio||1,dprCap);
  renderer.setPixelRatio(dpr);renderer.setSize(W,H,false);
  var b=renderer.getDrawingBufferSize?renderer.getDrawingBufferSize(new THREE.Vector2()):new THREE.Vector2(W*dpr,H*dpr);
  U.uRes.value.set(b.x,b.y);
  if(aspect<1.1){U.uC.value.set(0,.2);U.uR.value=Math.min(.5,aspect*.6);}
  else{U.uC.value.set(Math.min(aspect*.44,1.1),.02);U.uR.value=.46;}
}
/* light / pointer */
var tgt=new THREE.Vector2(),cur=new THREE.Vector2(),last=new THREE.Vector2(),moved=false,speed=0;
function toWorld(cx,cy,out){var r=hero.getBoundingClientRect();out.set(((cx-r.left)/r.width*2-1)*aspect,-((cy-r.top)/r.height*2-1));}
var tmp=new THREE.Vector2();
function onMove(e){var t=e.touches?e.touches[0]:e;if(!t)return;toWorld(t.clientX,t.clientY,tmp);tgt.copy(tmp);moved=true;lastMove=performance.now();}
var lastMove=-1e9;
addEventListener("pointermove",onMove,{passive:true});
addEventListener("touchmove",onMove,{passive:true});addEventListener("touchstart",onMove,{passive:true});

/* scroll progress */
var prog=0,progT=0;
var _pf=/[?&]p=([\d.]+)/.exec(location.search);
function readScroll(){if(_pf){progT=+_pf[1];return;}var max=outer.offsetHeight-hero.clientHeight;progT=max>0?Math.min(1,Math.max(0,(window.scrollY-outer.offsetTop)/max)):0;}
var cap=hero.querySelector(".hero-cap"),content=hero.querySelector(".hero-in"),foot=hero.querySelector(".hero-foot");
function applyText(p){
  var o=Math.max(0,1-p/.2),y=-p*120;
  content.style.opacity=o;hero.style.setProperty("--g",o);content.style.transform="translate3d(0,"+y+"px,0)";
  if(foot)foot.style.opacity=Math.max(0,1-p/.1);
  if(cap){var co=Math.min(1,Math.max(0,(p-.82)/.14));cap.style.opacity=co;cap.style.transform="translate3d(0,"+((1-co)*18)+"px,0)";cap.style.visibility=co<=0?"hidden":"visible";cap.style.pointerEvents=co>.6?"auto":"none";}
  content.style.visibility=o<=0?"hidden":"visible";
}

/* optional video behind the lens */
var vtex=null,vel=null,vidOn=false;
var VID_START=0;var _vt=/vt=([\d.]+)/.exec(location.search);if(_vt)VID_START=+_vt[1];
function tryVideo(){
  if(reduce)return;
  var v=document.createElement("video");v.muted=true;v.defaultMuted=true;v.loop=false;v.playsInline=true;v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");v.setAttribute("muted","");v.preload="auto";v.crossOrigin="anonymous";
  var armed=false;
  function ok(){if(vidOn)return;vel=v;vtex=new THREE.Texture(v);vtex.minFilter=THREE.LinearFilter;vtex.magFilter=THREE.LinearFilter;vtex.generateMipmaps=false;U.uTex.value=vtex;vidOn=true;if(v.videoWidth)U.uVA.value=v.videoWidth/v.videoHeight;}
  function play(){var pr=v.play();if(pr&&pr.then){pr.then(ok).catch(arm);}else{ok();}}
  function arm(){ /* autoplay blocked: start on first gesture */
    if(armed)return;armed=true;
    var go=function(){["touchstart","pointerdown","keydown","scroll"].forEach(function(e){removeEventListener(e,go,true);});play();};
    ["touchstart","pointerdown","keydown","scroll"].forEach(function(e){addEventListener(e,go,{capture:true,passive:true});});
  }
  var triedFb=false;v.addEventListener("error",function(){if(small&&!triedFb){triedFb=true;v.src=HERO_VIDEO;v.load();return;}vidOn=false;});
  v.addEventListener("loadedmetadata",function(){try{v.currentTime=VID_START;}catch(e){}});
  /* loop only the cinematic range */
  v.addEventListener("timeupdate",function(){if(v.duration&&v.currentTime>=v.duration-.12){try{v.currentTime=VID_START;}catch(e){}v.play&&v.play().catch(function(){});}});
  v.addEventListener("ended",function(){try{v.currentTime=VID_START;}catch(e){}v.play().catch(function(){});});
  v.addEventListener("canplay",function(){if(v.currentTime<VID_START-.1){try{v.currentTime=VID_START;}catch(e){}}play();},{once:true});
  v.src=small?HERO_VIDEO_M:HERO_VIDEO;
}

/* loop control */
var running=false,visible=true,t0=performance.now(),raf=0,tt=0,lastT=performance.now();
function frame(now){
  raf=0;if(!running)return;
  var dt=Math.min(.05,(now-lastT)/1000);lastT=now;tt+=dt;
  readScroll();prog=_pf?progT:prog+(progT-prog)*(1-Math.exp(-dt*5));
  /* idle drift of the light, user pointer overrides */
  var idle=(now-lastMove)>3500;
  if(idle){var c=U.uC.value;tgt.set(c.x+Math.cos(tt*.17)*.55*aspect*.55-.05,c.y+Math.sin(tt*.13)*.3);}
  last.copy(cur);cur.x+=(tgt.x-cur.x)*(1-Math.exp(-dt*(idle?1.0:2.4)));cur.y+=(tgt.y-cur.y)*(1-Math.exp(-dt*(idle?1.0:2.4)));
  var sp=cur.distanceTo(last)/Math.max(dt,.001);speed+=(Math.min(1,sp*.5)-speed)*(1-Math.exp(-dt*3));
  U.uL.value.copy(cur);U.uRip.value=.25+speed;U.uTime.value=tt;U.uScroll.value=prog;
  if(vidOn&&vel&&vel.readyState>=2){vtex.needsUpdate=true;U.uVid.value+=(1-U.uVid.value)*(1-Math.exp(-dt*(/vidsnap/.test(location.search)?30:1.2)));if(/vidsnap/.test(location.search)&&!window._vl){window._vl=1;console.log("VIDEO LIVE "+vel.videoWidth+"x"+vel.videoHeight+" uVA="+U.uVA.value+" res="+U.uRes.value.x+"x"+U.uRes.value.y);}}
  applyText(prog);
  renderer.render(scene,cam);
  raf=requestAnimationFrame(frame);
}
function start(){if(running||reduce)return;running=true;lastT=performance.now();raf=requestAnimationFrame(frame);if(vel)vel.play&&vel.play().catch(function(){});}
function stop(){running=false;if(raf)cancelAnimationFrame(raf);raf=0;if(vel&&vel.pause)vel.pause();}
function evalRun(){if(visible&&!document.hidden&&!window.YR.modalOpen)start();else stop();}

layout();
var rt;addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){layout();if(reduce)still();},120);});
document.addEventListener("visibilitychange",evalRun);
addEventListener("yr-modal",evalRun);
if("IntersectionObserver" in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;evalRun();},{threshold:0}).observe(outer);}
cv.addEventListener("webglcontextlost",function(e){e.preventDefault();stop();fail();});

function still(){
  U.uTime.value=3.2;U.uScroll.value=.58;U.uL.value.set(U.uC.value.x-.12,U.uC.value.y+.08);U.uRip.value=.25;
  renderer.render(scene,cam);
}
if(reduce){root.classList.add("rm");still();}
else{tryVideo();evalRun();}
window.YR.heroDebug=function(p,x,y){/* test hook */prog=progT=p;if(x!=null){cur.set(x,y);tgt.set(x,y);lastMove=performance.now()+1e9;}};
})();

/* Hero WebGL scene: floating film frames (three.js r128, global THREE) */
(function(){
var root=document.documentElement;
function fail(){root.classList.add("nogl");}
var outer=document.getElementById("heroOuter"),hero=document.getElementById("hero"),cv=document.getElementById("gl"),tip=document.getElementById("tip"),hint=document.getElementById("hint");
if(typeof THREE==="undefined"||!window.YR){return fail();}
var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
var coarse=matchMedia("(pointer:coarse)").matches;
var small=Math.min(screen.width||9999,window.innerWidth)<=760||coarse;
var renderer;
try{renderer=new THREE.WebGLRenderer({canvas:cv,antialias:!small,alpha:true,powerPreference:"high-performance"});}catch(e){return fail();}
if(!renderer||!renderer.getContext()){return fail();}
renderer.setClearColor(0x000000,0);
var scene=new THREE.Scene();scene.fog=new THREE.Fog(0x0a0a0b,16,60);
var camera=new THREE.PerspectiveCamera(58,1,0.1,80);
var V=window.YR.V;
/* choose frames: fewer on mobile, spread across categories */
var order=[];for(var i=0;i<V.length;i++)order.push(i);
if(small){order=order.filter(function(_,k){return k%2===0||k===1;}).slice(0,10);}
var N=order.length;
var FW=3.2,FH=1.8;
var geo=new THREE.PlaneGeometry(FW,FH),bgeo=new THREE.PlaneGeometry(FW+0.14,FH+0.14);
function phTex(){var c=document.createElement("canvas");c.width=64;c.height=36;var g=c.getContext("2d"),gr=g.createLinearGradient(0,0,64,36);gr.addColorStop(0,"#2a1f10");gr.addColorStop(1,"#141416");g.fillStyle=gr;g.fillRect(0,0,64,36);var t=new THREE.CanvasTexture(c);return t;}
var ph=phTex();
var loader=new THREE.TextureLoader();loader.setCrossOrigin("anonymous");
var frames=[],meshes=[];
order.forEach(function(vi,k){
  var v=V[vi];
  var mat=new THREE.MeshBasicMaterial({map:ph,color:0x777777,transparent:true,fog:true});
  var m=new THREE.Mesh(geo,mat);
  var bm=new THREE.MeshBasicMaterial({color:0xd9a441,transparent:true,opacity:.25,fog:true});
  var b=new THREE.Mesh(bgeo,bm);b.position.z=-0.01;m.add(b);
  m.userData.i=k;scene.add(m);meshes.push(m);
  var f={m:m,mat:mat,bm:bm,v:v,k:k,hov:0,ph:k*1.7,ang:k*2.399,ring:k%3,tex:false};
  frames.push(f);
  loader.load("https://i.ytimg.com/vi/"+v[0]+"/hqdefault.jpg",function(t){
    t.minFilter=THREE.LinearFilter;t.generateMipmaps=false;t.repeat.set(1,.75);t.offset.set(0,.125);t.encoding=THREE.sRGBEncoding;
    mat.map=t;mat.needsUpdate=true;f.tex=true;f.fade=0;dirty();
  },undefined,function(){});
});
renderer.outputEncoding=THREE.sRGBEncoding;
/* gold dust */
var PN=small?140:380,pp=new Float32Array(PN*3),pv=[];
for(var j=0;j<PN;j++){pp[j*3]=(Math.random()-.5)*34;pp[j*3+1]=(Math.random()-.5)*20;pp[j*3+2]=-Math.random()*42+6;pv.push(.1+Math.random()*.35);}
var pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pp,3));
var dot=(function(){var c=document.createElement("canvas");c.width=c.height=32;var g=c.getContext("2d"),gr=g.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,"rgba(255,225,150,1)");gr.addColorStop(1,"rgba(217,164,65,0)");g.fillStyle=gr;g.fillRect(0,0,32,32);return new THREE.CanvasTexture(c);})();
var pts=new THREE.Points(pg,new THREE.PointsMaterial({map:dot,size:.28,transparent:true,opacity:.8,depthWrite:false,blending:THREE.AdditiveBlending,color:0xd9a441}));
scene.add(pts);
/* warm glow far behind */
var glow=new THREE.Mesh(new THREE.PlaneGeometry(40,26),new THREE.MeshBasicMaterial({map:(function(){var c=document.createElement("canvas");c.width=c.height=128;var g=c.getContext("2d"),gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,"rgba(217,164,65,.5)");gr.addColorStop(1,"rgba(217,164,65,0)");g.fillStyle=gr;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);})(),transparent:true,depthWrite:false,fog:false,blending:THREE.AdditiveBlending,opacity:.35}));
glow.position.set(5,3,-40);scene.add(glow);

/* state */
var W=1,H=1,aspect=1,cols=5,fs=1;
var mx=0,my=0,cx=0,cy=0,drag=0,dragT=0,dragging=false,ptr={x:-1e4,y:-1e4,in:false,moved:false,type:"mouse"};
var drift=0,e=0,eS=0,hoverK=-1,last=0,running=false,inView=true;
var ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function cl(x,a,b){return Math.max(a,Math.min(b,x));}
function ss(a,b,x){x=cl((x-a)/(b-a),0,1);return x*x*(3-2*x);}
function resize(){
  W=hero.clientWidth||innerWidth;H=hero.clientHeight||innerHeight;aspect=W/H;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,small?1.75:2));
  renderer.setSize(W,H,false);camera.aspect=aspect;camera.updateProjectionMatrix();
  cols=aspect<.9?3:(aspect<1.3?4:5);fs=aspect<.9?.55:(aspect<1.3?.8:.95);
  dirty();
}
var ZR=42;
function layout(f,t){ /* scatter pos + wall pos blended by e */
  var xs=cl(aspect/1.6,.4,1.15),ys=aspect<1?1.55:1;
  var rx=(3.6+f.ring*2.3)*xs,ry=(2.2+f.ring*1.2)*ys;
  var z=4-((f.k*ZR/N+drift)%ZR);
  var sx=Math.cos(f.ang)*rx,sy=Math.sin(f.ang)*ry+Math.sin(t*.5+f.ph)*.18,sz=z;
  var col=f.k%cols,row=Math.floor(f.k/cols),rows=Math.ceil(N/cols),cnt=Math.min(cols,N-row*cols);
  var sp=(FW*fs+.25),cc=col-(cnt-1)/2;
  var wx=cc*sp,wy=((rows-1)/2-row)*(FH*fs+.25)+(aspect<1?-.2:-.4),wz=-12+Math.abs(cc)*.5;
  return {x:sx+(wx-sx)*e,y:sy+(wy-sy)*e,z:sz+(wz-sz)*e,ry:(-sx*.035)*(1-e)+(-cc*.1)*e,sc:fs};
}
function update(dt,t){
  var p=0;
  if(!reduce){var r=outer.getBoundingClientRect(),run=outer.offsetHeight-innerHeight;p=run>0?cl(-r.top/run,0,1):0;}
  e=ss(0,.85,p);eS+=(e-eS)*(dt?cl(dt*4,0,1):1);if(!dt)eS=e;var ee=eS;
  var se=e;e=ee;
  drift+=dt*1.1*(1-ee);
  cx+=(mx*1.1-cx)*.05;cy+=(my*.6-cy)*.05;
  if(!dragging)dragT*=.94;drag+=(dragT-drag)*.12;
  var camZ=6-4.6*ee;
  camera.position.set(cx+drag*.15,cy,camZ);
  camera.lookAt(mx*3+drag,my*1.6,camZ-20);
  /* hover raycast (mouse only; touch taps resolved on release) */
  var hk=-1;
  if(ptr.in&&ptr.type==="mouse"&&!dragging){ndc.set(ptr.x/W*2-1,-(ptr.y/H)*2+1);camera.updateMatrixWorld();ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(meshes,false);if(h.length)hk=h[0].object.userData.i;}
  if(hk!==hoverK){hoverK=hk;cv.classList.toggle("hov",hk>=0);
    if(hk>=0){tip.innerHTML="<small>"+frames[hk].v[2]+"</small>"+frames[hk].v[3]+"  ▶";tip.style.opacity=1;}else tip.style.opacity=0;}
  if(hk>=0){tip.style.left=(ptr.x+hero.getBoundingClientRect().left)+"px";tip.style.top=(ptr.y+hero.getBoundingClientRect().top)+"px";}
  for(var i=0;i<frames.length;i++){var f=frames[i],L=layout(f,t);
    f.hov+=((i===hoverK?1:0)-f.hov)*(dt?cl(dt*9,0,1):1);
    var s=L.sc*(1+f.hov*.28);
    f.m.position.set(L.x,L.y,L.z+f.hov*1.2);f.m.rotation.y=L.ry*(1-f.hov);f.m.rotation.z=Math.sin(t*.3+f.ph)*.025*(1-ee);
    f.m.scale.set(s,s,1);
    var dist=camera.position.z-L.z,near=cl((dist-1.6)/3.5,0,1);
    if(f.fade<1&&f.tex)f.fade=Math.min(1,f.fade+dt*1.5||1);
    var base=f.tex?.8:.35;
    f.mat.color.setScalar(base+(1-base)*f.hov);
    f.mat.opacity=near*(f.tex?Math.max(f.fade,.25):.5);
    f.bm.opacity=near*(.22+.78*f.hov);
  }
  /* dust */
  var a=pg.attributes.position.array;for(var q=0;q<PN;q++){a[q*3+1]+=pv[q]*dt;a[q*3]+=Math.sin(t*.4+q)*dt*.05;if(a[q*3+1]>10)a[q*3+1]=-10;}
  pg.attributes.position.needsUpdate=true;
  pts.rotation.y=mx*.05;
  /* text fade as the scene takes over */
  var o=1-ss(.08,.42,p);var w=hero.querySelector(".wrap");w.style.opacity=o;w.style.visibility=o<.02?"hidden":"visible";
  hint.style.opacity=p<.05?1:0;
  e=se;
}
function render(){renderer.render(scene,camera);}
function shouldRun(){return inView&&!document.hidden&&!window.YR.modalOpen&&!reduce;}
function loop(ts){
  if(!shouldRun()){running=false;return;}
  requestAnimationFrame(loop);
  var dt=Math.min((ts-last)/1000,.05);last=ts;update(dt,ts/1000);render();
}
function kick(){if(shouldRun()&&!running){running=true;last=performance.now();requestAnimationFrame(loop);}}
function dirty(){if(reduce){update(0,0);render();}else kick();}
/* visibility */
if("IntersectionObserver" in window){new IntersectionObserver(function(es){inView=es[0].isIntersecting;kick();},{threshold:0}).observe(outer);}
document.addEventListener("visibilitychange",kick);window.addEventListener("yr-modal",kick);
window.addEventListener("resize",resize);if("ResizeObserver" in window)new ResizeObserver(resize).observe(hero);
/* pointer */
var down=null;
function pos(ev){var r=cv.getBoundingClientRect();ptr.x=ev.clientX-r.left;ptr.y=ev.clientY-r.top;}
cv.addEventListener("pointermove",function(ev){
  pos(ev);ptr.in=true;ptr.type=ev.pointerType;
  if(ev.pointerType==="mouse"&&!down){mx=ptr.x/W*2-1;my=-(ptr.y/H*2-1);}
  if(down){var dx=ev.clientX-down.x;if(Math.abs(dx)>6){dragging=true;}
    if(dragging){dragT=cl(down.d-dx*.035,-9,9);if(ev.pointerType==="mouse"){my=cl(-(ptr.y/H*2-1),-1,1);}}}
  if(reduce)dirty();
});
cv.addEventListener("pointerdown",function(ev){pos(ev);ptr.type=ev.pointerType;down={x:ev.clientX,y:ev.clientY,t:performance.now(),d:dragT};dragging=false;ptr.in=true;try{cv.setPointerCapture(ev.pointerId);}catch(_){}});
function pick(){ndc.set(ptr.x/W*2-1,-(ptr.y/H)*2+1);camera.updateMatrixWorld();ray.setFromCamera(ndc,camera);var h=ray.intersectObjects(meshes,false);return h.length?h[0].object.userData.i:-1;}
cv.addEventListener("pointerup",function(ev){
  if(!down)return;pos(ev);var moved=Math.hypot(ev.clientX-down.x,ev.clientY-down.y),dt=performance.now()-down.t;down=null;
  var wasDrag=dragging;dragging=false;
  if(moved<10&&dt<600&&!wasDrag){var k=pick();if(k>=0){window.YR.open(order[k]);}}
  if(ev.pointerType!=="mouse"){ptr.in=false;}
});
cv.addEventListener("pointercancel",function(){down=null;dragging=false;});
cv.addEventListener("pointerleave",function(ev){if(ev.pointerType==="mouse"){ptr.in=false;mx=0;my=0;}if(reduce)dirty();});
window.addEventListener("scroll",function(){if(reduce)return;if(!running)kick();},{passive:true});
hint.textContent=coarse?"드래그해서 둘러보고, 프레임을 눌러 재생":"프레임에 마우스를 올려보세요 · 클릭하면 재생";
/* context loss */
cv.addEventListener("webglcontextlost",function(ev){ev.preventDefault();running=false;},false);
cv.addEventListener("webglcontextrestored",function(){dirty();});
resize();dirty();
window.__yr={frames:frames,renderer:renderer,get running(){return running;}};
})();

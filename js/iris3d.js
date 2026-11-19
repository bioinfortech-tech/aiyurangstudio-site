/* WebGL iris (three.js r160, loaded lazily). Replaces the SVG iris when WebGL works; otherwise the SVG version stays.
   - 7 curved blades with thickness and bevel, pivoting on pins (real rotation, not scaling), dark anodized brushed metal
   - machined housing ring with engraved scale + knurled outer band, RoomEnvironment reflections, soft shadows
   - the studio reel (existing <video>) is a VideoTexture plane behind the aperture, glass sheen on top
   - scroll sets the target aperture; the render follows with critically-damped smoothing; the blink between sections is time based */
(function(){
"use strict";
var root=document.documentElement;
var chap=document.getElementById("chap");if(!chap)return;
var cs=chap.querySelector(".cs"),video=chap.querySelector(".wv");
if(!cs||!video)return;
try{var tc=document.createElement("canvas");if(!(tc.getContext("webgl2")||tc.getContext("webgl")))return;}catch(e){return;}
var reduce=root.classList.contains("rm")||(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);

Promise.all([import("three"),import("three/addons/environments/RoomEnvironment.js")]).then(function(m){
  try{start(m[0],m[1].RoomEnvironment);}catch(e){fail(e);}
}).catch(fail);
function fail(e){root.classList.remove("gl3d");window.YR_I3=null;if(window.console&&console.info)console.info("iris3d: using SVG fallback",e&&e.message);}

function start(THREE,RoomEnvironment){
  /* the close/reopen blink was removed on request; flip YR_FLAGS.irisBlink to bring it back */
  var FLAGS={irisBlink:false};if(window.YR_FLAGS){for(var fk in window.YR_FLAGS)FLAGS[fk]=window.YR_FLAGS[fk];}
  var canvas=document.createElement("canvas");canvas.className="gl3";canvas.setAttribute("aria-hidden","true");
  cs.insertBefore(canvas,cs.querySelector(".dk"));
  var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:"high-performance",stencil:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000,0);
  var scene=new THREE.Scene();
  var pm=new THREE.PMREMGenerator(renderer);
  scene.environment=pm.fromScene(new RoomEnvironment(),.035).texture;
  scene.environmentIntensity=1;
  var FOV=28,DIST=9;
  var camera=new THREE.PerspectiveCamera(FOV,1,.1,60);camera.position.set(0,0,DIST);

  /* ---- lights ---- */
  var key=new THREE.DirectionalLight(0xfff6ea,1.55);key.position.set(-3.6,4.4,4.2);key.castShadow=true;
  key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-1.5;key.shadow.camera.right=1.5;key.shadow.camera.top=1.5;key.shadow.camera.bottom=-1.5;
  key.shadow.camera.near=2;key.shadow.camera.far=14;key.shadow.bias=-.0002;key.shadow.normalBias=.006;
  scene.add(key);scene.add(key.target);
  var rim=new THREE.DirectionalLight(0xdfe7ff,1.0);rim.position.set(4.5,.8,2.2);scene.add(rim);
  var rim2=new THREE.DirectionalLight(0xffffff,.45);rim2.position.set(.5,-4,2.5);scene.add(rim2);

  var iris=new THREE.Group();scene.add(iris);
  /* everything inside the housing is clipped to the aperture circle with the stencil buffer */
  var mask=new THREE.Mesh(new THREE.CircleGeometry(.94,128),new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:false,stencilWrite:true,stencilRef:1,stencilFunc:THREE.AlwaysStencilFunc,stencilZPass:THREE.ReplaceStencilOp}));
  mask.renderOrder=-10;iris.add(mask);
  function clip(m){m.stencilWrite=true;m.stencilRef=1;m.stencilFunc=THREE.EqualStencilFunc;m.stencilFail=THREE.KeepStencilOp;m.stencilZFail=THREE.KeepStencilOp;m.stencilZPass=THREE.KeepStencilOp;return m;}

  /* ---- procedural textures ---- */
  function lineTex(w,h,vertical,n,seed){
    var c=document.createElement("canvas");c.width=w;c.height=h;var x=c.getContext("2d");
    x.fillStyle="#808080";x.fillRect(0,0,w,h);
    var s=seed||1;function r(){s=(s*16807)%2147483647;return s/2147483647;}
    for(var i=0;i<n;i++){
      var v=100+Math.floor(r()*110);x.fillStyle="rgba("+v+","+v+","+v+","+(.12+r()*.22)+")";
      if(vertical)x.fillRect(Math.floor(r()*w),0,1+Math.floor(r()*2),h);else x.fillRect(0,Math.floor(r()*h),w,1+Math.floor(r()*2));
    }
    var t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;
  }
  var brush=lineTex(1024,1024,false,3200,7);brush.repeat.set(1.3,1.3);
  var turn=lineTex(64,1024,false,2600,19);turn.repeat.set(1,2);
  var knurlC=document.createElement("canvas");knurlC.width=1024;knurlC.height=8;
  (function(){var x=knurlC.getContext("2d"),n=340;for(var i=0;i<n;i++){var g=x.createLinearGradient(i*1024/n,0,(i+1)*1024/n,0);g.addColorStop(0,"#181818");g.addColorStop(.5,"#dcdcdc");g.addColorStop(1,"#181818");x.fillStyle=g;x.fillRect(i*1024/n,0,1024/n+1,8);}})();
  var knurl=new THREE.CanvasTexture(knurlC);knurl.wrapS=THREE.RepeatWrapping;knurl.colorSpace=THREE.NoColorSpace;

  /* ---- blades ---- */
  var NB=7,PX=.55,PY=1.0,D0=.96,BULGE=.03,AMAX=D0-BULGE;
  function bladeShape(){
    var s=new THREE.Shape();
    function P(x,y){return [x-PX,y-PY];}
    var a=P(-1.7,D0),b=P(-1.0,D0),c=P(1.0,D0),d=P(1.7,D0),e=P(1.7,1.6),f=P(-1.7,1.6);
    s.moveTo(a[0],a[1]);s.lineTo(b[0],b[1]);
    var cp=P(0,D0-BULGE*2);s.quadraticCurveTo(cp[0],cp[1],c[0],c[1]);
    s.lineTo(d[0],d[1]);s.lineTo(e[0],e[1]);s.lineTo(f[0],f[1]);s.lineTo(a[0],a[1]);
    return s;
  }
  /* aperture (apothem) -> blade angle: d(phi)=D0-BULGE - PX*sin(phi) - PY*(1-cos(phi)), solved with a lookup table */
  var LUT=[],LN=512,PHIMAX=1.18;
  (function(){for(var i=0;i<=LN;i++){var ph=PHIMAX*i/LN;LUT.push(AMAX-PX*Math.sin(ph)-PY*(1-Math.cos(ph)));}})();
  function phiFor(a){
    if(a>=LUT[0])return 0;if(a<=LUT[LN])return PHIMAX;
    var lo=0,hi=LN;while(hi-lo>1){var m=(lo+hi)>>1;if(LUT[m]>a)lo=m;else hi=m;}
    var t=(LUT[lo]-a)/(LUT[lo]-LUT[hi]);return PHIMAX*(lo+t)/LN;
  }
  var bladeGeo=new THREE.ExtrudeGeometry(bladeShape(),{depth:.006,bevelEnabled:true,bevelThickness:.0034,bevelSize:.0055,bevelSegments:3,curveSegments:24});
  var bladeMat=clip(new THREE.MeshPhysicalMaterial({color:0x2a2c32,metalness:.92,roughness:.44,roughnessMap:brush,bumpMap:brush,bumpScale:.08,clearcoat:0,anisotropy:.6,anisotropyRotation:0,envMapIntensity:1.5}));
  /* per-blade read: bright machined edge, darker toward the outside, so the overlapping leaves separate */
  bladeMat.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vLY;').replace('#include <begin_vertex>','#include <begin_vertex>\nvLY=position.y+'+PY.toFixed(3)+'-'+D0.toFixed(3)+';');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying float vLY;').replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb*=mix(1.25,.55,smoothstep(0.,.55,vLY));').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.075,.08,.09)*(1.-smoothstep(0.,.05,vLY))*step(-.02,vLY);');
  };
  var LAYER=[0,1,2,3,4,5,6],Z0=-.04,DZ=.019;
  var blades=[],holders=[];
  for(var k=0;k<NB;k++){
    var holder=new THREE.Group();holder.rotation.z=k*2*Math.PI/NB;iris.add(holder);
    var mesh=new THREE.Mesh(bladeGeo,bladeMat);mesh.position.set(PX,PY,Z0+LAYER[k]*DZ);mesh.castShadow=true;mesh.receiveShadow=true;
    holder.add(mesh);blades.push(mesh);holders.push(holder);
  }
  /* ---- housing ---- */
  var ringPts=[[.93,-.07],[.93,.035],[.955,.065],[1.0,.074],[1.075,.074],[1.115,.062],[1.14,.03],[1.14,-.07]].map(function(p){return new THREE.Vector2(p[0],p[1]);});
  ringPts.reverse();var ringGeo=new THREE.LatheGeometry(ringPts,160);
  var ringMat=new THREE.MeshPhysicalMaterial({color:0x24262b,metalness:1,roughness:.38,roughnessMap:turn,bumpMap:turn,bumpScale:.5,anisotropy:.65,anisotropyRotation:Math.PI/2,clearcoat:0,envMapIntensity:.95});
  ringMat.side=THREE.DoubleSide;var ring=new THREE.Mesh(ringGeo,ringMat);ring.rotation.x=Math.PI/2;ring.castShadow=true;ring.receiveShadow=true;iris.add(ring);
  var kn=new THREE.Mesh(new THREE.CylinderGeometry(1.143,1.143,.13,180,1,true),new THREE.MeshPhysicalMaterial({color:0x3a3d44,metalness:1,roughness:.5,bumpMap:knurl,bumpScale:1.0,clearcoat:0,envMapIntensity:1.0,side:THREE.DoubleSide}));
  kn.rotation.x=Math.PI/2;kn.position.z=-.005;iris.add(kn);
  /* satin titanium inner ring between housing and blades, plus a thin bright chamfer line on the outer edge */
  var inPts=[[.915,-.03],[.915,.04],[.935,.062],[.962,.062],[.962,-.03]].map(function(p){return new THREE.Vector2(p[0],p[1]);});inPts.reverse();
  var inRing=new THREE.Mesh(new THREE.LatheGeometry(inPts,160),new THREE.MeshPhysicalMaterial({color:0x4f5259,metalness:1,roughness:.46,roughnessMap:turn,bumpMap:turn,bumpScale:.4,anisotropy:.6,anisotropyRotation:Math.PI/2,envMapIntensity:.5,side:THREE.DoubleSide}));
  inRing.rotation.x=Math.PI/2;inRing.receiveShadow=true;iris.add(inRing);
  var chPts=[[1.108,.066],[1.128,.05],[1.138,.03]].map(function(p){return new THREE.Vector2(p[0],p[1]);});chPts.reverse();
  var chRing=new THREE.Mesh(new THREE.LatheGeometry(chPts,160),new THREE.MeshPhysicalMaterial({color:0x70737b,metalness:1,roughness:.38,envMapIntensity:.6,side:THREE.DoubleSide}));
  chRing.rotation.x=Math.PI/2;chRing.position.z=.0008;iris.add(chRing);
  /* engraved scale on the ring face */
  var eg=document.createElement("canvas");eg.width=eg.height=2048;
  (function(){
    var x=eg.getContext("2d"),c=1024;x.clearRect(0,0,2048,2048);x.translate(c,c);
    var rOut=c*1.075/1.14,rIn=c*1.0/1.14;
    for(var i=0;i<60;i++){var a=i/60*Math.PI*2,long=i%5===0,mid=i%5===0;x.save();x.rotate(a);x.fillStyle="rgba(222,225,231,.92)";x.shadowColor="rgba(0,0,0,.8)";x.shadowOffsetY=2;x.shadowBlur=2;
      var L=long?26:mid?19:12,W=long?5:3;x.fillRect(-W/2,-(rOut-3),W,L);x.restore();}
    x.font="700 33px Pretendard Variable, Pretendard, sans-serif";x.fillStyle="rgba(228,231,236,.95)";x.shadowColor="rgba(0,0,0,.85)";x.shadowOffsetY=2;x.shadowBlur=2;x.textAlign="center";x.textBaseline="middle";
    var label="YURANGSTUDIO",rt=rIn+24;
    for(var j=0;j<label.length;j++){var ang=(j-(label.length-1)/2)*.07;x.save();x.rotate(ang);x.translate(0,-rt);x.fillText(label[j],0,0);x.restore();}
  })();
  var egTex=new THREE.CanvasTexture(eg);egTex.colorSpace=THREE.SRGBColorSpace;egTex.anisotropy=8;
  var egMesh=new THREE.Mesh(new THREE.CircleGeometry(1.14,128),new THREE.MeshBasicMaterial({map:egTex,transparent:true,depthWrite:false,toneMapped:false,opacity:1}));
  egMesh.position.z=.0752;iris.add(egMesh);

  /* ---- video + shadow catcher + glass ---- */
  var vtex=new THREE.VideoTexture(video);vtex.colorSpace=THREE.SRGBColorSpace;vtex.minFilter=THREE.LinearFilter;vtex.magFilter=THREE.LinearFilter;vtex.generateMipmaps=false;
  var pTex=new THREE.TextureLoader().load((window.YR_ROOT||"")+"media/promo_poster.jpg");pTex.colorSpace=THREE.SRGBColorSpace;
  var vmat=clip(new THREE.MeshBasicMaterial({map:pTex,toneMapped:false,color:0xffffff}));
  (function(){var a=16/9;pTex.repeat.set(1/a,1);pTex.offset.set((1-1/a)/2,0);})();
  /* poster stands in until the film actually plays, so the aperture is never a black hole */
  video.addEventListener("playing",function(){vmat.map=vtex;vmat.needsUpdate=true;});
  var vplane=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),vmat);vplane.position.z=-.14;iris.add(vplane);
  /* soft crossfade between clips: a snapshot of the outgoing frame fades away over the incoming one */
  var snapC=document.createElement("canvas");snapC.width=snapC.height=512;var snapCtx=snapC.getContext("2d");
  var snapTex=new THREE.CanvasTexture(snapC);snapTex.colorSpace=THREE.SRGBColorSpace;
  var snapMat=clip(new THREE.MeshBasicMaterial({map:snapTex,transparent:true,opacity:0,toneMapped:false,depthWrite:false}));
  var snap=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),snapMat);snap.position.z=-.135;iris.add(snap);
  var fade={on:false,t0:0};
  function startFade(idx,now){
    var vw=video.videoWidth,vh=video.videoHeight,ok=false;
    if(vw&&vh&&video.readyState>=2){
      var sx=0,sy=0,sw=vw,sh=vh;if(vw>vh){sx=(vw-vh)/2;sw=vh;}else{sy=(vh-vw)/2;sh=vw;}
      try{snapCtx.drawImage(video,sx,sy,sw,sh,0,0,512,512);snapTex.needsUpdate=true;ok=true;}catch(e){}
    }
    if(window.YR_SH)window.YR_SH.setSeg(idx);shownIdx=idx;
    if(ok){fade.on=true;fade.t0=now;snapMat.opacity=1;}
  }
  function updateFade(now){
    if(!fade.on)return;
    var e=now-fade.t0-140;if(e<=0){snapMat.opacity=1;return;}
    var t=e/620;if(t>=1){fade.on=false;snapMat.opacity=0;return;}
    snapMat.opacity=1-(t*t*(3-2*t));
  }
  function fitVideo(){var vw=video.videoWidth,vh=video.videoHeight;if(!vw||!vh)return;var a=vw/vh;if(a>1){vtex.repeat.set(1/a,1);vtex.offset.set((1-1/a)/2,0);}else{vtex.repeat.set(1,a);vtex.offset.set(0,(1-a)/2);}}
  video.addEventListener("loadedmetadata",fitVideo);fitVideo();
  var catcher=new THREE.Mesh(new THREE.PlaneGeometry(2.4,2.4),clip(new THREE.ShadowMaterial({opacity:.62})));catcher.position.z=-.1;catcher.receiveShadow=true;iris.add(catcher);
  /* inner wall darkening around the aperture (ambient-occlusion feel) */
  var aoC=document.createElement("canvas");aoC.width=aoC.height=512;
  (function(){var x=aoC.getContext("2d"),g=x.createRadialGradient(256,256,150,256,256,256);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(.72,"rgba(0,0,0,.18)");g.addColorStop(1,"rgba(0,0,0,.62)");x.fillStyle=g;x.fillRect(0,0,512,512);})();
  var aoTex=new THREE.CanvasTexture(aoC);
  var ao=new THREE.Mesh(new THREE.CircleGeometry(.95,96),clip(new THREE.MeshBasicMaterial({map:aoTex,transparent:true,depthWrite:false,toneMapped:false})));ao.position.z=-.09;iris.add(ao);
  var glassMat=clip(new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uSheen:{value:0},uA:{value:.3}},
    vertexShader:"varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:"varying vec2 vP;uniform float uSheen;uniform float uA;void main(){float r=length(vP)/.93;float vig=smoothstep(.55,1.,r)*.2;"+
      "float d=dot(vP,normalize(vec2(1.,.55)))-uSheen;float band=exp(-d*d*9.)*.2+exp(-(d-.55)*(d-.55)*40.)*.08;"+
      "float spec=exp(-length(vP-vec2(-.42,.46))*5.)*.12;float edge=smoothstep(.9,1.,r)*.25;"+
      "vec3 col=mix(vec3(0.),vec3(.86,.9,1.),clamp((band+spec+edge)/(vig+band+spec+edge+.0001),0.,1.));float a=clamp(vig+band+spec+edge,0.,.8);gl_FragColor=vec4(col,a);}"}));
  var glass=new THREE.Mesh(new THREE.CircleGeometry(.93,96),glassMat);glass.position.z=.1;iris.add(glass);
  /* soft drop shadow behind the whole mechanism */
  var shC=document.createElement("canvas");shC.width=shC.height=256;
  (function(){var x=shC.getContext("2d"),g=x.createRadialGradient(128,128,40,128,128,128);g.addColorStop(0,"rgba(0,0,0,.55)");g.addColorStop(.6,"rgba(0,0,0,.22)");g.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=g;x.fillRect(0,0,256,256);})();
  var shTex=new THREE.CanvasTexture(shC);
  var drop=new THREE.Mesh(new THREE.PlaneGeometry(3.3,3.3),new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,toneMapped:false,opacity:.62}));
  drop.position.set(.1,-.32,-.6);iris.add(drop);

  /* ---- state / smoothing ---- */
  var HSA=[.46,.63,.75,.83,.88],AMIN=.025;
  var S={U:0,ccx:0,ccy:0,D:520,W:1,H:1,smax:3};
  var cur={a:HSA[0],dive:0,ry:0,rx:0,sheen:-.6},vel={a:0,dive:0,ry:0,rx:0};
  var blink={on:false,t0:0,idx:0,committed:false,c:1},shownIdx=0,intro=true;
  function sd(c,t,v,st,dt){var o=2/st,x=o*dt,e=1/(1+x+.48*x*x+.235*x*x*x),ch=c-t,tmp=(v+o*ch)*dt;return[t+(ch+tmp)*e,(v-o*tmp)*e];}
  function cl(v,a,b){return v<a?a:v>b?b:v;}
  function ss(a,b,v){var t=cl((v-a)/(b-a),0,1);return t*t*(3-2*t);}
  function eIn(t){return t*t;}function eOut(t){t=1-t;return 1-t*t*t;}
  function targetA(U){
    if(U>=5)return HSA[4];
    var i=Math.floor(U),f=U-i;if(i>=4)return HSA[4];
    return HSA[i]+(HSA[i+1]-HSA[i])*ss(0,1,f);
  }
  var size={w:0,h:0};
  function resize(){
    var w=cs.clientWidth,h=cs.clientHeight;if(!w||!h)return;
    if(w===size.w&&h===size.h)return;size.w=w;size.h=h;S.W=w;S.H=h;
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  var wpp=1;
  function place(){
    wpp=2*Math.tan(FOV*Math.PI/360)*DIST/S.H;
    var e=ss(0,1,cur.dive),e2=e*e*(3-2*e);
    var base=(S.D/2)/1.14*wpp;
    var apo=AMAX*(S.D/2)/1.14;
    var smax=(Math.hypot(S.W,S.H)/2*1.06)/apo;
    var sc=base*(1+(smax-1)*e2);
    var cx=S.ccx+(S.W/2-S.ccx)*e2,cy=S.ccy+(S.H/2-S.ccy)*e2;
    iris.position.set((cx-S.W/2)*wpp,-(cy-S.H/2)*wpp,0);
    iris.scale.setScalar(sc);
    iris.rotation.y=(cur.ry)*Math.PI/180*(1-e2);iris.rotation.x=(cur.rx)*Math.PI/180*(1-e2);
  }
  function setBlades(a){
    var phi=phiFor(a);
    for(var i=0;i<NB;i++)blades[i].rotation.z=phi;
  }
  /* ---- time-based blink at section changes ---- */
  var CL=150,HOLD=40,OP=340;
  function startBlink(idx,now){blink.on=true;blink.t0=now;blink.idx=idx;blink.committed=false;}
  function blinkC(now){
    if(!blink.on)return 0;
    var e=now-blink.t0;
    if(e<CL)return eIn(e/CL);
    if(e<CL+HOLD)return 1;
    if(!blink.committed){blink.committed=true;shownIdx=blink.idx;if(window.YR_SH)window.YR_SH.setSeg(shownIdx);}
    var o=(e-CL-HOLD)/OP;if(o>=1){blink.on=false;return 0;}
    return 1-eOut(o);
  }
  var lastIdx=-1,t0=performance.now(),visible=false,running=false,raf=0,last=performance.now();
  function frame(now){
    raf=0;if(!running)return;
    var dt=Math.min(.05,(now-last)/1000);last=now;if(dt<=0)dt=.016;
    resize();
    var U=reduce?4.5:S.U;
    var idx=Math.min(4,Math.floor(U+(U>lastIdx?.001:-.001)));if(idx<0)idx=0;
    if(!reduce&&lastIdx>=0&&idx!==lastIdx&&U<5){if(FLAGS.irisBlink)startBlink(idx,now);else startFade(idx,now);}
    if(U>=5&&lastIdx!==4){/* dive: stay on the last clip */}
    if(lastIdx<0){if(FLAGS.irisBlink&&!reduce){blink.on=true;blink.t0=now-CL-HOLD;blink.committed=false;blink.idx=idx;shownIdx=idx;if(window.YR_SH)window.YR_SH.setSeg(idx);}else{shownIdx=idx;if(window.YR_SH)window.YR_SH.setSeg(idx);}}
    if(U<5)lastIdx=idx;else lastIdx=4;
    var ta=targetA(U),td=reduce?0:ss(5,5.8,U);
    var tr=reduce?-6:Math.sin(U*1.3)*7,tx=reduce?3:-Math.cos(U*.9)*4;
    var r;
    r=sd(cur.a,ta,vel.a,.16,dt);cur.a=r[0];vel.a=r[1];
    r=sd(cur.dive,td,vel.dive,.18,dt);cur.dive=r[0];vel.dive=r[1];
    r=sd(cur.ry,tr,vel.ry,.4,dt);cur.ry=r[0];vel.ry=r[1];
    r=sd(cur.rx,tx,vel.rx,.4,dt);cur.rx=r[0];vel.rx=r[1];
    var c=FLAGS.irisBlink?blinkC(now):0;updateFade(now);
    var a=cur.a*(1-c)+AMIN*c;
    if(cur.dive>.001){a=cur.a+(AMAX-cur.a)*ss(0,.7,cur.dive);}
    setBlades(a);
    cur.sheen=-.9+U*.34;glassMat.uniforms.uSheen.value=cur.sheen;
    place();
    renderer.render(scene,camera);
    raf=requestAnimationFrame(frame);
  }
  function evalRun(){
    var want=visible&&!document.hidden;
    if(want&&!running){running=true;last=performance.now();raf=requestAnimationFrame(frame);}
    else if(!want&&running){running=false;if(raf)cancelAnimationFrame(raf);raf=0;}
  }
  if("IntersectionObserver" in window)new IntersectionObserver(function(es){visible=es[0].isIntersecting;evalRun();},{rootMargin:"20% 0px 20% 0px"}).observe(chap);else{visible=true;evalRun();}
  document.addEventListener("visibilitychange",evalRun);
  addEventListener("resize",resize,{passive:true});
  canvas.addEventListener("webglcontextlost",function(e){e.preventDefault();running=false;root.classList.remove("gl3d");window.YR_I3=null;});

  /* ---- hook for shutter.js ---- */
  window.YR_I3={
    frame:function(p){S.U=p.U;S.ccx=p.ccx;S.ccy=p.ccy;S.D=p.D;S.W=p.W;S.H=p.H;},
    ready:true
  };
  root.classList.add("gl3d");
  resize();
  if(window.YR_SH&&window.YR_SH.refresh)window.YR_SH.refresh();
  /* settle the first frame immediately */
  place();setBlades(cur.a);renderer.render(scene,camera);
}
})();

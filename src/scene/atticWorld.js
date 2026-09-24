import * as THREE from 'three';
import { publicUrl } from '../lib/publicUrl';
import { tourRoutes, measureTour, sampleTour } from './tour.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

// One continuous, deliberately open attic. The camera travels between physical stations.
export function createAtticWorld(host, { page, onReady, onFailure }) {
  const mobile = innerWidth < 800;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.setClearColor(0x080e18);
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080e18, .027);
  const camera = new THREE.PerspectiveCamera(mobile ? 63 : 48, 1, .1, 125);
  let elapsed = 0;
  const composer = mobile ? null : new EffectComposer(renderer, new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,samples:4}));
  let bloom;
  if(composer){composer.addPass(new RenderPass(scene,camera));bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.28,.6,.85);composer.addPass(bloom);composer.addPass(new OutputPass());}
  const render=()=>composer?composer.render():renderer.render(scene,camera);
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const environmentMap = pmrem.fromScene(environment, .05);
  scene.environment = environmentMap.texture;
  scene.environmentIntensity = .28;
  environment.dispose(); pmrem.dispose();
  const textures = [], animated = [], geometries = new Set(), materials = new Set();
  const v = (...xyz) => new THREE.Vector3(...xyz);
  const material = (color, roughness = .65, metalness = .15) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const oak = material(0x795039), darkWood = material(0x342c28), steel = material(0x1d2934,.36,.7);
  const black = material(0x090f18,.4,.3), copper = material(0xc99565,.3,.72), paper = material(0xbac4c4,.9,.1);
  const blue = new THREE.MeshBasicMaterial({color:0x8edaff}), amber = new THREE.MeshBasicMaterial({color:0xf4c88c});
  const add = (geo, mat, parent = scene) => { const mesh = new THREE.Mesh(geo, mat); mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh); return mesh; };
  const box = (w,h,d,x,y,z,mat=steel,parent=scene) => { const m=add(new RoundedBoxGeometry(w,h,d,1,Math.min(.028,w*.12,h*.12,d*.12)),mat,parent);m.position.set(x,y,z);return m; };
  const cylinder = (r,h,x,y,z,mat=steel,parent=scene) => { const m=add(new THREE.CylinderGeometry(r,r,h,20),mat,parent);m.position.set(x,y,z);return m; };
  const beam = (a,b,r,mat=darkWood,parent=scene) => {const delta=b.clone().sub(a);const m=box(r,delta.length(),r,0,0,0,mat,parent);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(v(0,1,0),delta.normalize());return m;};
  const line = (points,color=0x7dd4f6,opacity=.45,parent=scene) => {const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(m);return m;};
  const glowTexture = (()=>{const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,255,255,.6)');g.addColorStop(.42,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);textures.push(t);return t;})();
  const glow=(x,y,z,color,size,parent=scene)=>{const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.6}));sprite.position.set(x,y,z);sprite.scale.setScalar(size);parent.add(sprite);return sprite;};
  const light=(x,y,z,color,intensity,distance=16)=>{const l=new THREE.PointLight(color,intensity,distance,1.7);l.position.set(x,y,z);scene.add(l);return l;};
  scene.add(new THREE.HemisphereLight(0x99c6ef,0x352821,2.1));
  const moon=new THREE.DirectionalLight(0xadcfff,3.2);moon.position.set(8,10,-12);scene.add(moon);
  const warm=new THREE.DirectionalLight(0xe3a36a,1.4);warm.position.set(-8,6,9);scene.add(warm);
  warm.castShadow=!mobile;warm.shadow.mapSize.set(2048,2048);warm.shadow.camera.left=-12;warm.shadow.camera.right=12;warm.shadow.camera.top=12;warm.shadow.camera.bottom=-12;warm.shadow.camera.far=40;warm.shadow.bias=-.001;warm.shadow.normalBias=.04;

  // Planks and roof trusses make the distance travelled readable, even in peripheral vision.
  const floor=new THREE.InstancedMesh(new THREE.BoxGeometry(.76,.13,7.8),oak,180);
  const dummy=new THREE.Object3D();let n=0;
  for(let row=0;row<9;row++)for(let col=0;col<20;col++){dummy.position.set(-7.6+col*.8,-.12,9-row*8+(col%2)*.23);dummy.updateMatrix();floor.setMatrixAt(n,dummy.matrix);floor.setColorAt(n,new THREE.Color().setHSL(.07,.18,.18+((col*7+row*3)%9)*.012));n++;}
  floor.receiveShadow=true;scene.add(floor);
  for(let z=2;z>=-55;z-=9){
    beam(v(-8,4.5,z),v(0,10,z),.24);beam(v(0,10,z),v(8,4.5,z),.24);
    beam(v(-8,0,z),v(-8,4.5,z),.28);beam(v(8,0,z),v(8,4.5,z),.28);
    beam(v(-4.8,6.8,z),v(4.8,6.8,z),.14,steel);
    // Roof-edge lights and small hardware joints.
    beam(v(7.75,4.65,z-.02),v(.1,9.85,z-.02),.025,z%2===0?amber:blue);
    [-8,8].forEach(x=>box(.44,.34,.07,x,4.5,z+.17,steel));
  }
  beam(v(0,10,12),v(0,10,-62),.3);beam(v(7.9,4.5,12),v(7.9,4.5,-62),.2);
  beam(v(-7.9,4.5,12),v(-7.9,4.5,-62),.2);
  // Discontinuous sloping roof panels leave room for the camera and shafts of light.
  for(let i=0;i<6;i++){
    const z=3-i*10;
    const roof=box(9.1,.08,7,4,7.25,z,darkWood);roof.rotation.z=-.6;
    const window=box(2.5,.035,3,4.15,7.28,z,new THREE.MeshBasicMaterial({color:0x9fc6e4}));window.rotation.z=-.6;
    for(const dz of [-1.55,0,1.55]){const mullion=box(2.65,.075,.06,4.15,7.32,z+dz,steel);mullion.rotation.z=-.6;}
    glow(3.8,6.9,z,0x729dd2,5);
    // Soft volumetric suggestion, never an opaque cone across the text.
    const shaft=add(new THREE.CylinderGeometry(.8,2.8,5,24,1,true),new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition; void main(){vUv=uv; vNormal=normalMatrix*normal; vec4 mv=modelViewMatrix*vec4(position,1.);vPosition=mv.xyz;gl_Position=projectionMatrix*mv;}',fragmentShader:'varying vec2 vUv; varying vec3 vNormal; varying vec3 vPosition; void main(){float edge=pow(abs(dot(normalize(vNormal),normalize(-vPosition))),2.);float height=pow(max(0.,sin(vUv.y*3.14159)),1.5);gl_FragColor=vec4(.55,.72,.9,edge*height*.012);}'} ));
    shaft.position.set(3,4.6,z);shaft.rotation.z=-.32;
  }
  const grid=new THREE.GridHelper(16,20,0x6685a5,0x263749);grid.scale.z=4;grid.position.set(0,-.03,-22);grid.material.transparent=true;grid.material.opacity=.15;scene.add(grid);

  function label(text,width=3,color='#b8d6e5'){
    const c=document.createElement('canvas');c.width=768;c.height=96;const ctx=c.getContext('2d');ctx.clearRect(0,0,768,96);ctx.fillStyle=color;ctx.font='36px monospace';ctx.fillText(text,4,59);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
    return add(new THREE.PlaneGeometry(width,width/8),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  }
  const sign=label('ATTIC—AI / LEIDEN',5,'#e5bf91');sign.position.set(1.5,5.4,-3);

  function screenTexture(kind){
    const c=document.createElement('canvas');c.width=512;c.height=320;const ctx=c.getContext('2d');
    ctx.fillStyle='#07121e';ctx.fillRect(0,0,512,320);ctx.fillStyle='#78cde9';ctx.font='13px monospace';ctx.fillText('ATTIC / '+kind+'                         ●',22,27);
    ctx.strokeStyle='#314654';ctx.strokeRect(12,10,488,300);
    if(kind==='BUILD')for(let i=0;i<15;i++){ctx.fillStyle=['#7db0c4','#d6b483','#748497'][i%3];ctx.fillRect(28+(i%3)*15,52+i*15,45+(i*53)%230,3);}
    else if(kind==='SIGNAL'){ctx.strokeStyle='#a1e4d3';for(let j=0;j<3;j++){ctx.beginPath();for(let x=25;x<485;x++){const y=160+Math.sin(x*.04+j)*Math.sin(x*.017)*60*(1-j*.17);x===25?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}}
    else {for(let y=0;y<3;y++)for(let x=0;x<5;x++){ctx.fillStyle=['#233b52','#4b5e6b','#8e7057'][(x+y)%3];ctx.fillRect(24+x*94,60+y*74,85,58);ctx.fillStyle='#c0cfd6';ctx.fillRect(29+x*94,65+y*74,20,2);}}
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);return texture;
  }
  function monitor(parent,x,y,z,kind='BUILD',scale=1){
    const group=new THREE.Group();parent.add(group);group.position.set(x,y,z);group.scale.setScalar(scale);
    box(2.6,1.6,.13,0,.8,0,black,group);
    const display=add(new THREE.PlaneGeometry(2.45,1.45),new THREE.MeshBasicMaterial({map:screenTexture(kind)}),group);display.position.set(0,.8,.075);
    cylinder(.06,.55,0,-.18,0,steel,group);box(.7,.05,.42,0,-.45,0,steel,group);
    const scan=box(2.42,.014,.004,0,.8,.085,blue,group);animated.push(time=>{scan.position.y=.11+(time*.16)%1.36;scan.material.opacity=.7;});return group;
  }
  function desk(z){
    const group=new THREE.Group();group.position.set(1.1,0,z);scene.add(group);
    box(5,.2,2.35,0,1.5,0,oak,group);
    for(const x of [-2.1,2.1]){box(.12,1.5,1.9,x,.72,0,steel,group);box(.8,.05,2,x,.03,0,black,group);}
    // A translucent light pool anchors the furniture to the floor.
    const pool=add(new THREE.CircleGeometry(4,48),new THREE.MeshBasicMaterial({color:0x203344,transparent:true,opacity:.3,depthWrite:false}),group);pool.rotation.x=-Math.PI/2;pool.position.y=-.02;
    return group;
  }
  const work=desk(0);
  monitor(work,.55,2.05,-.65);
  const side=monitor(work,-1.65,2.05,-.45,'BUILD',.67);side.rotation.y=.32;
  box(2,.06,.65,.2,1.66,.65,black,work);
  for(let row=0;row<4;row++)for(let col=0;col<14;col++)box(.105,.035,.09,-.65+col*.128,1.71,.44+row*.12,col%5===0?copper:paper,work);
  box(.25,.1,.4,1.48,1.7,.55,paper,work);
  // Desk lamp, notebook, soldering cable and compact computer.
  cylinder(.3,.06,2,1.65,-.45,copper,work);
  beam(v(2,1.65,-.45),v(1.85,2.8,-.65),.065,copper,work);beam(v(1.85,2.8,-.65),v(1.55,3.2,-.35),.065,copper,work);
  const shade=add(new THREE.ConeGeometry(.37,.4,24,1,true),copper,work);shade.position.set(1.55,3.03,-.35);
  glow(2.65,2.8,-.35,0xffbc70,1.6);light(2.65,2.8,-.35,0xffb35e,26,10);
  box(.85,.04,.65,-1.8,1.65,.65,paper,work);
  box(.7,.95,1.2,3,.5,-.3,black,work);for(let i=0;i<8;i++)box(.48,.025,.02,3,.15+i*.1,.32,i%3===0?blue:steel,work);
  cylinder(.16,.32,2.12,1.79,.55,paper,work);
  const cable=new THREE.CatmullRomCurve3([v(-.8,1.64,.1),v(-2.2,1.63,.5),v(-2.7,.8,.6),v(-2.2,.05,1.4),v(1,.05,1.8)]);add(new THREE.TubeGeometry(cable,32,.025,6,false),black,work);
  // A real chair silhouette, not an abstract pedestal.
  const chair=new THREE.Group();chair.position.set(1.2,0,2.1);chair.rotation.y=-.3;scene.add(chair);
  cylinder(.06,1,0,.5,0,steel,chair);box(1,.18,.92,0,1,0,black,chair);box(1,.95,.15,0,1.6,.42,black,chair);
  for(let i=0;i<5;i++){const a=i*Math.PI*.4;beam(v(0,.15,0),v(Math.cos(a)*.65,.1,Math.sin(a)*.65),.045,steel,chair);}

  // Station 02: a spatial knowledge structure, suspended over a working table.
  const memory=desk(-14);memory.scale.setScalar(.8);
  const network=new THREE.Group();network.position.set(1.5,3.3,-14);scene.add(network);
  const points=[];const count=34;
  for(let i=0;i<count;i++){const phi=Math.acos(1-2*(i+.5)/count),theta=i*2.39996,r=1.35+(i%3)*.22;const p=v(Math.cos(theta)*Math.sin(phi)*r,Math.cos(phi)*r,Math.sin(theta)*Math.sin(phi)*r);points.push(p);const sphere=add(new THREE.IcosahedronGeometry(i%7===0?.09:.045,1),i%7===0?amber:blue,network);sphere.position.copy(p);if(i%7===0)glow(p.x,p.y,p.z,0x87caff,.5,network);}
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++)if(points[i].distanceTo(points[j])<1.15)line([points[i],points[j]],0x86bcd6,.24,network);
  for(let i=0;i<3;i++){const ring=add(new THREE.TorusGeometry(2+i*.14,.009,6,100),i===0?amber:blue,network);ring.rotation.set(.7+i*.9,i*.6,.4);}
  const core=add(new THREE.IcosahedronGeometry(.42,1),new THREE.MeshStandardMaterial({color:0x9bc7df,emissive:0x347496,emissiveIntensity:.7,roughness:.2,metalness:.7}),network);
  glow(0,0,0,0x80c7fb,2,network);light(1.5,3,-14,0x88cfff,32);
  animated.push(time=>{network.rotation.y=time*.105;network.position.y=3.3+Math.sin(time*.65)*.12;core.rotation.x=time*.18;});
  const memorySign=label('01 / CONNECTIONS',3);memorySign.position.set(.05,1.6,-12.5);

  // Station 03: speakers, a controller, and a living waveform hanging in the air.
  const sound=desk(-28);monitor(sound,0,2.05,-.6,'SIGNAL');
  for(const x of [-1.85,1.85]){box(.65,1.12,.65,x,2.1,-.35,black,sound);for(const [y,r] of [[1.95,.2],[2.42,.09]]){const cone=add(new THREE.CylinderGeometry(r,r,.045,28),steel,sound);cone.rotation.x=Math.PI/2;cone.position.set(x,y,.005);const circle=add(new THREE.TorusGeometry(r,.015,6,32),copper,sound);circle.position.set(x,y,.04);}}
  box(2.7,.15,.65,0,1.65,.65,black,sound);
  for(let i=0;i<25;i++)box(.087,.055,.46,-1.22+i*.1,1.75,.65,i%7===1||i%7===3?steel:paper,sound);
  const waveform=new THREE.Group();waveform.position.set(1,4.5,-28);scene.add(waveform);
  const bars=[];for(let i=0;i<51;i++){const bar=box(.032,.3,.032,(i-25)*.09,0,0,i%7===0?amber:blue,waveform);bars.push(bar);}
  animated.push(time=>{bars.forEach((bar,i)=>{bar.scale.y=.4+Math.abs(Math.sin(i*.4+time*1.6)*Math.sin(i*.17-time*.7))*4;});waveform.rotation.y=Math.sin(time*.3)*.12;});
  light(1,3,-28,0x8bcdbd,24);
  const soundSign=label('02 / SIGNAL & SOUND',3);soundSign.position.set(-.2,3.8,-27.7);

  // Station 04: an editing desk, film reels and a floating sequence of frames.
  const film=desk(-42);monitor(film,0,2.05,-.5,'FRAME',1.12);
  const reels=[];for(const x of [-.7,.7]){const reel=add(new THREE.TorusGeometry(.45,.065,10,40),copper,film);reel.position.set(x,3.85,-.7);for(let j=0;j<5;j++){const a=j*Math.PI*.4;beam(v(0,0,0),v(Math.cos(a)*.4,Math.sin(a)*.4,0),.04,steel,reel);}reels.push(reel);}
  const frames=new THREE.Group();frames.position.set(0,4.8,-43);scene.add(frames);
  for(let i=0;i<7;i++){const f=new THREE.Group();f.position.set((i-3)*1.08,Math.sin(i*.8)*.2,Math.cos(i*.5)*.5);f.rotation.y=(i-3)*-.12;frames.add(f);box(.94,.66,.04,0,0,0,steel,f);box(.85,.48,.01,0,0,.03,i%2?copper:paper,f);for(const y of [-.285,.285])for(let x=0;x<6;x++)box(.05,.025,.01,-.36+x*.14,y,.035,black,f);}
  animated.push(time=>{reels.forEach(r=>r.rotation.z=time*.32);frames.position.y=4.7+Math.sin(time*.45)*.16;});light(1,3,-42,0xddb692,26);

  // Final object: a wireframe maquette becoming a physical room.
  const model=new THREE.Group();model.position.set(1,1.9,-54);scene.add(model);
  box(4,.2,3,0,-.2,0,oak,model);box(4,1.7,.12,0,.75,-1.5,paper,model);box(.12,1.7,3,-2,.75,0,paper,model);
  box(1.8,.12,.85,.3,.5,-.5,steel,model);box(.1,.7,.7,-.45,.05,-.5,steel,model);box(.1,.7,.7,1.05,.05,-.5,steel,model);
  const maquette=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(4.15,2.8,3.15)),new THREE.LineBasicMaterial({color:0x93cced,transparent:true,opacity:.5}));maquette.position.y=1.1;model.add(maquette);
  animated.push(time=>{model.rotation.y=Math.sin(time*.17)*.15;});light(1,3,-54,0xa3c3ee,30);

  // Authored surface detail: grain, tool marks, textile weave and hardware wear.
  function surfaceTexture(kind) {
    const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d');
    ctx.fillStyle=kind==='wood'?'#aca18c':'#666970';ctx.fillRect(0,0,512,512);
    let seed=37;const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
    if(kind==='wood'){
      for(let i=0;i<1500;i++){const x=random()*512;ctx.strokeStyle=`rgba(${random()>.55?'231,218,193':'45,35,25'},${.04+random()*.11})`;ctx.lineWidth=.3+random()*1.3;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=512;y+=16)ctx.lineTo(x+Math.sin(y*.016+i)*(.7+random()*2),y);ctx.stroke();}
      for(let i=0;i<5;i++){ctx.strokeStyle='#54463116';ctx.lineWidth=.5;const x=random()*512,y=random()*512;for(let j=0;j<9;j++){ctx.beginPath();ctx.ellipse(x,y,2+j*2,8+j*7,.03,0,Math.PI*2);ctx.stroke();}}
    }else for(let i=0;i<512;i+=3){ctx.fillStyle=i%2?'#868888':'#4a4d50';ctx.fillRect(0,i,512,1);ctx.fillRect(i,0,1,512);}
    const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(texture);return texture;
  }
  const woodTexture=surfaceTexture('wood');oak.map=woodTexture;oak.bumpMap=woodTexture;oak.bumpScale=.025;darkWood.map=woodTexture;darkWood.bumpMap=woodTexture;darkWood.bumpScale=.04;
  const textile=material(0x465561,.98,0);textile.map=surfaceTexture('fabric');textile.bumpMap=textile.map;textile.bumpScale=.02;
  const ceramic=material(0xacc0ba,.35,.05), terracotta=material(0x845440,.85,0), leaves=material(0x37544a,.7,.05);
  const shelvingWood=material(0x647077,.6,.25);
  const plaster=material(0x7b7772,.96,0);plaster.bumpMap=surfaceTexture('fabric');plaster.bumpScale=.008;
  // The studio is an extension through this eight-metre opening, not a partition of the nave.
  box(.18,4.5,12,-8.05,2.2,6,plaster);
  box(.18,4.5,51,-8.05,2.2,-33.5,plaster);
  const leftRoof=box(9.65,.12,71,-4,7.22,-23,darkWood);leftRoof.rotation.z=.602;
  // Timber tongue-and-groove on the long wall, skirting and narrow framing reveals.
  for(let i=0;i<70;i++){const z=11-i;if(z>0||z<-8)box(.035,1.25,.025,-7.94,.63,z,oak);}
  for(const [a,b] of [[12,0],[-8,-59]])for(const [y,r] of [[1.28,.055],[.08,.1]])beam(v(-7.9,y,a),v(-7.9,y,b),r,oak);
  // A textured wall and built-in shelves, with legible objects at human scale.
  for(let station=0;station<4;station++){
    const z=station===0?6:-station*14;
    box(.2,3.1,8,-7.5,1.5,z-1,darkWood);
    for(const y of [1,2.15,3.3])box(1.05,.1,4.2,-6.8,y,z,oak);
    for(const zz of [z-1.9,z+1.9])box(.065,3.3,.065,-6.25,1.7,zz,steel);
    const bookColors=[0x355167,0x9e8666,0x576857,0xc2b89e,0x58586b];
    for(let i=0;i<13;i++){
      const h=.45+(i%4)*.1,zz=z-1.6+i*.245;
      box(.53,h,.18,-6.75,2.25+h/2,zz,material(bookColors[(i+station)%5],.9,0));
      box(.005,.018,.145,-6.475,2.45,zz,copper);
    }
    for(let i=0;i<3;i++){box(.7,.48,.82,-6.8,1.29,z-1.2+i*1.05,shelvingWood);box(.02,.08,.22,-6.44,1.3,z-1.2+i*1.05,black);}
    const plant=new THREE.Group();plant.position.set(-6.75,3.35,z+.9);scene.add(plant);
    const pot=add(new THREE.CylinderGeometry(.23,.17,.4,24),terracotta,plant);pot.position.y=.2;
    cylinder(.2,.018,0,.4,0,darkWood,plant);
    for(let i=0;i<7;i++){const a=i*2.4,tip=v(Math.cos(a)*.27,.72+(i%3)*.18,Math.sin(a)*.27);beam(v(0,.4,0),tip,.012,leaves,plant);const leaf=add(new THREE.SphereGeometry(.12,8,6),leaves,plant);leaf.scale.set(.6,1.5,.2);leaf.position.copy(tip);leaf.rotation.set(.4,a,.7);}
    // A small pinboard: paper sketches held by metal clips, no random placeholder text.
    box(.08,1.7,2.7,-7.33,2,z+3.1,oak);
    for(let i=0;i<3;i++){const note=box(.01,.65,.57,-7.28,1.75+(i%2)*.3,z+2.4+i*.65,paper);note.rotation.x=(i-1)*.07;box(.035,.04,.12,-7.24,2.08+(i%2)*.3,z+2.4+i*.65,steel);}
    // A rug breaks the rigid grid; its weave remains visible close to the desk.
    const rug=box(5.8,.02,4.8,1,.005,z+1,textile);rug.receiveShadow=true;
    // Power and data paths follow the skirting, rather than floating through the room.
    line([v(-6,.05,z+3),v(-3.2,.05,z+3),v(-3.2,.05,z+.3),v(-1.5,.05,z+.3)],0x4c5b62,.8);
  }
  // Copper heating pipes, collars and workshop infrastructure.
  for(const x of [-7.1,-6.9]){
    beam(v(x,.32,10),v(x,.32,-57),.045,copper);
    for(let z=7;z>-57;z-=4){box(.18,.08,.06,x,.32,z,steel);}
  }
  const radiator=new THREE.Group();radiator.position.set(6.8,0,-3);scene.add(radiator);
  for(let i=0;i<13;i++)box(.095,.85,.32,0,.6,-.85+i*.14,paper,radiator);
  beam(v(0,.25,-1),v(0,.25,1),.06,copper,radiator);beam(v(0,.98,-1),v(0,.98,1),.06,copper,radiator);
  // Hardware on the main workbench: a circuit board, components, probe, pens and ruled notebook.
  const bench= new THREE.Group();bench.position.set(5.2,0,-4.2);bench.rotation.y=-.3;scene.add(bench);
  box(2.4,.12,1.5,0,1.2,0,oak,bench);
  for(const x of [-1,1])for(const z of [-.55,.55])box(.065,1.2,.065,x,.6,z,steel,bench);
  const pcb=box(.85,.035,.6,-.35,1.29,.1,material(0x254942,.65,.3),bench);
  for(let i=0;i<5;i++){box(.12,.07,.15,-.6+i*.13,1.34,.08,black,bench);for(const z of [-.04,.2])box(.1,.02,.035,-.6+i*.13,1.31,z,copper,bench);}
  pcb.rotation.y=.1;
  box(.7,.48,.48,.55,1.48,-.35,steel,bench);box(.4,.26,.01,.5,1.48,-.1,blue,bench);
  for(let i=0;i<3;i++){const knob=cylinder(.04,.035,.85,1.36+i*.1,-.085,copper,bench);knob.rotation.x=Math.PI/2;}
  const spiral=new THREE.CatmullRomCurve3(Array.from({length:50},(_,i)=>v(.9+Math.cos(i*.8)*.065,1.28, .05+i*.009)));add(new THREE.TubeGeometry(spiral,64,.012,5,false),black,bench);
  for(let i=0;i<4;i++){const pen=cylinder(.015,.4,-1+i*.065,1.32,.35,i%2?copper:steel,bench);pen.rotation.z=1.4;}
  // Pads, switches and faders give the audio desk a distinct construction.
  for(let i=0;i<8;i++){box(.17,.02,.17,-.9+(i%4)*.22,1.62,-28.2+Math.floor(i/4)*.22,copper);}
  for(let i=0;i<5;i++){box(.018,.008,.33,2.7+i*.11,1.62,-27.6,black);box(.065,.04,.07,2.7+i*.11,1.65,-27.6+(i%3)*.08,paper);}
  // A hanging cable tray and patterned ceiling slats add foreground depth without hiding the desks.
  for(let z=-3;z>=-54;z-=3){beam(v(-3,8.4,z),v(-3,7.1,z),.02,steel);}
  beam(v(-3,7.1,5),v(-3,7.1,-58),.11,steel);
  const pendantPositions=[-7,-21,-35,-49];
  pendantPositions.forEach(z=>{beam(v(0,9.8,z),v(0,5.7,z),.018,black);const shade=add(new THREE.ConeGeometry(.45,.4,32,1,true),steel);shade.position.set(0,5.6,z);const bulb=add(new THREE.SphereGeometry(.08,12,8),amber);bulb.position.set(0,5.42,z);glow(0,5.4,z,0xffc78a,1.8);light(0,5,z,0xf0bc81,15,10);});

  // Finishing the close-up objects: the first camera move must survive inspection.
  // Chair upholstery, lumbar seam, headrest, armrests and double casters.
  const upholstery=material(0x23333d,.96,.02);upholstery.map=surfaceTexture('fabric');
  box(.87,.12,.8,0,1.11,-.02,upholstery,chair);
  box(.88,.7,.09,0,1.61,.52,upholstery,chair);
  for(const x of [-.49,.49]){beam(v(x,.8,.1),v(x,1.38,.1),.055,steel,chair);box(.13,.06,.48,x,1.42,0,black,chair);}
  beam(v(0,1.75,.42),v(0,2.27,.42),.035,steel,chair);box(.48,.26,.13,0,2.2,.43,upholstery,chair);
  for(let i=0;i<5;i++){const a=i*Math.PI*.4;for(const side of [-1,1]){const caster=add(new THREE.CylinderGeometry(.09,.09,.055,16),black,chair);caster.rotation.z=Math.PI/2;caster.position.set(Math.cos(a)*.65+side*.035,.075,Math.sin(a)*.65);}}
  // Monitor bezel screws, vents and a webcam lens.
  box(.18,.055,.07,1.65,3.69,-.65,steel);
  const lens=add(new THREE.SphereGeometry(.024,12,8),blue);lens.position.set(1.65,3.69,-.602);
  for(let i=0;i<14;i++)box(.055,.008,.01,.9+i*.11,2.1,-.573,steel);
  // Open sketchbook: paper stack, center fold, a technical sketch and a pencil laid across it.
  for(let i=0;i<6;i++)box(.85,.003,.65,-.7,1.663+i*.006,.65,paper);
  line([v(-.7,1.701,.32),v(-.7,1.701,.98)],0x858780,.8);
  for(let i=0;i<5;i++)line([v(-1.05,1.702,.45+i*.07),v(-.84+(i%2)*.08,1.702,.45+i*.07)],0x627a82,.7);
  const sketchLines=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(.18,.001,.18)),new THREE.LineBasicMaterial({color:0x577a8e}));sketchLines.position.set(-.49,1.71,.61);sketchLines.rotation.y=.4;scene.add(sketchLines);
  const pencil=cylinder(.012,.62,-.73,1.73,.75,copper);pencil.rotation.z=Math.PI/2;pencil.rotation.y=.28;
  const tip=add(new THREE.ConeGeometry(.012,.05,8),black);tip.rotation.z=-Math.PI/2;tip.position.set(-.4,1.73,.66);
  // Ceramic handle and coffee surface, plus glass flasks near the electronics bench.
  const handle=add(new THREE.TorusGeometry(.105,.027,10,22),ceramic);handle.position.set(3.37,1.78,.55);
  const coffee=add(new THREE.CircleGeometry(.139,24),material(0x281b16,.15,0));coffee.rotation.x=-Math.PI/2;coffee.position.set(3.22,1.948,.55);
  for(let i=0;i<3;i++){const bottle=add(new THREE.CylinderGeometry(.075,.075,.23+i*.04,16),ceramic);bottle.position.set(5.55+i*.21,1.4,-4.5);cylinder(.035,.065,5.55+i*.21,1.55+i*.02,-4.5,steel);}
  // Tall equipment rack: ventilation fins, patch connectors and pulsing status LEDs.
  const rack=new THREE.Group();rack.position.set(5.8,0,-15);scene.add(rack);
  box(1.2,2.65,.95,0,1.325,0,black,rack);
  for(let i=0;i<7;i++){
    box(1.08,.29,.035,0,.22+i*.34,.49,steel,rack);
    for(let j=0;j<9;j++)box(.025,.18,.009,-.42+j*.075,.22+i*.34,.513,black,rack);
    const led=box(.018,.018,.02,.43,.22+i*.34,.52,i%3?blue:amber,rack);
    animated.push(time=>{led.visible=Math.sin(time*(.6+i*.14)+i)>-.6;});
  }
  // Curved headphone band, padded ear cups and its cable at the sound workstation.
  const headphones=new THREE.Group();headphones.position.set(3.2,1.85,-27.25);headphones.rotation.set(.3,.2,-.3);scene.add(headphones);
  const band=add(new THREE.TorusGeometry(.27,.035,8,30,Math.PI),steel,headphones);band.rotation.z=0;
  for(const x of [-.27,.27]){const cup=add(new THREE.CylinderGeometry(.115,.115,.1,20),black,headphones);cup.rotation.z=Math.PI/2;cup.position.set(x,-.025,0);}
  const headphoneCable=new THREE.CatmullRomCurve3([v(3.4,1.85,-27.2),v(3.65,1.3,-27),v(3.3,.4,-26.7),v(2.6,.06,-26.5)]);add(new THREE.TubeGeometry(headphoneCable,25,.013,6,false),black);

  // Signs mark the two new wings; the original nave remains the home-page workshop.
  const stone=material(0x797975,.9,.08);
  box(15.5,.025,.18,0,.025,-7,copper);
  for(const x of [-7.25,7.25])box(.18,5.1,.22,x,2.55,-7,steel);
  box(14.7,.2,.22,0,5.15,-7,steel);
  box(3.25,.5,.065,-5.6,4.55,-6.9,steel);box(3.55,.5,.065,2.8,4.55,-6.9,steel);
  for(const x of [-6.7,-4.5,1.5,4.1])beam(v(x,4.8,-6.92),v(x,5.12,-6.92),.016,copper);
  const studioPlaque=label('01 / STUDIO',2.8,'#e5bf91');studioPlaque.position.set(-5.6,4.55,-6.84);
  const galleryPlaque=label('02 / PORTFOLIO',3.1,'#b8d6e5');galleryPlaque.position.set(2.8,4.55,-6.84);
  // A planning area belongs to the studio, beside the development bench.
  const planning=new THREE.Group();planning.position.set(-15.4,0,-4.8);scene.add(planning);
  box(2.8,.13,1.75,0,1.14,0,oak,planning);
  for(const x of [-1.13,1.13])for(const z of [-.65,.65])box(.065,1.12,.065,x,.55,z,steel,planning);
  for(let i=0;i<3;i++){const sheet=box(.6,.012,.45,-.8+i*.75,1.218,.1,paper,planning);sheet.rotation.y=(i-1)*.12;for(let j=0;j<4;j++)box(.33-j*.045,.002,.012,-.84+i*.75,1.227,-.02+j*.08,steel,planning);}
  const board=box(3.25,1.9,.1,0,2.65,-1.2,steel,planning);
  box(3.08,1.73,.02,0,2.65,-1.136,paper,planning);
  for(let i=0;i<3;i++){
    box(.78,.82,.025,-1+i,2.7,-1.11,material([0xc4b399,0x9eb5b9,0xb6baa4][i],.94,0),planning);
    for(let j=0;j<3;j++)box(.46-j*.07,.012,.007,-1.08+i,2.84-j*.15,-1.091,steel,planning);
    cylinder(.018,.01,-1+i,3.06,-1.075,copper,planning).rotation.x=Math.PI/2;
  }
  board.receiveShadow=true;
  for(const x of [-1.25,1.25])beam(v(x,0,-1.2),v(x,3.65,-1.2),.045,steel,planning);
  for(const x of [-.85,.85]){
    box(.72,.12,.65,x,.65,1.2,steel,planning);box(.72,.6,.12,x,1.02,1.51,steel,planning);
    for(const dx of [-.27,.27])for(const dz of [-.22,.22])box(.04,.65,.04,x+dx,.32,1.2+dz,copper,planning);
  }
  const planningSign=label('STUDIO / BRIEF → BUILD',3.2,'#e5bf91');planningSign.position.set(-15.4,4.15,-6);
  light(-15.4,3.8,-3.8,0xe8bd89,23,12);
  // Exhibition islands distinguish the gallery from the desks in the studio.
  for(const [index,z] of [-14,-28,-42,-54].entries()){
    box(6.2,.08,4.6,1.1,.005,z+.15,stone);
    box(6.3,.025,.035,1.1,.055,z+2.45,index%2?amber:blue);
    const plaque=label('0'+(index+1)+' / '+['MEMORY','PERCEPTION','MOTION','SPACE'][index],2.8);
    box(2.85,.38,.065,-1.5,.4,z+2.45,steel);
    plaque.position.set(-1.5,.4,z+2.5);plaque.rotation.x=-.12;
    // Ceiling tracks give each exhibit its own pool of light.
    beam(v(-1,5.7,z),v(3.4,5.7,z),.045,steel);
    for(const x of [-.7,3.1]){const spot=cylinder(.085,.22,x,5.57,z,black);spot.rotation.z=x<0?-.3:.3;glow(x,5.43,z,0xb8d6ef,.45);}
  }
  memory.children[0].material=stone;

  // Two full-height extensions, with their own roof, floor, joinery and use of light.
  function wing(centerX, front, back, outerX) {
    const length=front-back, centerZ=(front+back)/2;
    const rows=Math.ceil(length/3), planks=new THREE.InstancedMesh(new THREE.BoxGeometry(.77,.12,length/rows-.035),oak,rows*20);
    for(let row=0,index=0;row<rows;row++)for(let col=0;col<20;col++,index++){
      dummy.position.set(centerX-7.6+col*.8,-.12,front-(row+.5)*length/rows);dummy.updateMatrix();planks.setMatrixAt(index,dummy.matrix);
      planks.setColorAt(index,new THREE.Color().setHSL(.075,.14,.28+((row*3+col*7)%7)*.014));
    }
    planks.receiveShadow=true;scene.add(planks);
    for(const direction of [-1,1]){
      const roof=box(9.2,.12,length,centerX+direction*4,6.75,centerZ,darkWood);roof.rotation.z=-direction*Math.atan2(4.5,8);
    }
    beam(v(centerX,9,front),v(centerX,9,back),.26);
    for(let z=front-1;z>back;z-=7){
      for(const direction of [-1,1]){
        const x=centerX+direction*8;
        beam(v(x,4.5,z),v(centerX,9,z),.22);beam(v(x,0,z),v(x,4.5,z),.23);
        box(.4,.3,.07,x,4.3,z+.14,steel);
        const screw=cylinder(.035,.03,x,4.3,z+.19,copper);screw.rotation.x=Math.PI/2;
      }
      beam(v(centerX-4.8,6.3,z),v(centerX+4.8,6.3,z),.1,steel);
      beam(v(centerX,9,z),v(centerX,5.8,z),.016,steel);
      const shade=add(new THREE.ConeGeometry(.36,.3,24,1,true),steel);shade.position.set(centerX,5.7,z);
      cylinder(.23,.02,centerX,5.55,z,amber);glow(centerX,5.5,z,0xffc48c,1.5);
    }
    box(.18,4.5,length,outerX,2.2,centerZ,plaster);
    box(16,4.5,.18,centerX,2.2,back,plaster);
    // Closed gables give the room a real envelope above the tall wall panels.
    for(const z of [front,back]){
      const gable=new THREE.BufferGeometry();gable.setAttribute('position',new THREE.Float32BufferAttribute([centerX-8,4.45,z,centerX+8,4.45,z,centerX,9,z],3));gable.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));gable.computeVertexNormals();
      const gableMaterial=darkWood.clone();gableMaterial.side=THREE.DoubleSide;add(gable,gableMaterial);
      beam(v(centerX,4.45,z),v(centerX,9,z),.16);beam(v(centerX-8,4.45,z),v(centerX+8,4.45,z),.18);
    }
    for(const y of [.1,1.15,4.45])beam(v(outerX,y,front),v(outerX,y,back),.075,oak);
    const inward=outerX<centerX?1:-1;
    for(let z=front-4;z>back+2;z-=8){
      // Recessed windows with reveal, transom and sill, facing into the actual room.
      box(.14,2.4,3.6,outerX+inward*.12,2.9,z,steel);
      box(.025,2.15,3.3,outerX+inward*.21,2.9,z,new THREE.MeshBasicMaterial({color:0x617e92}));
      for(const zz of [-1.72,0,1.72])box(.12,2.35,.055,outerX+inward*.25,2.9,z+zz,oak);
      for(const y of [1.75,2.9,4.05])box(.12,.07,3.5,outerX+inward*.25,y,z,oak);
      box(.55,.12,3.8,outerX+inward*.26,1.68,z,oak);
      glow(outerX+inward,3,z,0x8cbbd5,4);
    }
  }
  wing(-16,6,-12,-24);
  wing(16,-9,-50,24);
  box(.18,4.5,36,8,2.2,-32,plaster);
  // Short bridge into the gallery; no crossing through a wall or existing workstation.
  box(5,.12,6,8,-.12,-10,oak);
  for(const z of [0,-8])beam(v(-8,0,z),v(-8,4.5,z),.26);
  beam(v(-8,4.5,0),v(-8,4.5,-8),.24);
  for(const x of [8,24])beam(v(x,4.5,-9),v(16,9,-9),.24);

  // Studio: materials library, workbench, meeting table and a small listening corner.
  const studioBench=work.clone(true);studioBench.position.set(-17.5,0,-10.2);scene.add(studioBench);
  const studioChair=chair.clone(true);studioChair.position.set(-17.5,0,-8.3);scene.add(studioChair);
  box(7,.025,5,-15.4,.005,-3.8,textile);
  for(let bay=0;bay<3;bay++){
    const x=-12-bay*3;
    for(const y of [.5,1.5,2.5,3.5])box(2.7,.1,.9,x,y,4.8,oak);
    for(const xx of [-1.25,1.25])box(.06,3.55,.8,x+xx,1.78,4.8,steel);
    for(let i=0;i<7;i++){
      box(.16,.48+(i%3)*.13,.48,x-1+i*.29,2.8+(i%3)*.065,4.77,i%3?paper:shelvingWood);
      box(.085,.024,.01,x-1+i*.29,2.76,5.02,copper);
    }
    for(let i=0;i<2;i++){box(.95,.45,.75,x-.58+i*1.16,.78,4.8,shelvingWood);box(.25,.07,.02,x-.58+i*1.16,.78,5.19,black);}
  }
  const sofa=new THREE.Group();sofa.position.set(-22.2,0,-5);sofa.rotation.y=Math.PI/2;scene.add(sofa);
  box(3.1,.5,1.2,0,.55,0,steel,sofa);box(3.1,.75,.25,0,1.05,-.6,textile,sofa);
  for(const x of [-1.48,1.48])box(.18,.55,1.35,x,.94,0,oak,sofa);
  for(const x of [-.95,0,.95])box(.9,.17,1,x,.87,.02,textile,sofa);
  for(const x of [-1.2,1.2])for(const z of [-.45,.45])cylinder(.045,.3,x,.15,z,copper,sofa);
  cylinder(.8,.08,-20.6,.68,-4,oak);cylinder(.09,.65,-20.6,.33,-4,steel);
  box(.5,.035,.38,-20.6,.75,-4,paper);cylinder(.13,.2,-20.2,.8,-3.9,ceramic);
  cylinder(.36,.05,-22,.025,-7.3,steel);beam(v(-22,0,-7.3),v(-22,3.1,-7.3),.04,copper);
  const studioShade=add(new THREE.ConeGeometry(.52,.55,24,1,true),paper);studioShade.position.set(-22,3,-7.3);glow(-22,2.7,-7.3,0xffc88d,2);
  // Technical drawings above the back bench: measured lines, layers and pinned samples.
  for(let i=0;i<3;i++){
    box(1.8,1.25,.08,-20+i*2.1,3.5,-11.8,steel);box(1.65,1.1,.015,-20+i*2.1,3.5,-11.747,paper);
    for(let j=0;j<4;j++)line([v(-20.65+i*2.1,3.15+j*.2,-11.73),v(-19.45+i*2.1-j*.16,3.15+j*.2,-11.73)],0x465867,.8);
  }
  light(-19,4.5,-7,0xe7b985,24,14);

  // Gallery exhibits are additional objects. The home-page workstations stay in place.
  const exhibit=(source,x,y,z)=>{const object=source.clone(true);object.position.set(x,y,z);scene.add(object);return object;};
  exhibit(memory,16,0,-18);
  const galleryNetwork=exhibit(network,16,3.3,-18);
  exhibit(sound,16,0,-27);
  const galleryWave=exhibit(waveform,16,4.35,-27);
  const galleryFilm=exhibit(film,16,0,-37), galleryFrames=exhibit(frames,16,4.8,-37);
  const galleryModel=exhibit(model,16,1.9,-45);
  cylinder(2.35,1.65,16,.8,-45,stone);
  animated.push(time=>{
    galleryNetwork.rotation.y=time*.105;galleryNetwork.position.y=3.3+Math.sin(time*.65)*.12;
    galleryWave.children.forEach((bar,i)=>{bar.scale.y=.4+Math.abs(Math.sin(i*.4+time*1.6)*Math.sin(i*.17-time*.7))*4;});
    galleryFrames.position.y=4.7+Math.sin(time*.45)*.16;galleryModel.rotation.y=Math.sin(time*.17)*.15;
    galleryFilm.children.filter(child=>child.geometry?.type==='TorusGeometry').forEach(reel=>{reel.rotation.z=time*.32;});
  });
  const galleryTitle=label('PORTFOLIO / WORK IN PROGRESS',5,'#e5bf91');galleryTitle.position.set(16,5.4,-12);
  for(const [index,z] of [-18,-27,-37,-45].entries()){
    box(6.4,.1,4.8,16,.005,z,stone);
    box(6.45,.018,.03,16,.067,z+2.4,index%2?amber:blue);
    const plaque=label(['01 / MASTERMIND','02 / VESPER','03 / FRAMEFORGE','04 / SPATIAL STUDIES'][index],3.8);
    plaque.position.set(15,.45,z+2.48);box(4,.48,.08,15,.45,z+2.43,steel);
    beam(v(12.5,5.5,z),v(19.5,5.5,z),.06,steel);
    for(const x of [13,19]){const fixture=cylinder(.12,.32,x,5.3,z,copper);fixture.rotation.z=x<16?-.45:.45;glow(x,5.07,z,0xc8dcef,.8);}
    // Archive drawers and sample trays along the far wall, outside the camera aisle.
    box(.9,1.1,2.5,23.2,.55,z,oak);
    for(let i=0;i<4;i++){box(.025,.21,2.3,22.72,.18+i*.25,z,steel);box(.04,.035,.25,22.69,.18+i*.25,z,copper);}
    light(16,4,z,index%2?0xe7bd96:0x9bc8e8,24,12);
  }
  // The inside wall carries project material, so the return arcs reveal more than a blank wall.
  // Real captures are the same explicitly labelled assets used by the HTML case studies.
  const projectPanels=[
    {z:-18,title:'MASTERMIND / KNOWLEDGE',kind:'BUILD'},
    {z:-27,title:'VESPER / LEVEL STUDY',kind:'SIGNAL',image:'/images/vesper.webp',aspect:1100/760},
    {z:-37,title:'FRAMEFORGE / SEQUENCE',kind:'FRAME'},
    {z:-45,title:'BLENDER / SPATIAL STUDY',kind:'FRAME',image:'/images/blender-room.webp',aspect:4/3},
  ];
  const textureLoader=new THREE.TextureLoader();
  for(const panel of projectPanels){
    const mount=new THREE.Group();mount.position.set(8.25,0,panel.z);mount.rotation.y=Math.PI/2;scene.add(mount);
    const height=panel.image?4.2/panel.aspect:2.63;
    box(4.5,height+.3,.14,0,2.8,0,steel,mount);box(4.32,height+.12,.02,0,2.8,.081,copper,mount);
    const panelMaterial=new THREE.MeshBasicMaterial({map:screenTexture(panel.kind),toneMapped:false});
    const display=add(new THREE.PlaneGeometry(4.2,height),panelMaterial,mount);display.position.set(0,2.8,.096);
    if(panel.image){
      const texture=textureLoader.load(publicUrl(panel.image),loaded=>{if(!alive){loaded.dispose();return;}loaded.colorSpace=THREE.SRGBColorSpace;panelMaterial.map=loaded;panelMaterial.needsUpdate=true;},undefined,()=>{});textures.push(texture);
    }
    const caption=label(panel.title,4,'#e5bf91');mount.add(caption);caption.position.set(0,4.75,.1);
    box(4.7,.07,.4,0,4.45,.08,oak,mount);box(4.15,.02,.035,0,4.39,.24,amber,mount);
    for(const x of [-2.16,2.16])for(const y of [1.4,4.15]){const pin=cylinder(.024,.025,x,y,.106,copper,mount);pin.rotation.x=Math.PI/2;}
    box(4.4,.8,.8,0,.4,.23,oak,mount);
    for(let i=0;i<4;i++){box(1.02,.65,.025,-1.62+i*1.08,.43,.647,steel,mount);box(.19,.035,.05,-1.62+i*1.08,.64,.68,copper,mount);}
    for(let i=0;i<5;i++)box(.6,.025,.45,-1.35+i*.64,.83+(i%3)*.025,.2,i%2?paper:shelvingWood,mount);
  }

  // GPU particles: depth-aware dust, not a flat DOM overlay.
  const particlesCount=mobile?900:2200, positions=new Float32Array(particlesCount*3), seeds=new Float32Array(particlesCount);
  for(let i=0;i<particlesCount;i++){const region=i%4;positions[i*3]=region===0?-16+Math.sin(i*127.1)*7:region===1?16+Math.sin(i*127.1)*7:Math.sin(i*127.1)*7;positions[i*3+1]=.3+((i*73)%101)/101*7;positions[i*3+2]=region===0?5-((i*47)%997)/997*16:region===1?-9-((i*47)%997)/997*40:12-((i*47)%997)/997*72;seeds[i]=(i*13.31)%10;}
  const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(positions,3));dustGeometry.setAttribute('aSeed',new THREE.BufferAttribute(seeds,1));
  const dustMaterial=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uTime:{value:0},uDpr:{value:renderer.getPixelRatio()}},vertexShader:`attribute float aSeed; uniform float uTime; uniform float uDpr; varying float vAlpha; void main(){ vec3 p=position; p.x+=sin(uTime*.12+aSeed)*.24; p.y+=sin(uTime*.18+aSeed*2.)*.18; vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; gl_PointSize=clamp((10.+aSeed*3.)/-mv.z,1.,5.)*uDpr; vAlpha=(.15+.45*(.5+.5*sin(aSeed+uTime*.5)))*smoothstep(65.,5.,-mv.z); }`,fragmentShader:`varying float vAlpha; void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.05,d)*vAlpha;gl_FragColor=vec4(.68,.82,1.,a);}`});
  const dust=new THREE.Points(dustGeometry,dustMaterial);scene.add(dust);

  // Scroll stops are measured from actual page content, so localization cannot desynchronize the tour.
  const cameraStops=tourRoutes[page]||tourRoutes.home;
  const positionCurve=new THREE.CatmullRomCurve3(cameraStops.map(p=>v(...p.slice(0,3))),false,'centripetal');
  const targetCurve=new THREE.CatmullRomCurve3(cameraStops.map(p=>v(...p.slice(3))),false,'centripetal');
  const lastStop=cameraStops.length-1;
  let sceneVisible=true;
  let stops=[], targetProgress=0, progress=targetProgress, frame=0, alive=true;
  let enabled=document.documentElement.dataset.motion!=='off'&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
  let pointer={x:0,y:0}, smoothPointer={x:0,y:0}, lastTime=0, menuOpen=false, menuBlend=0, measuredFrames=0, metricStart=performance.now();
  const initialPosition=v(), initialLook=v(), desiredPosition=v(), desiredLook=v(), look=v();
  function measure(){
    stops=measureTour([...document.querySelectorAll('[data-scene-stop]')].map(el=>({
      top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight,
      from:Number(el.dataset.sceneStop),to:el.hasAttribute('data-scene-to')?Number(el.dataset.sceneTo):undefined,
    })),innerHeight);
    updateScroll();
  }
  function updateScroll(){
    targetProgress=THREE.MathUtils.clamp(sampleTour(stops,scrollY),0,lastStop);
    // Keep the camera current while its canvas is covered; no catch-up flight on re-entry.
    if(!sceneVisible)progress=targetProgress;
  }
  function pose(p,position,target){
    const t=THREE.MathUtils.clamp(p/lastStop,0,1);
    positionCurve.getPoint(t,position);targetCurve.getPoint(t,target);
    // Wider mobile FOV keeps the same physical path through doorways and between exhibits.
    if(mobile){position.y+=.65;target.y+=.25;}
  }
  function resize(){renderer.setSize(innerWidth,innerHeight);composer?.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();measure();if(!enabled)renderStill();}
  function renderStill(){pose(0,initialPosition,initialLook);camera.position.copy(initialPosition);camera.lookAt(initialLook);render();}
  function draw(now){if(!alive||document.hidden||(!sceneVisible&&!menuOpen)){frame=0;return;}frame=requestAnimationFrame(draw);if(now-lastTime<(mobile?32:16))return;const delta=Math.min((now-lastTime)/1000,.06);lastTime=now;
    elapsed+=delta;const t=elapsed;const smoothing=1-Math.exp(-delta*11);
    progress+= (targetProgress-progress)*smoothing;
    smoothPointer.x+=(pointer.x-smoothPointer.x)*.035;smoothPointer.y+=(pointer.y-smoothPointer.y)*.035;
    pose(progress,desiredPosition,desiredLook);
    menuBlend+=((menuOpen?1:0)-menuBlend)*smoothing;
    desiredPosition.x-=menuBlend*1.2;desiredPosition.y+=menuBlend*.7;desiredLook.y+=menuBlend*.2;
    desiredPosition.x+=smoothPointer.x*.55;desiredPosition.y+=smoothPointer.y*.25;
    camera.position.copy(desiredPosition);look.copy(desiredLook);camera.lookAt(look);
    animated.forEach(fn=>fn(t));dustMaterial.uniforms.uTime.value=t;
    render();
    if(++measuredFrames===60){host.dataset.fps=String(Math.round(60000/(now-metricStart)));metricStart=now;measuredFrames=0;}
    host.style.setProperty('--travel',String(progress/lastStop));
  }
  function start(){if(enabled&&!frame&&!document.hidden&&(sceneVisible||menuOpen)){progress=targetProgress;lastTime=performance.now();metricStart=lastTime;measuredFrames=0;frame=requestAnimationFrame(draw);}}
  function toggle(e){enabled=e.detail&&!matchMedia('(prefers-reduced-motion:reduce)').matches;if(!enabled){cancelAnimationFrame(frame);frame=0;renderStill();}else start();}
  function pointerMove(e){pointer={x:(e.clientX/innerWidth-.5)*2,y:(.5-e.clientY/innerHeight)*2};}
  function contextLost(e){e.preventDefault();cancelAnimationFrame(frame);frame=0;onFailure();}
  const resizeObserver=new ResizeObserver(measure);resizeObserver.observe(document.querySelector('main'));
  const menuObserver=new MutationObserver(()=>{menuOpen=document.body.classList.contains('menu-is-open');start();});menuObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  const visibleRegions=new Set();
  const visibilityObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)visibleRegions.add(entry.target);else visibleRegions.delete(entry.target);});sceneVisible=visibleRegions.size>0;start();},{rootMargin:'100px'});
  document.querySelectorAll('.home-hero,.portfolio-hero,.spatial-passage,[data-scene-view]').forEach(el=>visibilityObserver.observe(el));
  window.addEventListener('resize',resize);window.addEventListener('scroll',updateScroll,{passive:true});window.addEventListener('pointermove',pointerMove,{passive:true});window.addEventListener('attic:motion',toggle);document.addEventListener('visibilitychange',start);renderer.domElement.addEventListener('webglcontextlost',contextLost);
  resize();pose(targetProgress,initialPosition,initialLook);camera.position.copy(initialPosition);look.copy(initialLook);camera.lookAt(look);render();onReady();start();
  return()=>{alive=false;cancelAnimationFrame(frame);resizeObserver.disconnect();visibilityObserver.disconnect();menuObserver.disconnect();window.removeEventListener('resize',resize);window.removeEventListener('scroll',updateScroll);window.removeEventListener('pointermove',pointerMove);window.removeEventListener('attic:motion',toggle);document.removeEventListener('visibilitychange',start);renderer.domElement.removeEventListener('webglcontextlost',contextLost);scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());bloom?.dispose();composer?.passes.forEach(pass=>{if(pass!==bloom)pass.dispose?.();});composer?.dispose();environmentMap.dispose();renderer.dispose();renderer.domElement.remove();};
}

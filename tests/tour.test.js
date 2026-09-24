import test from 'node:test';
import assert from 'node:assert/strict';
import { CatmullRomCurve3, Vector3 } from 'three';
import { measureTour, sampleTour, tourRoutes } from '../src/scene/tour.js';

test('a crossing keeps travelling through its entire visible interval without a dead final screen',()=>{
  const stops=measureTour([{top:0,height:800,from:0},{top:1600,height:600,from:1,to:2},{top:2200,height:1100,from:2}],800);
  const begin=1600-800*.72,end=2200-800*.32;
  let previous=sampleTour(stops,begin);
  for(let y=begin+1;y<end;y+=7){const next=sampleTour(stops,y);assert.ok(next>previous);previous=next;}
  assert.equal(sampleTour(stops,end),2);
  assert.ok(sampleTour(stops,end-80)>1.9);
  assert.equal(sampleTour(stops,-1),0);
  assert.equal(sampleTour(stops,99999),2);
});

test('translated heights and short mobile sections preserve their endpoints and reversible navigation',()=>{
  for(const viewport of [740,844,1080])for(const height of [460,680,950]){
    const stops=measureTour([{top:0,height:900,from:0},{top:1400,height,from:1,to:2},{top:1400+height,height:1800,from:2}],viewport);
    const y=1400+height*.4;
    const expected=sampleTour(stops,y);
    sampleTour(stops,10000);
    assert.equal(sampleTour(stops,y),expected);
    assert.equal(sampleTour(stops,1400+height-viewport*.32),2);
    for(let i=1;i<stops.length;i++){assert.ok(stops[i].y>stops[i-1].y);assert.ok(stops[i].p>=stops[i-1].p);}
  }
});

test('cinematic arcs stay inside the expanded rooms and outside gallery objects, including mobile clearance',()=>{
  for(const [route,stops] of Object.entries(tourRoutes)){
    const curve=new CatmullRomCurve3(stops.map(p=>new Vector3(...p.slice(0,3))),false,'centripetal');
    let distance=0,previous=curve.getPoint(0);
    for(let i=1;i<=800;i++){
      const p=curve.getPoint(i/800);distance+=p.distanceTo(previous);
      assert.ok(p.distanceTo(previous)<.25,'no discontinuous camera segment');previous=p;
      for(const mobile of [false,true]){
        const x=p.x,y=p.y+(mobile?.65:0),z=p.z;
        if(route==='agency'){
          assert.ok(x>-23.4 && x<-4.4 && z>-11.4 && z<5.6);
          // When crossing the old wall, the camera must use the new doorway.
          if(Math.abs(x+8)<.3)assert.ok(z> -7.6 && z<-.1);
        }
        if(route==='portfolio'){
          assert.ok(x>5.5 && x<23.4 && z>-49.4 && z<-4.5);
          for(const exhibitZ of [-18,-27,-37,-45]){
            assert.ok(Math.abs(x-16)>3.35 || Math.abs(z-exhibitZ)>2.55,'camera outside exhibit plinth');
          }
        }
        if(route==='home'){
          assert.ok(x>-7.4 && x<7.7 && z>-59 && z<15);
          for(const stationZ of [0,-14,-28,-42,-54])assert.ok(Math.hypot(x-1.1,z-stationZ)>3,'home arcs clear the workstations');
        }
        const ridge=route==='home'?0:route==='agency'&&x<-8?-16:route==='portfolio'&&x>8?16:0;
        const ceiling=route==='home'?10-Math.abs(x)*5.5/8:9-Math.abs(x-ridge)*4.5/8;
        assert.ok(y<ceiling-.2,`${route} camera below rafters at ${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`);
      }
    }
    assert.ok(distance>(route==='agency'?24:45),'keep the original sense of travel');
  }
});

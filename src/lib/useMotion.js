import { useEffect } from 'react';
export function useMotion(enabled, page) {
 useEffect(()=>{
  if(!enabled || matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let cancelled=false, dispose=()=>{};
  Promise.all([import('gsap'),import('gsap/ScrollTrigger'),import('lenis')]).then(([g,s,l])=>{
   if(cancelled)return;
   const gsap=g.gsap, ScrollTrigger=s.ScrollTrigger;
   gsap.registerPlugin(ScrollTrigger);
   const cleanups=[], originals=[];
   const fine=matchMedia('(pointer:fine)').matches && innerWidth>800;
   const lenis=fine?new l.default({lerp:.16,smoothWheel:true,anchors:{offset:-110},prevent:node=>Boolean(node.closest?.('.chat-panel,dialog,.brief-form'))}):null;
   const tick=time=>lenis?.raf(time*1000);
   if(lenis){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(tick);}
   const onMenu=()=>{if(document.body.classList.contains('menu-is-open'))lenis?.stop();else lenis?.start();};
   const menuObserver=new MutationObserver(onMenu);menuObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
   const headings=[...document.querySelectorAll('main h1,main h2,main .chapter-transition p')];
   headings.forEach(heading=>{
    if(heading.closest('.brief-form'))return;
    const label=heading.getAttribute('aria-label');
    heading.setAttribute('aria-label',heading.innerText.replace(/\s+/g,' ').trim());
    originals.push(()=>{if(label===null)heading.removeAttribute('aria-label');else heading.setAttribute('aria-label',label);});
    const walker=document.createTreeWalker(heading,NodeFilter.SHOW_TEXT);
    const texts=[];while(walker.nextNode())if(walker.currentNode.textContent.trim())texts.push(walker.currentNode);
    texts.forEach(text=>{
     const container=document.createElement('span');container.className='motion-segment';container.setAttribute('aria-hidden','true');
     text.textContent.split(/(\s+)/).forEach(word=>{
      if(!word.trim()){container.append(document.createTextNode(word));return;}
      const mask=document.createElement('span');mask.className='motion-mask';
      const inner=document.createElement('span');inner.className='motion-word';inner.textContent=word;inner.dataset.echo=word;mask.append(inner);container.append(mask);
     });
     text.replaceWith(container);originals.push(()=>container.replaceWith(text));
    });
   });
   const context=gsap.context(()=>{
    headings.forEach(heading=>{
     const words=heading.querySelectorAll('.motion-word');if(!words.length)return;
     if(heading.closest('.chapter-transition')){
      gsap.fromTo(words,{opacity:.18,y:12},{opacity:1,y:0,stagger:.12,ease:'none',scrollTrigger:{trigger:heading,start:'top 85%',end:'top 35%',scrub:.8}});
      return;
     }
     gsap.fromTo(words,{yPercent:110,rotate:2,opacity:.2},{yPercent:0,rotate:0,opacity:1,duration:.9,stagger:.035,ease:'power4.out',scrollTrigger:{trigger:heading,start:'top 92%',once:true}});
    });
    document.querySelectorAll('[data-reveal]').forEach(node=>{
     const targets=node.querySelector('h2')?[...node.children].filter(n=>n.tagName!=='H2'):node;
     gsap.fromTo(targets,{y:28,opacity:.15},{y:0,opacity:1,duration:.8,stagger:.09,ease:'power3.out',scrollTrigger:{trigger:node,start:'top 91%',once:true}});
    });
    if(document.querySelector('.attic-image')) gsap.fromTo('.attic-image',{scale:1.08},{scale:1,duration:1.8,ease:'power3.out'});
    if(document.querySelector('.home-hero')){
     gsap.to('.attic-image',{yPercent:9,ease:'none',scrollTrigger:{trigger:'.home-hero',start:'top top',end:'bottom top',scrub:1}});
     gsap.fromTo('.hero-image-slice',{x:i=>i===0?-26:24,opacity:.6},{x:0,opacity:0,duration:1.5,stagger:.15,ease:'power4.out'});
    }
    gsap.to('.reading-progress i',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.25}});
    if(fine)document.querySelectorAll('[data-parallax]').forEach(layer=>{
     gsap.fromTo(layer,{y:-20},{y:20,ease:'none',scrollTrigger:{trigger:layer.parentElement,start:'top bottom',end:'bottom top',scrub:1}});
    });
    document.querySelectorAll('.project-chapter,.space-chapter').forEach(chapter=>{
     const image=chapter.querySelector('figure img,.space-media img');
     if(image)gsap.fromTo(image,{scale:1.05,clipPath:'inset(8% 0 8% 0)'},{scale:1,clipPath:'inset(0% 0 0% 0)',ease:'none',scrollTrigger:{trigger:image,start:'top 95%',end:'top 35%',scrub:1}});
    });
    const graph=document.querySelector('.knowledge-map');
    if(graph){
     graph.querySelectorAll('.map-edge').forEach(edge=>{
      const length=edge.getTotalLength();
      gsap.fromTo(edge,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:1.5,ease:'power2.out',scrollTrigger:{trigger:graph,start:'top 80%',once:true}});
     });
     gsap.fromTo(graph.querySelectorAll('.graph-node'),{opacity:.2},{opacity:1,stagger:.08,duration:.8,scrollTrigger:{trigger:graph,start:'top 75%',once:true}});
    }
    gsap.fromTo('.next-page strong',{y:45},{y:0,ease:'none',scrollTrigger:{trigger:'.next-page',start:'top bottom',end:'bottom bottom',scrub:1}});
   });
   document.querySelectorAll('.button,.nav-trigger').forEach(button=>{
    if(!fine)return;
    const move=e=>{const r=button.getBoundingClientRect();gsap.to(button,{x:(e.clientX-r.left-r.width/2)*.07,y:(e.clientY-r.top-r.height/2)*.1,duration:.35,ease:'power3.out'});};
    const leave=()=>gsap.to(button,{x:0,y:0,duration:.5,ease:'power3.out'});
    button.addEventListener('pointermove',move);button.addEventListener('pointerleave',leave);
    cleanups.push(()=>{button.removeEventListener('pointermove',move);button.removeEventListener('pointerleave',leave);gsap.set(button,{clearProps:'transform'});});
   });
   const refresh=()=>ScrollTrigger.refresh();
   document.fonts?.ready.then(()=>{if(!cancelled)refresh();});
   window.addEventListener('load',refresh);
   const resize=new ResizeObserver(()=>ScrollTrigger.refresh());resize.observe(document.querySelector('main'));
   dispose=()=>{resize.disconnect();window.removeEventListener('load',refresh);menuObserver.disconnect();gsap.ticker.remove(tick);lenis?.destroy();cleanups.forEach(fn=>fn());context.revert();originals.reverse().forEach(fn=>fn());};
  }).catch(()=>{/* Static content remains usable if the animation module cannot load. */});
  return()=>{cancelled=true;dispose();};
 },[enabled,page]);
}

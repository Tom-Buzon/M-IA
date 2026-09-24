import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
export default function SignalText({text}) {
 const [display,setDisplay]=useState(text);
 const frame=useRef(0);
 useEffect(()=>()=>cancelAnimationFrame(frame.current),[]);
 function decode(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.motion==='off')return;
  cancelAnimationFrame(frame.current);
  const start=performance.now(), glyphs='_/+·:01';
  const tick=now=>{
   const progress=Math.min(1,(now-start)/420);
   setDisplay([...text].map((letter,i)=>i/text.length<progress||letter===' '?letter:glyphs[(i+Math.floor(now/45))%glyphs.length]).join(''));
   if(progress<1)frame.current=requestAnimationFrame(tick);
  };
  frame.current=requestAnimationFrame(tick);
 }
 return <span className="signal-text" onPointerEnter={decode} onFocus={decode}><span className="signal-stable">{text}</span><span className="signal-visual" aria-hidden="true">{display}</span></span>;
}
SignalText.propTypes={text:PropTypes.string.isRequired};

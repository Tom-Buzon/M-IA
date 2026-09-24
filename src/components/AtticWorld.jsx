import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
export default function AtticWorld({ page }) {
  const host=useRef(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{
    let cancelled=false,dispose;
    const fail=()=>{if(cancelled)return;setReady(false);document.documentElement.classList.remove('world-ready');};
    import('../scene/atticWorld').then(({createAtticWorld})=>{
      if(cancelled)return;
      try {dispose=createAtticWorld(host.current,{page,onReady:()=>{setReady(true);document.documentElement.classList.add('world-ready');},onFailure:fail});}
      catch {fail();}
    }).catch(fail);
    return()=>{cancelled=true;dispose?.();document.documentElement.classList.remove('world-ready');};
  },[page]);
  return <div ref={host} className={'attic-world'+(ready?' is-ready':'')} aria-hidden="true"/>;
}
AtticWorld.propTypes={page:PropTypes.string.isRequired};

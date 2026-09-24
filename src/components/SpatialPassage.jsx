import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../i18n/Locale';

// Text beats share the camera's measured passage, rather than introducing a second scroll driver.
export default function SpatialPassage({ from, to, number, title, text, target, label, area = 'Le portfolio', facts = [], beats = [], children }) {
  const { t } = useLocale();
  const section = useRef(null);
  const [active, setActive] = useState(null);
  useEffect(() => {
    if (!beats.length) return;
    let frame = 0;
    const compact = matchMedia('(max-width: 800px), (max-height: 640px), (prefers-reduced-motion: reduce)');
    function measure() {
      frame = 0;
      if (compact.matches || document.documentElement.dataset.motion === 'off' || !document.documentElement.classList.contains('world-ready')) { setActive(null); return; }
      const rect = section.current.getBoundingClientRect();
      const progress = Math.max(0, Math.min(.999, -rect.top / Math.max(1, rect.height - innerHeight)));
      setActive(Math.floor(progress * beats.length));
    }
    function queue() { if (!frame) frame = requestAnimationFrame(measure); }
    const observer = new MutationObserver(queue);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-motion'] });
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    window.addEventListener('attic:motion', queue);
    compact.addEventListener('change', queue);
    measure();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('scroll', queue); window.removeEventListener('resize', queue); window.removeEventListener('attic:motion', queue); compact.removeEventListener('change', queue); };
  }, [beats.length]);
  return <section ref={section} className="spatial-passage" data-scene-stop={from} data-scene-to={to} aria-label={t(title)}>
    <div className="passage-sticky">
      <div className="passage-coordinate"><span>{t(area)}</span><span>{number}</span></div>
      <div className="passage-copy"><h2>{t(title)}</h2><p>{t(text)}</p>
        {facts.length > 0 && <ul className="passage-facts">{facts.map(([heading,detail])=><li key={heading}><strong>{t(heading)}</strong><span>{t(detail)}</span></li>)}</ul>}
        {beats.length > 0 && <div className="passage-beats">
          <div className="beat-track" aria-hidden="true">{beats.map(([heading], i)=><i key={heading} className={active === i ? 'is-active' : ''} />)}</div>
          {beats.map(([heading, detail], i)=><div className="passage-beat" key={heading} hidden={active !== null && active !== i}>
            <span className="beat-number">0{i + 1} / 0{beats.length}</span><h3>{t(heading)}</h3><p>{t(detail)}</p>
          </div>)}
        </div>}
        {target && <a href={target} className="quiet-link">{t(label)} <span>↓</span></a>}
      </div>
      {children && <div className="passage-choices">{children}</div>}
    </div>
  </section>;
}
SpatialPassage.propTypes={from:PropTypes.number.isRequired,to:PropTypes.number.isRequired,number:PropTypes.string.isRequired,title:PropTypes.string.isRequired,text:PropTypes.string.isRequired,target:PropTypes.string,label:PropTypes.string,area:PropTypes.string,facts:PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),beats:PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),children:PropTypes.node};

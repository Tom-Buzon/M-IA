import { useLocale } from "../i18n/Locale";
import { useState } from 'react';
const sourceNodes = [{
  name: 'Une idée',
  x: 100,
  y: 95,
  detail: 'Capturer une intuition avant qu’elle ne se perde.'
}, {
  name: 'Documents',
  x: 345,
  y: 75,
  detail: 'Importer les documents et garder leurs sources.'
}, {
  name: 'Décisions',
  x: 390,
  y: 220,
  detail: 'Retrouver ce qui a été décidé et dans quel contexte.'
}, {
  name: 'Contexte',
  x: 320,
  y: 340,
  detail: 'Relier les informations à leur chronologie.'
}, {
  name: 'Connaissances',
  x: 100,
  y: 310,
  detail: 'Explorer les liens entre ses notes et ses projets.'
}, {
  name: 'Sources',
  x: 65,
  y: 205,
  detail: 'Revenir au document qui soutient une réponse.'
}];
export default function KnowledgeMap() {
  const {
    t,
    localize
  } = useLocale();
  const nodes = localize(sourceNodes);
  const [active, setActive] = useState(2);
  return <div className="knowledge-map">
    <div className="map-top"><span><i className="status-dot" />{t(" MASTERmind / EXPLORER")}</span><span>{t("LOCAL FIRST ↗")}</span></div>
    <svg viewBox="0 0 470 415" role="group" aria-label={t("Illustration interactive d’un graphe de connaissance")}>
      <defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#ffffff" opacity=".13" /></pattern></defs>
      <rect width="470" height="415" fill="url(#grid)" />
      <circle className="map-orbit" cx="230" cy="205" r="142" />
      {nodes.map((n, i) => <g key={n.name}>
        <path d={`M230 205 Q${(230 + n.x) / 2 + 30} ${n.y} ${n.x} ${n.y}`} className={i === active ? 'map-edge active' : 'map-edge'} />
        <g role="button" tabIndex="0" aria-label={n.name} aria-pressed={i === active} className={i === active ? 'graph-node active' : 'graph-node'} onClick={() => setActive(i)} onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setActive(i);
          }
        }}>
          <circle cx={n.x} cy={n.y} r="7" /><circle className="node-hit" cx={n.x} cy={n.y} r="23" />
          <text x={n.x} y={n.y + 28} textAnchor="middle">{n.name}</text>
        </g>
      </g>)}
      <g className="map-core"><rect x="191" y="166" width="78" height="78" rx="22" /><path d="M211 222v-34l19 21 19-21v34" /></g>
      <text x="230" y="268" textAnchor="middle" className="core-label">{t("VOTRE MÉMOIRE")}</text>
    </svg>
    <div className="map-bottom"><span className="map-index">0{active + 1} / 06</span><p aria-live="polite">{nodes[active].detail}</p><span>↗</span></div>
    <div className="map-caption">{t("Graphe illustratif · Explorez les points")}</div>
  </div>;
}

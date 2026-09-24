import SpatialPassage from '../components/SpatialPassage';
import { useLocale } from "../i18n/Locale";
import { useEffect, useRef, useState } from 'react';
import { email, services as sourceServices } from '../data';
function Brief() {
  const {
    t,
    localize
  } = useLocale();
  const services = localize(sourceServices);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({
    service: '',
    description: '',
    platform: t("À définir ensemble"),
    timeline: t("À discuter"),
    budget: t("À cadrer"),
    name: '',
    contact: ''
  });
  const [notice, setNotice] = useState('');
  const formRef = useRef(null);
  const previousStep = useRef(1);
  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    formRef.current?.focus({
      preventScroll: true
    });
    formRef.current?.scrollIntoView({
      block: 'start',
      behavior: 'instant'
    });
  }, [step]);
  const field = key => ({
    value: values[key],
    onChange: e => setValues({
      ...values,
      [key]: e.target.value
    })
  });
  const selected = services.find(s => s.id === values.service);
  const summary = t("Bonjour Tom,\n\nJe souhaite échanger avec Attic-Ai.\n\nBesoin : ") + (selected?.title || t("À préciser ensemble")) + t("\nContexte : ") + values.description + t("\nSupport : ") + values.platform + t("\nÉchéance : ") + values.timeline + t("\nBudget : ") + values.budget + '\n\n' + values.name + '\n' + values.contact;
  return <section className="brief-section section" id="brief" data-scene-stop="5"><div className="wrap brief-layout">
    <div><p className="overline">{t("PARLONS DE VOTRE PROJET")}</p><h2>{t("Le premier pas,")}<br />{t("c’est le contexte.")}</h2><p>{t("Un brief court pour préparer notre échange. Aucun compte à créer.")}</p><a className="quiet-link" href={'mailto:' + email}>{t("Ou écrivez-moi directement ↗")}</a><div className="brief-note"><span>{t("ET ENSUITE ?")}</span><p>{t("On clarifie votre besoin, puis je vous propose un périmètre et les prochaines étapes. Aucun devis automatique.")}</p></div></div>
    <div className="brief-form" ref={formRef} tabIndex={-1}><ol className="step-indicator" aria-label={t("Étapes du brief")}>{[t("Votre besoin"), t("Le contexte"), t("Récapitulatif")].map((label, i) => <li key={label} aria-current={step === i + 1 ? 'step' : undefined}><span>{i + 1}</span>{label}</li>)}</ol>
    <form onSubmit={e => {
          e.preventDefault();
          setNotice('');
          setStep(step + 1);
        }}>
      {step === 1 && <fieldset><legend>{t("Qu’aimeriez-vous faire avancer ?")}</legend><div className="service-options">{services.map(s => <label key={s.id}><input type="radio" name="service" value={s.id} checked={values.service === s.id} onChange={e => setValues({
                  ...values,
                  service: e.target.value
                })} /><span>{s.title}</span></label>)}<label><input type="radio" name="service" value="" checked={!values.service} onChange={() => setValues({
                  ...values,
                  service: ''
                })} /><span>{t("J’ai besoin d’en parler")}</span></label></div><button className="button button-dark" type="submit">{t("Continuer ")}<span>→</span></button></fieldset>}
      {step === 2 && <fieldset><legend>{t("Racontez-nous la situation.")}</legend><label className="field">{t("Votre besoin et les utilisateurs concernés ")}<textarea required minLength={10} maxLength={1800} rows={4} placeholder={t("Aujourd’hui, nous… Nous aimerions pouvoir…")} {...field('description')} /></label>
        <div className="form-row"><label className="field">{t("Support envisagé")}<select {...field('platform')}>{[t("À définir ensemble"), t("Web"), t("Mobile"), t("Desktop"), t("Intégration à un outil existant"), t("Expérience / objet connecté")].map(v => <option key={v}>{v}</option>)}</select></label><label className="field">{t("Échéance")}<select {...field('timeline')}>{[t("À discuter"), t("Dès que possible"), t("Dans les 3 prochains mois"), t("Plus tard / exploration")].map(v => <option key={v}>{v}</option>)}</select></label></div>
        <label className="field">{t("Enveloppe ou contrainte budgétaire (facultatif)")}<input maxLength={120} placeholder={t("À cadrer")} {...field('budget')} /></label>
        <div className="form-row"><label className="field">{t("Votre nom")}<input autoComplete="name" maxLength={100} {...field('name')} /></label><label className="field">{t("Email de retour (facultatif)")}<input type="email" autoComplete="email" maxLength={160} {...field('contact')} /></label></div>
        <div className="actions"><button className="quiet-link" type="button" onClick={() => setStep(1)}>{t("← Retour")}</button><button className="button button-dark" type="submit">{t("Préparer le brief ")}<span>→</span></button></div>
      </fieldset>}
    </form>
    {step === 3 && <div className="brief-review"><h3>{t("Votre point de départ")}</h3><dl><div><dt>{t("Besoin")}</dt><dd>{selected?.title || t("À préciser ensemble")}</dd></div><div><dt>{t("Contexte")}</dt><dd>{values.description}</dd></div><div><dt>{t("Support · échéance")}</dt><dd>{values.platform} · {values.timeline}</dd></div><div><dt>{t("Enveloppe")}</dt><dd>{values.budget || t("À cadrer")}</dd></div></dl>{selected && <p><strong>{t("Premiers livrables à discuter :")}</strong> {selected.deliverables.join(', ')}.</p>}<a className="button button-dark" href={'mailto:' + email + '?subject=' + encodeURIComponent(t("Un projet avec Attic-Ai — ") + (values.name || selected?.title || t("premier échange"))) + '&body=' + encodeURIComponent(summary)}>{t("Ouvrir mon email ")}<span>↗</span></a><div className="actions"><button className="quiet-link" onClick={() => setStep(2)}>{t("← Modifier")}</button><button className="quiet-link" onClick={async () => {
              try {
                await navigator.clipboard.writeText(summary);
                setNotice(t("Brief copié. Vous pouvez le coller dans votre email."));
              } catch {
                setNotice(t("La copie est indisponible. Utilisez « Ouvrir mon email »."));
              }
            }}>{t("Copier le brief")}</button></div><p role="status">{notice}</p></div>}
    <p className="form-privacy">{t("Ce formulaire prépare un email dans votre messagerie. Rien n’est envoyé ni enregistré par le site.")}</p></div>
  </div></section>;
}
export default function Agency() {
  const {
    t,
    url,
    localize
  } = useLocale();
  const services = localize(sourceServices);
  return <>
    <section data-scene-stop="0" className="agency-hero wrap"><p className="overline">{t("ATTIC-AI / L’AGENCE")}</p><div className="agency-intro"><h1>{t("Bien cadrer.")}<br />{t("Bien construire.")}<br /><span className="muted">{t("Pouvoir reprendre.")}</span></h1><div><p className="large-copy">{t("Du conseil technique au produit utilisable, avec un interlocuteur qui garde la vue d’ensemble.")}</p><p>{t("Attic-Ai accompagne les porteurs de projet et les équipes qui veulent lancer un service, améliorer leurs outils ou explorer un usage de l’IA.")}</p><a className="button button-dark" href="#brief">{t("Discuter de votre besoin ")}<span>↗</span></a></div></div><div className="agency-principles"><span>{t("Un périmètre explicite")}</span><span>{t("Des validations concrètes")}</span><span>{t("Une livraison documentée")}</span></div></section>
    <SpatialPassage from={0} to={3} number="01 / 03" area="Le studio" title="Avant le code, une décision." text="Autour de la table, on transforme une demande en périmètre vérifiable. L’établi vient ensuite." target="#services" label="Trouver le bon accompagnement" beats={[
      ['Cadrer', 'Usages, contraintes et risques prioritaires.'],
      ['Éprouver', 'Un prototype pour tester l’hypothèse centrale.'],
      ['Transmettre', 'Code, documentation et critères de reprise.'],
    ]} />
    <section className="section wrap services-section" id="services" data-scene-stop="3"><div className="section-heading"><p className="overline">{t("LES DOMAINES D’INTERVENTION")}</p><h2>{t("Le bon niveau d’aide.")}<br />{t("Au bon moment.")}</h2><p>{t("Une mission peut commencer par du conseil et se prolonger par la réalisation. Chaque étape a ses livrables et ses critères de réussite.")}</p></div>
      <div className="service-index" aria-label={t("Accès aux services")}>{services.map(s => <a key={s.id} href={'#' + s.id}>{s.title} ↓</a>)}</div>
      {services.map((s, i) => <article className="service-detail" id={s.id} key={s.id}><div className="service-title"><span className="index">0{i + 1}</span><h3>{s.title}</h3><p>{s.lead}</p><div className="tags">{s.tags.map(t => <span key={t}>{t}</span>)}</div></div><div className="service-body"><p className="service-audience">{s.audience}</p><p>{s.work}</p><div className="service-evidence"><div><h4>{t("Ce que vous récupérez")}</h4><ul>{s.deliverables.map(d => <li key={d}>{d}</li>)}</ul></div><div><h4>{t("Ce que l’on mesure")}</h4><p>{s.kpi}</p></div></div><p className="service-limit">{s.limit}</p><a className="quiet-link" href="#brief">{t("Cadrer cette mission ↗")}</a></div></article>)}
    </section>
    <section className="agency-method section" id="methode" data-scene-stop="3" data-scene-to="5" data-scene-view="true"><div className="wrap"><p className="overline">{t("UNE MÉTHODE LISIBLE")}</p><h2>{t("Pas de boîte noire")}<br />{t("entre l’idée et la livraison.")}</h2><div className="delivery-steps">{[[t("Cadrer"), t("Usages, existant, contraintes et risques."), t("Un périmètre et des critères d’acceptation.")], [t("Éprouver"), t("Tester l’hypothèse la plus incertaine."), t("Un prototype et une décision de poursuivre ou d’ajuster.")], [t("Construire"), t("Développer par étapes et montrer le résultat."), t("Des versions vérifiables sur les parcours prévus.")], [t("Transmettre"), t("Déployer, documenter et organiser la reprise."), t("Le code, les accès convenus et une feuille de route.")]].map(([title, text, out], i) => <div key={title} data-reveal><span className="index">0{i + 1}</span><h3>{title}</h3><p>{text}</p><p className="step-output">{out}</p></div>)}</div></div></section>
    <section className="section wrap measurement" id="mesures" data-scene-stop="5"><div><p className="overline">{t("LA RÉUSSITE SE DÉFINIT ENSEMBLE")}</p><h2>{t("Des mesures utiles.")}<br />{t("Pas des chiffres")}<br />{t("décoratifs.")}</h2><p>{t("Ces indicateurs sont des critères à définir au cadrage, pas des performances déjà obtenues. La mesure compare un état initial et un usage testé dans les mêmes conditions.")}</p></div><div className="metrics-table"><div><span>{t("OBJECTIF")}</span><span>{t("INDICATEUR")}</span><span>{t("COMMENT LE VÉRIFIER")}</span></div><div><strong>{t("Gagner du temps")}</strong><span>{t("Minutes par opération")}</span><span>{t("Chronométrer un scénario avant / après")}</span></div><div><strong>{t("Rendre le produit utilisable")}</strong><span>{t("Taux de complétion")}</span><span>{t("Observer des utilisateurs sur un parcours")}</span></div><div><strong>{t("Maîtriser une IA")}</strong><span>{t("Coût · latence p95 · qualité")}</span><span>{t("Évaluer un jeu de questions et ses sources")}</span></div><div><strong>{t("Fiabiliser une intégration")}</strong><span>{t("Échecs et reprises manuelles")}</span><span>{t("Suivre les journaux sur une période convenue")}</span></div></div></section>
    <section className="tom-section section" id="tom"><div className="wrap tom-layout"><div className="tom-monogram" aria-hidden="true"><span>t.</span><small>{t("LEIDEN, NL")}<br />{t("BUILD & CONSEIL")}</small></div><div><p className="overline">{t("LA PERSONNE DERRIÈRE L’ATELIER")}</p><h2>{t("Tom Buzon.")}<br />{t("Curieux par nature,")}<br />{t("constructeur par pratique.")}</h2><p>{t("Développement web à Toulouse, contrôle de projet à l’Agence spatiale européenne, puis approfondissement du machine learning : mon parcours m’a appris à relier la technique, les contraintes et l’usage.")}</p><p>{t("Attic-Ai est mon atelier indépendant, né dans un grenier. J’y construis aussi mes propres projets. C’est une façon d’éprouver les outils, de comprendre leurs limites et de garder les mains dans le concret.")}</p><a className="quiet-link" href={url("/portfolio/")}>{t("Voir ce que cette approche produit ↗")}</a></div></div></section>
    <Brief />
    <section className="section wrap privacy-section" id="confidentialite"><div><p className="overline">{t("DONNÉES & CONTACT")}</p><h2>{t("Un échange clair,")}<br />{t("dès le départ.")}</h2></div><div><h3>{t("Vous gardez la main sur le premier contact.")}</h3><p>{t("Le brief reste dans votre page jusqu’à l’ouverture de votre messagerie. Vous décidez de l’envoyer à Tom Buzon : ")}<a href={'mailto:' + email}>{email}</a>.</p><h3>{t("Le conseiller est une démonstration d’IA.")}</h3><p>{t("Vos messages sont transmis à OpenRouter et au fournisseur du modèle pour générer la réponse. Le site ne conserve pas les conversations côté serveur. Évitez les données confidentielles ; les pratiques des fournisseurs restent applicables. ")}<a href="https://openrouter.ai/privacy" target="_blank" rel="noreferrer">{t("Politique OpenRouter ↗")}</a></p><p>{t("Pour une mission, les accès, l’hébergement, la confidentialité et les conditions de maintenance se définissent dans la proposition.")}</p></div></section>
  </>;
}

import { useLocale } from "../i18n/Locale";
import SpatialPassage from '../components/SpatialPassage';
import { publicUrl } from '../lib/publicUrl';
export default function Home() {
  const {
    t,
    url
  } = useLocale();
  return <>
    <section className="home-hero" data-scene-stop="0">
      <img className="attic-image" src={publicUrl('/images/attic-studio.webp')} alt="" width="1672" height="941" />
      <div className="hero-shade" /><div className="hero-image-slice slice-one" aria-hidden="true" /><div className="hero-image-slice slice-two" aria-hidden="true" />
      <div className="hero-copy wrap">
        <p className="overline"><span className="small-line" />{t(" AGENCE DE BUILD & CONSEIL · LEIDEN")}</p>
        <h1>{t("De l’idée")}<br />{t("au premier")}<br /><span className="warm">{t("vrai usage.")}</span></h1>
        <p className="hero-description">{t("Un produit à lancer. Un outil à simplifier. Une IA à rendre utile.")}<br className="desktop-break" />{t(" Attic-Ai conçoit et construit avec vous ce qui manque.")}</p>
        <div className="actions"><a className="button button-light" href={url("/agence/#brief")}>{t("Cadrer mon projet ")}<span>↗</span></a><a className="quiet-link" href={url("/agence/")}>{t("Découvrir l’agence ")}<span>→</span></a></div>
      </div>
      <div className="hero-baseline wrap"><span>{t("DU GRENIER AUX PROJETS QUI COMPTENT.")}</span><span>{t("CONSEIL · PRODUIT · IA APPLIQUÉE")}</span><a href="#depart" aria-label={t("Découvrir la suite")}>↓</a></div>
    </section>
    <SpatialPassage from={0.3} to={1.4} number="01 / 02" area="Le point de départ" title="Entrez. On fabrique ici." text="Du premier échange au premier usage, le projet passe par des étapes concrètes." target="#depart" label="Partir de votre besoin" beats={[
      ['Comprendre', 'Avant de choisir un outil, définir qui l’utilisera et ce qui doit changer.'],
      ['Construire', 'À l’établi, une idée devient un prototype que l’on peut essayer.'],
      ['Vérifier', 'Un résultat observable permet de décider de la suite.'],
    ]} />
    <section className="section wrap" id="depart" data-scene-stop="1.4">
      <div className="section-heading" data-reveal><p className="overline">{t("LE POINT DE DÉPART")}</p><h2>{t("Vous savez ce qui bloque.")}<br /><span className="muted">{t("Trouvons ce qui débloque.")}</span></h2><p>{t("On commence par votre situation. La technologie vient ensuite.")}</p></div>
      <div className="situations">
        <a href={url("/agence/#mvp")} data-reveal><span className="index">{t("01 / UNE IDÉE")}</span><h3>{t("« Je veux savoir")}<br />{t("si ça peut marcher. »")}</h3><p>{t("Un périmètre clair, un prototype à essayer et des retours pour décider de la suite.")}</p><span className="text-link">{t("Tester un premier usage ↗")}</span></a>
        <a href={url("/agence/#produit")} data-reveal><span className="index">{t("02 / UN PRODUIT")}</span><h3>{t("« Il faut le construire.")}<br />{t("Ou le faire évoluer. »")}</h3><p>{t("Une application cohérente, de l’interface aux données, jusqu’à sa mise en ligne.")}</p><span className="text-link">{t("Construire le produit ↗")}</span></a>
        <a href={url("/agence/#automation")} data-reveal><span className="index">{t("03 / UN FREIN")}</span><h3>{t("« On perd trop")}<br />{t("de temps là-dessus. »")}</h3><p>{t("Des outils reliés, des tâches automatisées et une IA évaluée sur vos vrais besoins.")}</p><span className="text-link">{t("Simplifier le quotidien ↗")}</span></a>
      </div>
    </section>
    <section className="home-method section" id="methode" data-scene-stop="1.7">
      <div className="wrap method-layout"><div data-reveal><p className="overline">{t("DE LA DISCUSSION AU LIVRABLE")}</p><h2>{t("Avancer.")}<br />{t("Avec quelque chose")}<br /><span className="warm">{t("à vérifier.")}</span></h2><a className="quiet-link" href={url("/agence/#methode")}>{t("La méthode en détail →")}</a></div>
      <ol className="method-list">
        <li data-reveal><span>01</span><div><h3>{t("Comprendre le vrai besoin")}</h3><p>{t("Pour qui, pour quoi, avec quelles contraintes ? On définit un résultat observable et un premier périmètre.")}</p></div></li>
        <li data-reveal><span>02</span><div><h3>{t("Construire, montrer, ajuster")}</h3><p>{t("Des versions utilisables et des points de contrôle. Les décisions restent visibles pendant le développement.")}</p></div></li>
        <li data-reveal><span>03</span><div><h3>{t("Livrer et transmettre")}</h3><p>{t("Le produit, son code, sa documentation et les conditions de sa reprise. La suite se décide sur ce qui a été testé.")}</p></div></li>
      </ol></div>
    </section>
    <section className="section wrap workshop" id="atelier" data-scene-stop="2.1">
      <div className="workshop-heading" data-reveal><p className="overline">{t("UN ATELIER, PLUSIEURS TERRAINS")}</p><h2>{t("Le problème ne s’arrête")}<br />{t("pas à une technologie.")}<br /><span className="muted">{t("Nous non plus.")}</span></h2><p className="workshop-context">{t("Cette polyvalence se construit en pratiquant. Le portfolio raconte les expérimentations, les produits en cours et les liens entre ces disciplines.")}</p></div>
      <div className="capability-lines" data-reveal><p><span>01</span>{t(" Web, mobile & desktop")}</p><p><span>02</span>{t(" IA, data & automatisation")}</p><p><span>03</span>{t(" 3D, audio & vidéo")}</p><p><span>04</span>{t(" Interactions & objets connectés")}</p></div>
    </section>
    <SpatialPassage from={2.1} to={8} number="02 / 02" area="L’atelier en mouvement" title="Les disciplines se parlent." text="Une information à retrouver. Un son à situer. Un espace à imaginer. Chaque discipline apporte une autre façon de résoudre le problème." target={url('/portfolio/')} label="Explorer les réalisations" beats={[
      ['Relier l’information', 'Données, recherche et interfaces : rendre une information retrouvable et utilisable.'],
      ['Travailler la perception', 'Voix, son et vidéo : choisir la bonne façon de transmettre une information.'],
      ['Passer au volume', '3D et objets connectés : prolonger une expérience au-delà de l’écran.'],
    ]} />
    <section className="origin-section" id="origine" data-scene-stop="8">
      <div className="origin-roof" aria-hidden="true"><svg viewBox="0 0 600 320"><path d="M20 300 300 20l280 280M130 300l170-170 170 170M240 300l60-60 60 60" /></svg></div>
      <div className="wrap origin-copy" data-reveal><p className="overline">{t("POURQUOI ATTIC-AI ?")}</p><h2>{t("Tout a commencé")}<br />{t("dans un grenier.")}</h2><p>{t("Un endroit pour apprendre, bricoler, coder et pousser les idées un peu plus loin. Attic-Ai garde cet esprit d’atelier : comprendre comment les choses fonctionnent, puis les faire fonctionner ensemble.")}</p><p>{t("Je suis Tom Buzon. Après le développement web et le contrôle de projet à l’ESA, j’ai approfondi le machine learning. Aujourd’hui, ces expériences se rejoignent dans la conception de produits.")}</p><a className="quiet-link" href={url("/agence/#tom")}>{t("Rencontrer la personne derrière l’agence →")}</a></div>
    </section>
    <section className="section wrap faq-section" id="questions"><div><p className="overline">{t("AVANT DE SE PARLER")}</p><h2>{t("Pas besoin d’avoir")}<br />{t("toutes les réponses.")}</h2></div><div className="faq">
      <details><summary>{t("Mon idée n’est pas encore bien définie. ")}<span>+</span></summary><p>{t("C’est justement le rôle du cadrage. Décrivez le problème, les personnes concernées et ce que vous faites aujourd’hui. Nous identifierons ce qui mérite un premier test.")}</p></details>
      <details><summary>{t("Vous pouvez reprendre un projet existant ? ")}<span>+</span></summary><p>{t("Oui. On commence par examiner le code, les usages et les contraintes de reprise. Cet état des lieux permet de proposer une évolution réaliste.")}</p></details>
      <details><summary>{t("Quel budget et quel délai prévoir ? ")}<span>+</span></summary><p>{t("Ils dépendent du périmètre, des intégrations et des risques. Vous recevez une proposition après cadrage, avec les livrables, les hypothèses et les étapes de validation.")}</p></details>
      <details><summary>{t("Faut-il absolument de l’IA ? ")}<span>+</span></summary><p>{t("Non. Une interface plus simple ou une automatisation classique peut suffire. On compare les options selon leur utilité, leur coût et leur fiabilité.")}</p></details>
    </div></section>
    <section className="contact-finale" id="contact"><div className="wrap"><p className="overline">{t("LE PROCHAIN PROJET COMMENCE PAR UNE CONVERSATION")}</p><h2>{t("Qu’est-ce qu’on")}<br />{t("construit ensemble ?")}</h2><a className="button button-dark" href={url("/agence/#brief")}>{t("Parlons de votre idée ")}<span>↗</span></a><p>{t("Quelques lignes suffisent pour commencer.")}</p></div></section>
  </>;
}

import { useLocale } from "../../i18n/Locale";
import { useEffect, useRef, useState } from 'react';
import { FiArrowUpRight, FiX, FiSend, FiSquare, FiRotateCcw } from 'react-icons/fi';
import { readSSE } from '../../lib/sse';
export default function Chatbot() {
  const {
    t,
    locale
  } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [usedModel,setUsedModel]=useState('');
  const [status, setStatus] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [retryAt, setRetryAt] = useState(0);
  const [retrySeconds, setRetrySeconds] = useState(0);
  const abortRef = useRef(null);
  const panel = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const followRef = useRef(true);
  const returnFocus = useRef(null);
  useEffect(() => {
    const show = e => {
      returnFocus.current = document.activeElement;
      setOpen(true);
      if (e.detail) setInput(e.detail);
    };
    window.addEventListener('attic:chat', show);
    return () => {
      window.removeEventListener('attic:chat', show);
      abortRef.current?.abort();
    };
  }, []);
  useEffect(() => {
    const tick = () => setRetrySeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)));
    tick();
    if (!retryAt) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryAt]);
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const controller = new AbortController();
    fetch('/api/model', {
      signal: controller.signal
    }).then(r => {
      if (!r.ok) throw new Error();
      return r.json();
    }).then(setStatus).catch(e => {
      if (e.name !== 'AbortError') setStatus({
        configured: false
      });
    });
    return () => controller.abort();
  }, [open]);
  useEffect(() => {
    if (followRef.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, busy, error, open]);
  function close() {
    setOpen(false);
    returnFocus.current?.focus();
  }
  function handleKeys(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
    if (e.key === 'Tab') {
      const elements = [...panel.current.querySelectorAll('button:not(:disabled), a, textarea')];
      if (e.shiftKey && document.activeElement === elements[0]) {
        e.preventDefault();
        elements.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === elements.at(-1)) {
        e.preventDefault();
        elements[0].focus();
      }
    }
  }
  async function send(text = input, retry = false) {
    if (abortRef.current || !text.trim() || Date.now() < retryAt) return;
    const content = text.trim();
    const controller = new AbortController();
    abortRef.current = controller;
    const history = messages.filter(m => m.complete).map(({
      role,
      content: value
    }) => ({
      role,
      content: value
    }));
    let conversation = [...history, {
      role: 'user',
      content
    }];
    while (conversation.length > 21 || conversation.length > 1 && conversation.reduce((sum, m) => sum + m.content.length, 0) > 26000) conversation = conversation.slice(2);
    const base = retry ? messages.slice(0, -2) : messages;
    setMessages([...base, {
      role: 'user',
      content,
      complete: false
    }, {
      role: 'assistant',
      content: '',
      complete: false
    }]);
    setInput('');
    setError('');
    setNotice('');
    setBusy(true); setSlow(false); setUsedModel('');
    setAnnouncement(t("Le conseiller prépare sa réponse."));
    followRef.current = true;
    let answer = '';
    let completed = false;
    let timedOut = false;
    const waiting = setTimeout(() => { if(!answer) setSlow(true); }, 20000);
    const deadline = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 135000);
    const diagnostic = data => {
      if (data.retryAfter) setRetryAt(Date.now() + data.retryAfter * 1000);
      const source = data.code?.startsWith('OPENROUTER_') ? 'OpenRouter' : t("Service Attic-Ai");
      return (t(data.error) || t("Le service est indisponible. Réessayez.")) + (data.status ? '\n' + source + ' · HTTP ' + data.status + (data.provider ? ' · ' + data.provider : '') : '') + (data.model ? t("\nModèle : ") + data.model : '');
    };
    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: conversation, locale
        })
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (!data.status) data.status = response.status;
        throw new Error(diagnostic(data));
      }
      if (!response.body) throw new Error(t("Streaming indisponible."));
      for await (const raw of readSSE(response.body)) {
        const data = JSON.parse(raw);
        if(data.model && !data.error) setUsedModel(data.fallback ? t('Modèle de secours actif') + ' · ' + data.model : data.model);
        if (data.error) throw new Error(diagnostic(data));
        if (data.text) {
          setSlow(false);
          answer += data.text;
          setMessages([...base, {
            role: 'user',
            content,
            complete: false
          }, {
            role: 'assistant',
            content: answer,
            complete: false
          }]);
        }
        if (data.truncated) setNotice(t("Réponse limitée en longueur. Vous pouvez demander de préciser un point."));
        if (data.done) {
          completed = true;
          break;
        }
      }
      if (!completed || !answer) throw new Error(t("La réponse a été interrompue. Réessayez."));
      setMessages([...base, {
        role: 'user',
        content,
        complete: true
      }, {
        role: 'assistant',
        content: answer,
        complete: true
      }]);
      setAnnouncement(t("Réponse reçue : ") + answer);
    } catch (e) {
      const message = timedOut ? t("Le délai de réponse est dépassé. Vérifiez votre connexion et réessayez.") : e.name === 'AbortError' ? t("Génération arrêtée. Vous pouvez réessayer ou poser une autre question.") : e instanceof TypeError ? t("Connexion au serveur interrompue. Vérifiez votre connexion, puis réessayez.") : e.message;
      setError(message);
      setAnnouncement(message);
    } finally {
      clearTimeout(deadline); clearTimeout(waiting); setSlow(false);
      abortRef.current = null;
      setBusy(false);
    }
  }
  function reset() {
    if (busy) return;
    setMessages([]); setUsedModel('');
    setError('');
    setNotice('');
    setInput('');
    inputRef.current?.focus();
  }
  return <>
    {!open && <button className="chat-launcher" onClick={e => {
      returnFocus.current = e.currentTarget;
      setOpen(true);
    }} aria-label={t("Ouvrir le conseiller IA")}><span className="chat-launcher-icon">⌂</span><span>{t("Une question ?")}<small>{t("Le conseiller Attic-Ai")}</small></span><FiArrowUpRight /></button>}
    {open && <div className="chat-backdrop" onClick={close}>
      <section ref={panel} className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title" onClick={e => e.stopPropagation()} onKeyDown={handleKeys}>
        <header className="chat-header"><span className="chat-avatar">⌂</span><div><h2 id="chat-title">{t("Le conseiller Attic-Ai")}</h2><span>{t("Assistant IA · ")}{busy ? t("Réponse en cours") : t("Explorons votre idée")}</span></div><button className="icon-button" onClick={reset} disabled={busy} aria-label={t("Nouvelle conversation")}><FiRotateCcw /></button><button className="icon-button" onClick={close} aria-label={t("Fermer le conseiller")}><FiX /></button></header>
        <div className="chat-messages" data-lenis-prevent ref={scrollRef} onScroll={() => {
          const el = scrollRef.current;
          followRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
        }}>
          <div className="chat-welcome"><span className="overline">{t("FAISONS CONNAISSANCE")}</span><h3>{t("Une idée, un défi,")}<br />{t("ou juste de la curiosité ?")}</h3><p>{t("Je peux vous parler de Tom, explorer les projets du studio ou vous aider à cadrer votre besoin.")}</p></div>
          {messages.length === 0 && <div className="chat-suggestions">{[t("Quels projets avez-vous construits ?"), t("Comment cadrer mon projet ?"), t("Que peut construire le studio ?")].map(text => <button key={text} disabled={busy || retrySeconds > 0} onClick={() => send(text)}>{text}<FiArrowUpRight /></button>)}</div>}
          {status?.configured === false && <p className="chat-error" role="status">{t("Le conseiller est momentanément indisponible. Vous pouvez ")}<a href="mailto:buzon.tombuzon@gmail.com">{t("écrire à Tom")}</a>.</p>}
          {messages.map((m, i) => m.role === 'assistant' && !m.content && !busy ? null : <div className={'chat-message ' + m.role} key={i}><span>{m.role === 'user' ? t("VOUS") : 'ATTIC-AI'}</span><div className="message-content">{m.content || (busy ? <span className="thinking">{t("Je réfléchis")}<span>…</span></span> : '')}</div>{!m.complete && m.content && !busy && m.role === 'assistant' && <small>{t("Réponse partielle")}</small>}</div>)}
          {slow && <p className="chat-notice" role="status">{t('Le modèle gratuit tarde à répondre. Votre demande est toujours en cours ; vous pouvez l’arrêter ci-dessous.')}</p>}
          {usedModel && <p className="chat-model">{usedModel}</p>}
          {notice && <p className="chat-notice">{notice}</p>}
          {error && <div className="chat-error" role="alert"><p>{error}</p><button className="text-link" disabled={retrySeconds > 0} onClick={() => send(messages.at(-2)?.content || '', true)}>{retrySeconds > 0 ? t("Réessayer dans ") + retrySeconds + ' s' : t("Réessayer")} <FiRotateCcw /></button><a href="mailto:buzon.tombuzon@gmail.com">{t("Écrire à Tom ↗")}</a></div>}
        </div>
        <form className="chat-form" onSubmit={e => {
          e.preventDefault();
          send();
        }}><label className="sr-only" htmlFor="chat-input">{t("Votre message")}</label><textarea ref={inputRef} id="chat-input" value={input} onChange={e => setInput(e.target.value)} placeholder={t("Parlez-moi de votre idée…")} rows={2} maxLength={4000} onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              send();
            }
          }} />{busy ? <button type="button" className="send-button" aria-label={t("Arrêter la réponse")} onClick={() => abortRef.current?.abort()}><FiSquare /></button> : <button type="submit" className="send-button" aria-label={t("Envoyer le message")} disabled={!input.trim() || retrySeconds > 0}><FiSend /></button>}</form>
        <p className="chat-privacy">{t("Messages transmis à OpenRouter et au modèle. Évitez les données sensibles. Historique conservé uniquement dans cette page par le site.")}</p>
        <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
      </section>
    </div>}
  </>;
}

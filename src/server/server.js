import express from 'express';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { once } from 'node:events';
import { readSSE } from '../lib/sse.js';

const root = fileURLToPath(new URL('../../', import.meta.url));

export function createApp({ apiKey = process.env.openrouterToken || process.env.OPENROUTER_API_KEY,
  model = process.env.model || process.env.OPENROUTER_MODEL || 'qwen/qwen3.8-27b:free',
  fallbackModel = process.env.OPENROUTER_FALLBACK_MODEL ?? 'nvidia/nemotron-3.5-lightning:free',
  fetchImpl = fetch, personaPath = path.join(root, 'persona.md'), timeoutMs = 120_000, firstTokenMs = 30_000,
  rateLimit = 15 } = {}) {
  const app = express();
  const visitors = new Map();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use(express.json({ limit: '48kb' }));
  app.get('/api/model', (_req, res) => res.json({ model, fallbackModel, configured: Boolean(apiKey) }));
  app.post('/api/chat/message', async (req, res) => {
    if (req.get('sec-fetch-site') === 'cross-site' ||
        (process.env.APP_ORIGIN && req.get('origin') && req.get('origin') !== process.env.APP_ORIGIN)) {
      return res.status(403).json({ error: 'Origine non autorisée.' });
    }
    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 21 ||
      messages.some((m, i) => !m || m.role !== (i % 2 === 0 ? 'user' : 'assistant') ||
        typeof m.content !== 'string' || !m.content.trim() || m.content.length > 6000) ||
      messages.at(-1).role !== 'user' || messages.reduce((sum, m) => sum + m.content.length, 0) > 32000) {
      return res.status(400).json({ error: 'Conversation invalide ou trop longue. Commencez une nouvelle discussion.' });
    }
    if (!apiKey) return res.status(503).json({ error: 'Le conseiller est en cours de configuration. Contactez Tom par email.' });
    const now = Date.now();
    for (const [key, value] of visitors) if (value.until <= now && !value.active) visitors.delete(key);
    const visitor = visitors.get(req.ip) || { count: 0, active: 0, until: now + 60_000 };
    if (visitor.until <= now) { visitor.count = 0; visitor.until = now + 60_000; }
    if (visitor.count >= rateLimit || visitor.active >= 2 || visitors.size > 10000) {
      res.setHeader('Retry-After', '60');
      return res.status(429).json({ error: 'Trop de demandes. Réessayez dans une minute.', code: 'SITE_RATE_LIMIT', status: 429, retryAfter: 60 });
    }
    visitor.count++; visitor.active++; visitors.set(req.ip, visitor);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const disconnect = () => controller.abort();
    res.on('close', disconnect);
    const send = async data => {
      if (res.destroyed) throw new Error('Disconnected');
      if (!res.write('data: ' + JSON.stringify(data) + '\n\n')) await once(res, 'drain', { signal: controller.signal });
    };
    try {
      const persona = await readFile(personaPath, 'utf8');
      const language = { fr: 'français', en: 'English', nl: 'Nederlands' }[req.body.locale] || 'français';
      const candidates = [...new Set([model, fallbackModel].filter(Boolean))];
      let hasContent = false;
      for (let attempt = 0; attempt < candidates.length; attempt++) {
        const selectedModel = candidates[attempt];
        const canFallback = status => !hasContent && attempt + 1 < candidates.length && [404, 429, 500, 502, 503, 504].includes(status);
        const firstToken = new AbortController();
        const firstTokenTimer = attempt + 1 < candidates.length ? setTimeout(() => firstToken.abort(), firstTokenMs) : undefined;
        try {
        const upstream = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST', signal: AbortSignal.any([controller.signal, firstToken.signal]),
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey, 'X-Title': 'Attic-Ai' },
          body: JSON.stringify({ model: selectedModel, stream: true, max_tokens: 1800,
            ...(['qwen/qwen3.8-27b:free', 'nvidia/nemotron-3.5-lightning:free'].includes(selectedModel) ? { reasoning: { enabled: false } } : {}),
            messages: [{ role: 'system', content: 'You are the AI advisor for Attic-Ai, the studio of Tom Buzon. Answer in ' + language + '. Use that language for the entire reply. The French reference below contains facts, not a language requirement. Do not introduce yourself as the model provider unless asked about it.\n\n' + persona + '\nLangue du site : ' + language + '. Réponds dans cette langue, sauf demande explicite du visiteur.' }, ...messages.map(({ role, content }) => ({ role, content }))] }),
        });
        if (!upstream.ok) {
          const diagnostics = await upstream.json().catch(() => ({}));
          if (canFallback(upstream.status)) continue;
          const providerName = diagnostics.error?.metadata?.provider_name;
          const provider = typeof providerName === 'string' && /^[\w .-]{1,60}$/.test(providerName) ? providerName : undefined;
          const retryAfter = Math.min(300, Math.max(1, Number(upstream.headers.get('retry-after')) || 30));
          const errors = { 400: 'Le modèle configuré est invalide ou indisponible.', 401: 'La clé OpenRouter doit être vérifiée côté serveur.',
            402: 'Le quota OpenRouter est épuisé.', 404: 'Le modèle configuré est indisponible.',
            429: 'Le modèle gratuit est très sollicité. Réessayez dans un instant.' };
          const diagnostic = { error: errors[upstream.status] || 'Le fournisseur IA est indisponible. Réessayez plus tard.',
            code: 'OPENROUTER_' + upstream.status, status: upstream.status, provider, model: selectedModel,
            attemptedModels: candidates.slice(0, attempt + 1), ...(upstream.status === 429 ? { retryAfter } : {}) };
          if (res.headersSent) { await send(diagnostic); res.end(); }
          else {
            if (upstream.status === 429) res.setHeader('Retry-After', String(retryAfter));
            res.status(upstream.status === 429 ? 429 : 502).json(diagnostic);
          }
          return;
        }
        if (!upstream.body) throw new Error('Missing stream');
        if (!res.headersSent) {
          res.set({ 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
          res.flushHeaders();
        }
        await send({ model: selectedModel, fallback: attempt > 0 });
        let done = false;
        let retry = false;
        for await (const data of readSSE(upstream.body)) {
          if (data === '[DONE]') { done = true; break; }
          const chunk = JSON.parse(data);
          if (chunk.error || chunk.choices?.[0]?.finish_reason === 'error') {
            const code = Number(chunk.error?.code);
            if (canFallback(code)) { retry = true; break; }
            const error = new Error('Provider error');
            error.providerStatus = Number.isInteger(code) && code >= 400 && code <= 599 ? code : undefined;
            throw error;
          }
          const content = chunk.choices?.[0]?.delta?.content;
          if (typeof content === 'string' && content) {
            clearTimeout(firstTokenTimer);
            hasContent = true;
            await send({ text: content });
          }
          if (chunk.usage && hasContent) await send({ usage: chunk.usage });
          if (hasContent && chunk.choices?.[0]?.finish_reason === 'length') await send({ truncated: true });
        }
        if (retry || (!hasContent && attempt + 1 < candidates.length)) continue;
        if (!done || !hasContent) throw new Error('Incomplete stream');
        await send({ done: true });
        res.end();
        return;
        } catch (cause) {
          if (!controller.signal.aborted && !hasContent && attempt + 1 < candidates.length && (firstToken.signal.aborted || cause instanceof TypeError)) continue;
          if (firstToken.signal.aborted) cause.firstTokenTimeout = true;
          throw cause;
        } finally { clearTimeout(firstTokenTimer); firstToken.abort(); }
      }
    } catch (cause) {
      if (!res.destroyed) {
        const timedOut = controller.signal.aborted || cause.firstTokenTimeout;
        const error = timedOut ? 'Le délai de réponse est dépassé. Réessayez.' : 'La réponse a été interrompue. Réessayez dans un instant.';
        const diagnostic = { error, code: timedOut ? 'TIMEOUT' : 'STREAM_INTERRUPTED', ...(cause.providerStatus ? { status: cause.providerStatus, code: 'OPENROUTER_' + cause.providerStatus } : {}) };
        if (res.headersSent) { res.write('data: ' + JSON.stringify(diagnostic) + '\n\n'); res.end(); }
        else res.status(502).json(diagnostic);
      }
    } finally {
      clearTimeout(timeout); res.off('close', disconnect); controller.abort(); visitor.active--;
    }
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Route API inconnue.' }));
  const dist = path.join(root, 'dist');
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
    for (const page of ['agence', 'portfolio']) app.get('/' + page, (_req, res) => res.sendFile(path.join(dist, page, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    res.status(error.status === 413 ? 413 : 400).json({ error: 'La requête est invalide ou trop volumineuse.' });
  });
  return app;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (existsSync(path.join(root, '.env'))) process.loadEnvFile(path.join(root, '.env'));
  const port = Number(process.env.PORT) || 3001;
  createApp().listen(port, process.env.HOST || '127.0.0.1', () => console.log('Attic-Ai : http://localhost:' + port));
}

// Preserve complete SSE events and UTF-8 characters across network chunks.
export async function* readSSE(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let match;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        const data = frame.split(/\r?\n/).filter(line => line.startsWith('data:'))
          .map(line => line.slice(5).replace(/^ /, '')).join('\n');
        if (data) yield data;
      }
      if (buffer.length > 1_000_000) throw new Error('Événement trop volumineux.');
      if (done) break;
    }
    if (buffer.trim()) throw new Error('Flux interrompu.');
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

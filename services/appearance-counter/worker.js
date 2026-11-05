/* Anonymous saved appearance choices for Lucily, hosted separately from GitHub Pages. */
const choices = new Set(['enchanted', 'chrisglass', 'material', 'materialglass']);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
    const origin = request.headers.get('Origin');
    const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && allowed.includes(origin)) Object.assign(headers, { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
    if (origin && !allowed.includes(origin)) return json({ error: 'Origin not allowed' }, 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const path = new URL(request.url).pathname;
    try {
      if (path === '/choice' && request.method === 'POST') {
        if (!origin || !allowed.includes(origin)) return json({ error: 'Origin required' }, 403);
        if (!request.headers.get('Content-Type')?.startsWith('application/json')) return json({ error: 'Expected JSON' }, 415);
        // Read a bounded stream, even when Content-Length is absent or untrusted.
        const reader = request.body?.getReader(); if (!reader) return json({ error: 'Missing body' }, 400);
        const chunks = []; let size = 0;
        while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 1024) { await reader.cancel(); return json({ error: 'Body too large' }, 413); } chunks.push(value); }
        const bytes = new Uint8Array(size); let offset = 0; chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.length; });
        let data; try { data = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'Invalid JSON' }, 400); }
        if (!data || typeof data.voter !== 'string' || !uuid.test(data.voter) || !choices.has(data.choice)) return json({ error: 'Invalid choice' }, 400);
        // Upsert replaces this browser's previous selection rather than adding another vote.
        await env.DB.prepare('INSERT INTO appearance_choices (voter, choice, updated_at) VALUES (?, ?, ?) ON CONFLICT(voter) DO UPDATE SET choice=excluded.choice, updated_at=excluded.updated_at').bind(data.voter.toLowerCase(), data.choice, Date.now()).run();
      } else if (!(path === '/counts' && request.method === 'GET')) return json({ error: 'Not found' }, 404);
      const { results } = await env.DB.prepare('SELECT choice, COUNT(*) AS total FROM appearance_choices GROUP BY choice').all();
      const counts = { enchanted: 0, chrisglass: 0, material: 0, materialglass: 0 }; results.forEach(row => { if (choices.has(row.choice)) counts[row.choice] = row.total; });
      return json({ counts });
    } catch { return json({ error: 'Counts temporarily unavailable' }, 503); }
  },
};

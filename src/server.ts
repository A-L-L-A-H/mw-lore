import {
  CHARACTER_REGISTRY,
  LOCKED_CANON_RULES,
  MOONWITNESS_II_ERAS,
  MOONWITNESS_XII_CAST,
  NARRATIVE_FUNCTIONS,
  PATCH_REGISTER_METADATA,
  WORLD_RULES
} from './canon-data';
import {
  type GodPromiseCardInput,
  validateAndRenderGodPromiseCard
} from './god-promise';

const EXPLORER_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>MW-LORE // RIOT-CHAOS WORLD EXPLORER</title>
  <style>
    :root { --bg: #0a0a0c; --fg: #f0ece2; --accent: #ff2a55; --muted: #8a8a98; --panel: #141418; --border: #2c2c35; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; background: var(--bg); color: var(--fg); padding: 1.5rem; }
    header { border-bottom: 2px solid var(--accent); padding-bottom: 1rem; margin-bottom: 1.5rem; }
    h1 { margin: 0; font-size: 1.4rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .sub { color: var(--muted); font-size: 0.85rem; margin-top: 0.35rem; }
    nav { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.25rem; }
    button { background: var(--panel); color: var(--fg); border: 1px solid var(--border); padding: 0.5rem 0.9rem; cursor: pointer; font-family: inherit; text-transform: uppercase; font-size: 0.8rem; }
    button:hover, button.active { border-color: var(--accent); color: var(--accent); }
    pre { background: var(--panel); border: 1px solid var(--border); padding: 1rem; overflow-x: auto; font-size: 0.85rem; line-height: 1.45; }
  </style>
</head>
<body>
  <header>
    <h1>MW-LORE // RIOT-CHAOS EXPLORER</h1>
    <div class="sub">LOCKED CANON: CAN-0001..CAN-0015 | STATUS STRATIFICATION PRESERVED | CAN-0011 GUARD ACTIVE</div>
  </header>
  <nav>
    <button onclick="loadView('/api/eras', this)" class="active">Eras (8)</button>
    <button onclick="loadView('/api/functions', this)">Functions (13)</button>
    <button onclick="loadView('/api/world-rules', this)">World Rules (10)</button>
    <button onclick="loadView('/api/characters', this)">Characters (9)</button>
    <button onclick="loadView('/api/xii', this)">MW XII &amp; 33-Patch</button>
    <button onclick="loadView('/health', this)">Health</button>
  </nav>
  <pre id="output">Loading canon registry...</pre>
  <script>
    async function loadView(path, btn) {
      document.querySelectorAll('nav button').forEach((b) => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      const response = await fetch(path);
      const payload = await response.json();
      document.getElementById('output').textContent = JSON.stringify(payload, null, 2);
    }
    loadView('/api/eras', document.querySelector('nav button'));
  </script>
</body>
</html>`;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'x-canon-governance': 'CAN-0001..CAN-0015'
    }
  });
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (request.method === 'GET' && pathname === '/') {
    return new Response(EXPLORER_HTML, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }

  if (request.method === 'GET' && pathname === '/health') {
    return jsonResponse({
      status: 'ok',
      service: 'mw-lore',
      lockedRulesCount: LOCKED_CANON_RULES.length,
      erasCount: MOONWITNESS_II_ERAS.length,
      functionsCount: NARRATIVE_FUNCTIONS.length,
      worldRulesCount: WORLD_RULES.length,
      charactersCount: CHARACTER_REGISTRY.length
    });
  }

  if (request.method === 'GET' && pathname === '/api/eras') {
    return jsonResponse({
      rule: 'CAN-0001,CAN-0006',
      count: MOONWITNESS_II_ERAS.length,
      eras: MOONWITNESS_II_ERAS
    });
  }

  if (request.method === 'GET' && pathname === '/api/functions') {
    return jsonResponse({
      rule: 'CAN-0007',
      count: NARRATIVE_FUNCTIONS.length,
      functions: NARRATIVE_FUNCTIONS
    });
  }

  if (request.method === 'GET' && pathname === '/api/world-rules') {
    return jsonResponse({
      rule: 'CAN-0008',
      count: WORLD_RULES.length,
      worldRules: WORLD_RULES
    });
  }

  if (request.method === 'GET' && pathname === '/api/characters') {
    return jsonResponse({
      rule: 'CAN-0004,CAN-0005',
      count: CHARACTER_REGISTRY.length,
      autoMergeForbidden: true,
      characters: CHARACTER_REGISTRY
    });
  }

  if (request.method === 'GET' && pathname === '/api/xii') {
    return jsonResponse({
      rule: 'CAN-0012,CAN-0013',
      cast: MOONWITNESS_XII_CAST,
      patchRegister: PATCH_REGISTER_METADATA
    });
  }

  if (request.method === 'POST' && pathname === '/api/god-promise/validate') {
    let body: GodPromiseCardInput;
    try {
      body = (await request.json()) as GodPromiseCardInput;
    } catch {
      return jsonResponse({ valid: false, issues: [{ rule: 'CAN-0015', field: 'body', message: 'Invalid JSON payload.' }] }, 400);
    }

    const validation = validateAndRenderGodPromiseCard(body);
    return jsonResponse(validation, validation.valid ? 200 : 422);
  }

  return jsonResponse({ error: 'Not Found', path: pathname }, 404);
}

export function startServer(port = Number(process.env.MW_LORE_PORT ?? 4450)) {
  return Bun.serve({
    port,
    fetch: handleRequest
  });
}

if (import.meta.main) {
  const server = startServer();
  console.log(`mw-lore listening on http://127.0.0.1:${server.port}`);
}

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async (event, context) => {
  // Resolve DB path: prefer bundled relative path, fallback to process.cwd()
  const preferredDb = path.resolve(__dirname, '../server/bali.db');
  const fallbackDb = path.resolve(process.cwd(), 'server', 'bali.db');

  let resolvedDb = null;
  if (fs.existsSync(preferredDb)) resolvedDb = preferredDb;
  else if (fs.existsSync(fallbackDb)) resolvedDb = fallbackDb;

  if (!resolvedDb) {
    // DB missing — return helpful directory listings for debugging on Netlify
    const tryDirs = [__dirname, process.cwd(), path.join(process.cwd(), 'server')];
    const listings = {};
    for (const d of tryDirs) {
      try {
        listings[d] = fs.readdirSync(d);
      } catch (e) {
        listings[d] = `error: ${e.message}`;
      }
    }

    console.error('Database file not found. Tried:', { preferredDb, fallbackDb });
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Database file not found',
        tried: { preferredDb, fallbackDb },
        listings
      })
    };
  }

  process.env.DB_PATH = process.env.DB_PATH || resolvedDb;
  // Request read-only DB open mode for Netlify functions
  process.env.DB_OPEN_MODE = 'READONLY';
  console.log('api/index.js: using DB at', process.env.DB_PATH);

  // Initialize the JS-based DB wrapper (sql.js) before loading the server
  try {
    const dbModule = await import('../server/db.js');
    if (dbModule && typeof dbModule.initDb === 'function') {
      await dbModule.initDb();
    }
  } catch (err) {
    console.error('DB initialization failed:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'DB initialization failed', message: err?.message })
    };
  }

  // Normalize the incoming path from Netlify:
  // - Strip "/.netlify/functions/<fnName>" if present
  // - Also strip a leading "/api" when using redirects that map /api/* -> /.netlify/functions/index/:splat
  if (event && typeof event.path === 'string') {
    // Prefer rawPath if available (some runtimes provide both)
    let p = event.rawPath || event.path || '';
    // Remove /.netlify/functions/<name> prefix if present
    const nfPrefix = '/.netlify/functions/';
    if (p.startsWith(nfPrefix)) {
      // remove "/.netlify/functions/<name>" (keep any trailing path)
      const parts = p.slice(nfPrefix.length).split('/');
      // parts[0] is function name (e.g., "index"), rest is path
      parts.shift();
      p = '/' + parts.join('/');
    }
    // Keep "/api" prefix intact so Express routes (which use /api/*)
    // continue to match. Do not strip '/api'.
    event.path = p || '/';
  }

  try {
    const appModule = await import('../server/server.js');
    const app = appModule.default || appModule;
    const lambdaHandler = serverless(app);
    return await lambdaHandler(event, context);
  } catch (err) {
    console.error('Error initializing server or DB connection:', err);
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server initialization failed', message: err?.message })
    };
  }
};

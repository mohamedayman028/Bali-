import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async (event, context) => {
  // Resolve DB path: prefer bundled relative path, fallback to process.cwd()
  const preferredDb = path.resolve(__dirname, '../server/bali.db');
  const fallbackDb = path.join(process.cwd(), 'server', 'bali.db');

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
      body: JSON.stringify({ error: 'Database file not found', tried: { preferredDb, fallbackDb }, listings })
    };
  }

  process.env.DB_PATH = process.env.DB_PATH || resolvedDb;
  // Request read-only DB open mode for Netlify functions
  process.env.DB_OPEN_MODE = 'READONLY';
  console.log('api/index.js: using DB at', process.env.DB_PATH);

  // Normalize the incoming path from Netlify (strip function mount prefix)
  if (event && event.path && event.path.startsWith('/.netlify/functions/')) {
    const parts = event.path.split('/').filter(Boolean);
    const fnIndex = parts.indexOf('.netlify');
    if (fnIndex !== -1) {
      const newPath = '/' + parts.slice(fnIndex + 2).join('/');
      event.path = newPath === '/' ? '/' : newPath;
    }
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
      body: JSON.stringify({ error: 'Server initialization failed', message: err?.message })
    };
  }
};

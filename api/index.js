import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import serverless from 'serverless-http';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the function runtime knows where the DB lives. Try a few candidate locations
// so the function works whether bundled under Netlify or run from the repo.
const candidateDbPaths = [
	path.resolve(__dirname, '../server/bali.db'),
	path.resolve(__dirname, '../../server/bali.db'),
	path.resolve(process.cwd(), 'server', 'bali.db'),
	path.resolve(process.cwd(), '..', 'server', 'bali.db')
];
const foundDb = candidateDbPaths.find(p => fs.existsSync(p));
process.env.DB_PATH = process.env.DB_PATH || foundDb || candidateDbPaths[0];
console.log('api/index.js: using DB at', process.env.DB_PATH);

// Handler: validate DB path, dynamically import server (so we can catch init errors),
// then delegate to serverless-http.
export const handler = async (event, context) => {
	// Preferred absolute DB path for Netlify runtime
	const preferredDb = path.join(process.cwd(), 'server', 'bali.db');
	process.env.DB_PATH = process.env.DB_PATH || preferredDb;

	if (!fs.existsSync(process.env.DB_PATH)) {
		console.error('Database file not found at', process.env.DB_PATH);
		return {
			statusCode: 502,
			body: JSON.stringify({ error: 'Database file not found', path: process.env.DB_PATH })
		};
	}

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

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

import appModule from '../server/server.js';
const app = appModule.default || appModule;

// Create the serverless handler and wrap it to normalize the path that Netlify sends.
const lambdaHandler = serverless(app);

export const handler = (event, context) => {
	// Netlify sometimes forwards the original path prefixed with the function mount
	// like '/.netlify/functions/index/api/menu'. Strip that prefix so Express routes
	// (which expect '/api/...') match correctly.
	if (event && event.path && event.path.startsWith('/.netlify/functions/')) {
		// Remove the '/.netlify/functions/<name>' part
		const parts = event.path.split('/').filter(Boolean);
		const fnIndex = parts.indexOf('.netlify');
		if (fnIndex !== -1) {
			// rebuild path from segments after the function mount
			const newPath = '/' + parts.slice(fnIndex + 2).join('/');
			event.path = newPath === '/' ? '/' : newPath;
		}
	}

	return lambdaHandler(event, context);
};

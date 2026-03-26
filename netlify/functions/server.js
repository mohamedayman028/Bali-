import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

// Resolve DB path relative to this function file so it works in Netlify runtime
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../../server/bali.db');

// Import the Express app (server exports default app)
import app from '../../../server/server.js';

export const handler = serverless(app);

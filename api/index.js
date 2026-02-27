import path from 'path';
import { fileURLToPath } from 'url';
import serverless from 'serverless-http';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the function runtime knows where the DB lives
process.env.DB_PATH = process.env.DB_PATH || path.resolve(__dirname, '../server/bali.db');

import appModule from '../server/server.js';
const app = appModule.default || appModule;

export const handler = serverless(app);

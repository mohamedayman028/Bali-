import sqlite3 from 'sqlite3';
import { join } from 'path';
import fs from 'fs';

function resolvePath(...segments) {
    return join(...segments);
}

// Allow an explicit `process.env.DB_PATH` (set by server startup logic),
// otherwise try a few candidate locations so the server works when run
// from the project root or from inside the `server/` folder.
const envDbPath = process.env.DB_PATH;
const candidateDbPaths = [
    resolvePath(process.cwd(), 'server', 'bali.db'),
    resolvePath(process.cwd(), 'bali.db'),
    resolvePath(process.cwd(), '..', 'server', 'bali.db')
];

const dbPath = (envDbPath && fs.existsSync(envDbPath))
    ? envDbPath
    : (candidateDbPaths.find(p => fs.existsSync(p)) || resolvePath(process.cwd(), 'server', 'bali.db'));

const candidateSchemaPaths = [
    resolvePath(process.cwd(), 'server', 'schema.sql'),
    resolvePath(process.cwd(), 'schema.sql'),
    resolvePath(process.cwd(), '..', 'server', 'schema.sql')
];
const schemaPath = candidateSchemaPaths.find(p => fs.existsSync(p)) || resolvePath(process.cwd(), 'server', 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error initializing database:', err.message);
        } else {
            console.log('Database schema initialized.');
            ensureSeedData();
        }
    });
}

function ensureSeedData() {
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (err) {
            console.error('Error checking seed data:', err.message);
            return;
        }

        if (row && row.count > 0) {
            console.log('Database already seeded.');
            return;
        }

        const candidateSeedPaths = [
            resolvePath(process.cwd(), 'server', 'seed.sql'),
            resolvePath(process.cwd(), 'seed.sql'),
            resolvePath(process.cwd(), '..', 'server', 'seed.sql')
        ];
        const seedPath = candidateSeedPaths.find(p => fs.existsSync(p)) || resolvePath(process.cwd(), 'server', 'seed.sql');
        if (!fs.existsSync(seedPath)) {
            console.warn('Seed file not found at', seedPath);
            return;
        }

        console.log('Seeding database from seed.sql...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        db.exec(seedSql, (seedErr) => {
            if (seedErr) {
                console.error('Error seeding database:', seedErr.message);
            } else {
                console.log('Database seeded successfully.');
            }
        });
    });
}

export const DB_PATH = dbPath;
export default db;

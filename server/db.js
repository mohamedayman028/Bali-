import { join, resolve } from 'path';
import fs from 'fs';

function resolvePath(...segments) {
    return join(...segments);
}

// Determine DB paths (allow process.env.DB_PATH override)
const envDbPath = process.env.DB_PATH;
const candidateDbPaths = [
    resolvePath(process.cwd(), 'server', 'bali.db'),
    resolvePath(process.cwd(), 'bali.db'),
    resolvePath(process.cwd(), '..', 'server', 'bali.db')
];

// Final fallback should be strict resolve as requested
const dbPath = (envDbPath && fs.existsSync(envDbPath))
    ? envDbPath
    : (candidateDbPaths.find(p => fs.existsSync(p)) || resolve(process.cwd(), 'server', 'bali.db'));

const candidateSchemaPaths = [
    resolvePath(process.cwd(), 'server', 'schema.sql'),
    resolvePath(process.cwd(), 'schema.sql'),
    resolvePath(process.cwd(), '..', 'server', 'schema.sql')
];
const schemaPath = candidateSchemaPaths.find(p => fs.existsSync(p)) || resolvePath(process.cwd(), 'server', 'schema.sql');

// Initialize sql.js (WASM-backed JS SQLite) and expose a sqlite3-compatible wrapper
let sqlDb = null;
let exportedDb = {
    all(_sql, _params, cb) { cb && cb(new Error('DB not initialized')); },
    get(_sql, _params, cb) { cb && cb(new Error('DB not initialized')); },
    exec(_sql, cb) { cb && cb(new Error('DB not initialized')); }
};

export const DB_PATH = dbPath;

export async function initDb() {
    if (sqlDb) return exportedDb; // already initialized

    try {
        const initSqlJsModule = await import('sql.js');
        const initSqlJs = initSqlJsModule.default || initSqlJsModule;

        const SQL = await initSqlJs({
            locateFile: (file) => {
                return resolve(process.cwd(), 'node_modules', 'sql.js', 'dist', file);
            }
        });

        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            sqlDb = new SQL.Database(new Uint8Array(fileBuffer));
            console.log('Loaded database from', dbPath);
        } else {
            sqlDb = new SQL.Database();
            console.log('Initialized in-memory database (no file found)');
        }

        function rowsFromExecResult(resultArray) {
            if (!resultArray || resultArray.length === 0) return [];
            const res = resultArray[0];
            const cols = res.columns || [];
            const vals = res.values || [];
            return vals.map(v => {
                const obj = {};
                for (let i = 0; i < cols.length; i++) obj[cols[i]] = v[i];
                return obj;
            });
        }

        function persistIfWritable() {
            if (process.env.DB_OPEN_MODE === 'READONLY') return;
            try {
                const data = sqlDb.export();
                fs.writeFileSync(dbPath, Buffer.from(data));
            } catch (e) {
                console.error('Failed to persist DB to disk:', e);
            }
        }

        exportedDb = {
            all(sql, params = [], cb) {
                try {
                    const res = sqlDb.exec(sql);
                    const rows = rowsFromExecResult(res);
                    cb && cb(null, rows);
                } catch (e) {
                    cb && cb(e);
                }
            },
            get(sql, params = [], cb) {
                try {
                    const res = sqlDb.exec(sql);
                    const rows = rowsFromExecResult(res);
                    cb && cb(null, rows[0] || undefined);
                } catch (e) {
                    cb && cb(e);
                }
            },
            exec(sql, cb) {
                try {
                    sqlDb.run(sql);
                    persistIfWritable();
                    cb && cb(null);
                } catch (e) {
                    cb && cb(e);
                }
            }
        };

        // Apply schema if present
        if (fs.existsSync(schemaPath)) {
            try {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                sqlDb.run(schema);
                persistIfWritable();
                console.log('Database schema applied.');
            } catch (e) {
                console.error('Error applying schema:', e.message || e);
            }
        }

        // Seed if empty
        try {
            const countRes = sqlDb.exec('SELECT COUNT(*) as count FROM products');
            const rows = rowsFromExecResult(countRes);
            const count = rows[0]?.count || 0;
            if (count === 0) {
                const candidateSeedPaths = [
                    resolvePath(process.cwd(), 'server', 'seed.sql'),
                    resolvePath(process.cwd(), 'seed.sql'),
                    resolvePath(process.cwd(), '..', 'server', 'seed.sql')
                ];
                const seedPath = candidateSeedPaths.find(p => fs.existsSync(p));
                if (seedPath) {
                    console.log('Seeding database from', seedPath);
                    const seedSql = fs.readFileSync(seedPath, 'utf8');
                    sqlDb.run(seedSql);
                    persistIfWritable();
                    console.log('Database seeded successfully.');
                } else {
                    console.warn('Seed file not found (no seeding)');
                }
            } else {
                console.log('Database already seeded.');
            }
        } catch (e) {
            console.error('Error checking/seed database:', e.message || e);
        }

        return exportedDb;
    } catch (err) {
        console.error('Failed to initialize sql.js-based DB wrapper:', err);
        exportedDb = {
            all(_sql, _params, cb) { cb && cb(new Error('DB not available')); },
            get(_sql, _params, cb) { cb && cb(new Error('DB not available')); },
            exec(_sql, cb) { cb && cb(new Error('DB not available')); }
        };
        return exportedDb;
    }
}

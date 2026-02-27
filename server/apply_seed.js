import sqlite3 from 'sqlite3';
import fs from 'fs';

const dbPath = 'bali.db';
const db = new sqlite3.Database(dbPath);

async function run() {
    try {
        console.log('Resetting database...');
        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("PRAGMA foreign_keys = OFF;");
                db.run("DROP TABLE IF EXISTS product_prices;");
                db.run("DROP TABLE IF EXISTS products;");
                db.run("DROP TABLE IF EXISTS categories;");
                db.run("DROP TABLE IF EXISTS tables;");
                db.run("PRAGMA foreign_keys = ON;", (err) => err ? reject(err) : resolve());
            });
        });

        console.log('Applying schema...');
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await new Promise((resolve, reject) => {
            db.exec(schema, (err) => err ? reject(err) : resolve());
        });

        console.log('Seeding...');
        let seedSql = fs.readFileSync('seed.sql', 'utf8');

        seedSql = seedSql.replace(/INSERT INTO sizes[^;]+;/g, '');
        seedSql = seedSql.replace(/INSERT INTO categories\s*\(category_name\)/g, 'INSERT INTO categories (name)');
        seedSql = seedSql.replace(/INSERT INTO products\s*\(\s*product_name/g, 'INSERT INTO products (name');
        seedSql = seedSql.replace(/INSERT INTO product_prices\s*\(\s*product_id,\s*size_id,\s*price\s*\)/g,
            'INSERT INTO product_prices (product_id, size, price)');

        // Corrected price mapping regex: only replace the second value
        seedSql = seedSql.replace(/\((\d+),\s*([123]),\s*(\d+)\)/g, (match, p1, p2, p3) => {
            const sizeMap = { '1': "'Small'", '2': "'Medium'", '3': "'Large'" };
            return `(${p1}, ${sizeMap[p2]}, ${p3})`;
        });

        const statements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0);

        await new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                let errorOccurred = false;
                for (let stmt of statements) {
                    db.run(stmt, (err) => {
                        if (err && !errorOccurred) {
                            console.error('Error on statement:', stmt.substring(0, 100) + '...');
                            console.error(err.message);
                            errorOccurred = true;
                        }
                    });
                }
                db.run("COMMIT", (err) => {
                    if (err || errorOccurred) {
                        db.run("ROLLBACK");
                        reject(err || new Error("SQL Execution Error"));
                    } else {
                        resolve();
                    }
                });
            });
        });

        console.log('Seeding completed successfully!');
    } catch (err) {
        console.error('Failed:', err.message);
    } finally {
        db.close();
    }
}

run();

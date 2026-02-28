import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { join } from 'path';
import path from 'path';
import serverless from 'serverless-http';
import { runImageUpdate } from './update_images.js';

dotenv.config();

// Ensure DB_PATH is set in the environment for Vercel and other hosts.
process.env.DB_PATH = process.env.DB_PATH || join(process.cwd(), 'server', 'bali.db');

// Import DB helpers (call initDb() before using in serverless runtime)
import { db, DB_PATH, initDb } from './db.js';

const app = express();
const PORT = 5001;

console.log('Using SQLite DB at:', DB_PATH);

// Local startup helper: initialize DB and run image scan, then listen
function startLocal() {
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
        (async () => {
            try {
                await initDb();
                runImageUpdate().then(() => {
                    console.log('Static image scan complete.');
                }).catch(err => {
                    console.error('Initial image scan failed:', err);
                });
                app.listen(PORT, () => {
                    console.log(`Server running on http://localhost:${PORT}`);
                });
            } catch (e) {
                console.error('Failed to initialize DB for local server:', e);
            }
        })();
    }
}

app.use(cors());
app.use(express.json());

// Get all categories
app.get('/api/categories', (appReq, appRes) => {
    db.all('SELECT * FROM categories', [], (err, rows) => {
        if (err) {
            appRes.status(500).json({ error: err.message });
            return;
        }
        appRes.json(rows);
    });
});

// Get all products with prices
app.get('/api/products', (appReq, appRes) => {
    const query = `
        SELECT p.*, pp.size, pp.price 
        FROM products p
        LEFT JOIN product_prices pp ON p.id = pp.product_id
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            appRes.status(500).json({ error: err.message });
            return;
        }

        // Group by product
        const productsMap = {};
        rows.forEach(row => {
            if (!productsMap[row.id]) {
                let parsedTags = [];
                try {
                    parsedTags = JSON.parse(row.tags || '[]');
                } catch (e) {
                    console.error('Error parsing tags for product', row.id, e);
                    parsedTags = [];
                }

                let parsedIngredients = [];
                try {
                    parsedIngredients = JSON.parse(row.ingredients || '[]');
                } catch (e) {
                    console.error('Error parsing ingredients for product', row.id, e);
                    parsedIngredients = [];
                }

                productsMap[row.id] = {
                    id: row.id,
                    name: row.name,
                    description: row.description, // Now primarily Arabic
                    descriptionAr: row.description_ar,
                    longDescription: row.long_description,
                    category: row.category_id,
                    image: row.image_url,
                    tags: parsedTags,
                    ingredients: parsedIngredients,
                    prices: []
                };
            }
            if (row.size) {
                productsMap[row.id].prices.push({
                    size: row.size,
                    price: row.price
                });
            }
        });

        // Convert to array and format to match frontend expectation
        const result = Object.values(productsMap).map(p => {
            const smallPrice = p.prices.find(pr => pr.size === 'Small')?.price;
            const mediumPrice = p.prices.find(pr => pr.size === 'Medium')?.price;
            const largePrice = p.prices.find(pr => pr.size === 'Large')?.price;
            return {
                ...p,
                priceSmall: smallPrice,
                priceMedium: mediumPrice,
                priceLarge: largePrice
            };
        });

        appRes.json(result);
    });
});

// Combined menu endpoint (categories, products, tables)
app.get('/api/menu', async (req, res) => {
    try {
        const getAll = (sql, params = []) =>
            new Promise((resolve, reject) => {
                db.all(sql, params, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });

        const [categories, products, tables] = await Promise.all([
            getAll('SELECT * FROM categories'),
            getAll(`
                SELECT p.*, pp.size, pp.price 
                FROM products p
                LEFT JOIN product_prices pp ON p.id = pp.product_id
            `),
            getAll('SELECT * FROM tables')
        ]);

        const productsMap = {};
        products.forEach(row => {
            if (!productsMap[row.id]) {
                let parsedTags = [];
                try {
                    parsedTags = JSON.parse(row.tags || '[]');
                } catch (e) {
                    parsedTags = [];
                }

                let parsedIngredients = [];
                try {
                    parsedIngredients = JSON.parse(row.ingredients || '[]');
                } catch (e) {
                    parsedIngredients = [];
                }

                productsMap[row.id] = {
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    descriptionAr: row.description_ar,
                    longDescription: row.long_description,
                    category: row.category_id,
                    image: row.image_url,
                    tags: parsedTags,
                    ingredients: parsedIngredients,
                    prices: []
                };
            }
            if (row.size) {
                productsMap[row.id].prices.push({
                    size: row.size,
                    price: row.price
                });
            }
        });

        const formattedProducts = Object.values(productsMap).map(p => {
            const smallPrice = p.prices.find(pr => pr.size === 'Small')?.price;
            const mediumPrice = p.prices.find(pr => pr.size === 'Medium')?.price;
            const largePrice = p.prices.find(pr => pr.size === 'Large')?.price;
            return {
                ...p,
                priceSmall: smallPrice,
                priceMedium: mediumPrice,
                priceLarge: largePrice
            };
        });

        res.json({
            categories,
            products: formattedProducts,
            tables
        });
    } catch (err) {
        console.error('Error in /api/menu:', err);
        res.status(500).json({ error: 'Failed to load menu data' });
    }
});

// Get all tables
app.get('/api/tables', (req, res) => {
    db.all('SELECT * FROM tables', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Start local server initialization when running in development
startLocal();

export default app;

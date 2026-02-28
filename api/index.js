const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const router = express.Router();

// أهم سطر: تحديد مكان قاعدة البيانات بدقة
const dbPath = path.resolve(__dirname, '../server/bali.db');

router.get('/menu', (req, res) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) return res.status(500).json({ error: "Database not found", path: dbPath });
    });

    db.all("SELECT * FROM menu", [], (err, rows) => {
        db.close();
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.use('/api', router);
module.exports.handler = serverless(app);
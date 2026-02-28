const express = require('express');
const serverless = require('serverless-http');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const router = express.Router();

router.get('/menu', (req, res) => {
    // تحديد مسار قاعدة البيانات بأكثر من طريقة للتأكد
    const dbPath = path.resolve(process.cwd(), 'server', 'bali.db');
    
    // اختبار: هل الملف موجود فعلاً؟
    if (!fs.existsSync(dbPath)) {
        return res.status(200).json({ 
            error: "Database file not found!",
            searchedPath: dbPath,
            filesInRoot: fs.readdirSync(process.cwd())
        });
    }

    const db = new sqlite3.Database(dbPath);
    db.all("SELECT * FROM menu", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Query Error", details: err.message });
        }
        res.json(rows);
    });
});

app.use('/api', router);
module.exports.handler = serverless(app);
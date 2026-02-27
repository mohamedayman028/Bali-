import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

const publicImagesDir = path.join(process.cwd(), '../public/images');

// Build a lowercase filename -> real filename map of all images in /public/images/
function buildImageMap() {
    try {
        return fs.readdirSync(publicImagesDir)
            .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
            .reduce((map, f) => {
                map[f.toLowerCase().replace(/\.(jpg|jpeg|png|webp)$/i, '')] = f;
                return map;
            }, {});
    } catch (e) {
        return {};
    }
}

// Find best-matching local file for a given product name
function findLocalImage(name, imageMap) {
    // Get the English part (before '|')
    const english = name.split('|')[0].trim().toLowerCase();

    // 1. Exact match
    if (imageMap[english]) return imageMap[english];

    // 2. Try the full name lowercased (without Arabic)
    const fullLower = name.trim().toLowerCase();
    if (imageMap[fullLower]) return imageMap[fullLower];

    // 3. Prefix match: only allow image key to be a shorter/equal prefix of the product name
    //    (handles "V60 Ice " → "V60 Ice.jpg") but NOT "Cheese cake" → "Cheese cake Blueberry.jpg"
    const englishWordCount = english.split(/\s+/).filter(w => w.length > 0).length;
    for (const [key, file] of Object.entries(imageMap)) {
        if (english === key) return file;
        const keyWordCount = key.split(/\s+/).filter(w => w.length > 0).length;
        // Image key must have equal or fewer words than the product (not more specific)
        if (keyWordCount > englishWordCount) continue;
        // Only allow: product-name starts with image-key (i.e. image is less specific)
        // e.g. "V60 Ice " starts with "v60 ice"
        if (english.startsWith(key + ' ') || english.trimEnd() === key.trimEnd()) return file;
    }

    // 4. Strict fuzzy: require that matched words cover >= 80% of BOTH the product AND the image key
    const englishWords = english.split(/\s+/).filter(w => w.length > 2);
    if (englishWords.length < 2) return null; // single-word names — skip fuzzy to avoid false matches

    let bestFile = null, bestScore = 0;
    for (const [key, file] of Object.entries(imageMap)) {
        const keyWords = key.split(/\s+/).filter(w => w.length > 2);
        if (keyWords.length === 0) continue;

        // Don't let a MORE specific image match a LESS specific product
        // e.g. "Cheese cake" should NOT match "Cheese cake Blueberry.jpg"
        if (keyWords.length > englishWords.length) continue;

        const matchedInProduct = englishWords.filter(w => keyWords.includes(w)).length;
        const matchedInKey = keyWords.filter(w => englishWords.includes(w)).length;
        // Both sides must be covered at least 80%
        const productCoverage = matchedInProduct / englishWords.length;
        const keyCoverage = matchedInKey / keyWords.length;
        if (productCoverage >= 0.8 && keyCoverage >= 0.8) {
            const score = matchedInProduct + matchedInKey;
            if (score > bestScore) {
                bestScore = score;
                bestFile = file;
            }
        }
    }
    return bestFile;
}

// Extensive collection of high-quality Unsplash IDs for variety
const photoPool = {
    espresso: ['1510591509098-f4fdc6d0ff04', '1495474472287-4d71bcdd2085', '1514432324607-a09d9b4aefdd', '1497935586351-b67a49e012bf', '1501339847302-ac426a4a7cbb'],
    macchiato: ['1485808191679-5f86510681a2', '1570968915860-54d5c301fa9f', '1553909489-ec12a488e36e', '1551033406-611ec5cd03e1'],
    mocha: ['1578314675249-a6910f80cc4e', '1611003228941-98852ba62227', '1541167760496-162955ed2a95', '1604423421831-7e8c38362c3e'],
    cappuccino: ['1534778101976-62847782c213', '1572442388796-11668a67e53d', '1557006021-b85faa2bc5e2', '1517540203-d64e9a03194a'],
    latte: ['1541167760496-162955ed2a95', '1536935338788-846bb9981813', '1495474472287-4d71bcdd2085', '1521404063630-9b48b5fd306a'],
    turkish: ['1599395006692-0b8045f9495e', '1580933128244-84ccc80ef539', '1615555034637-ef561191062b'],
    flatwhite: ['1538587888044-79f13ddd7e49', '1520626330416-620986bcbc9f'],
    tea: ['1544787210-2213d64ac9f4', '1594631252845-29fc458dd816', '1564890369478-c89ca6d9cde9', '1467000847171-3221e7863810'],
    shake: [
        '1572490122747-3968b75cc699', '1563729784474-d77dbb933a9e', '1541658016709-82535e94bc71',
        '1553787499-6f9133860278', '1571115177098-24ec42095185', '1579954111245-0d2578dbca9e',
        '1553177595-562306bc83bf'
    ],
    matcha: ['1582733315328-d8ac0393246c', '1542730103-6f4ed1f24d1e', '1515822345620-73c3ee2123cd', '1459789034005-ba29c57f6718'],
    boba: ['1525203135335-74d292fb8d5c', '1558857563-b371f308ceb9', '1605333396915-47ed6b68a00e', '1551024506-0bccd828d307'],
    specialty: ['1544725176-7ec40d9a283e', '1495474472287-4d71bcdd2085', '1498307833015-e7b400441eb8', '1516016393961-d7756f6ce8e2'],
    juice: [
        '1621506289937-a8e4df240d0b', '1613478223719-2ab80260f003', '1523677012304-5c7da45ad675',
        '1498429089284-41f8cf3fffaf', '1534353436294-0dbd4bdac121', '1622597467827-ce453f405763'
    ],
    smoothie: ['1533606709-32cf1c1fdef2', '1464195244030-43624835ce58', '1505252585441-ca4196886e90', '1590684784407-c81665a3c938'],
    dessert: [
        '1533134242443-d4fd215305ad', '1567620832903-903bde8a11bc', '1488477126122-248534675aa0',
        '1571877227200-a0d98ea607e9', '1551024506-0bccd828d307', '1586040140378-b5634ce4c73b',
        '1481391245133-d3a0c8cb4604', '1551806231466-12614b8a1c0d'
    ],
    bakery: ['1555507036-ab1f4038808d', '1499636136210-6f4ee915583e', '1558961363-fa5fdf41db0e', '1509440159596-02e12e710f2f', '1497515114629-dd9a44283da7'],
    energy: ['1578911373404-f280e80abc88', '1579503841098-bce67406a064', '1531633519842-8c9e67272765']
};

const manualExclusions = [
    'Kiwi Smoothie | سموزي كيوي'
];

const keywordPool = {
    'peach': ['1600107211110-09160bb60934'],
    'mango': ['1537599028-eb1f4038808d'],
    'apple': ['1567306226416-28f57806ad9a'],
    'pineapple': ['1587314168485-3236d6a2a10b'],
    'passion': ['1526424382072-7c80efdec738'],
    'lemon': ['1513220556-91361cc8605d'],
    'berry': ['1464195244030-43624835ce58'],
    'san sebastian': ['1604423421831'],
    'tiramisu': ['1571877227200'],
    'pistachio': ['1501659508381-193433930bfa'],
    'lotus': ['1542730103-6f4ed1f24d1e'],
    'blueberry': ['1488477126122-248534675aa0'],
    'caramel': ['1567620832903-903bde8a11bc']
};

const categoryCounters = {};
const usedUnsplashIds = new Set();
let _imageMap = null;

function getImageMap() {
    if (!_imageMap) _imageMap = buildImageMap();
    return _imageMap;
}

function getImageUrl(row) {
    const { name, image_url } = row;

    // 0. Check manual exclusions
    if (manualExclusions.includes(name)) {
        return '';
    }

    // 1. Invalidate cache each run to pick up new files
    _imageMap = buildImageMap();
    const imageMap = getImageMap();

    // 2. Try smart local match first (highest priority)
    const localFile = findLocalImage(name, imageMap);
    if (localFile) {
        return `/images/${encodeURIComponent(localFile)}`;
    }

    // 3. Keep existing local path
    if (image_url && image_url.startsWith('/images/')) {
        return image_url;
    }

    // 4. Fallback to Unsplash
    const n = name.toLowerCase();
    let cat = 'latte';
    let specificPool = null;

    // Check keywordPool for relevance
    for (const [key, pool] of Object.entries(keywordPool)) {
        if (n.includes(key)) {
            specificPool = pool;
            break;
        }
    }

    if (n.includes('espresso')) cat = 'espresso';
    else if (n.includes('macchiato')) cat = 'macchiato';
    else if (n.includes('mocha')) cat = 'mocha';
    else if (n.includes('cappuccino')) cat = 'cappuccino';
    else if (n.includes('turkish')) cat = 'turkish';
    else if (n.includes('flat white')) cat = 'flatwhite';
    else if (n.includes('latte')) cat = 'latte';
    else if (n.includes('tea')) cat = 'tea';
    else if (n.includes('shake')) cat = 'shake';
    else if (n.includes('matcha')) cat = 'matcha';
    else if (n.includes('boba')) cat = 'boba';
    else if (n.includes('v60') || n.includes('chemex') || n.includes('syphon') || n.includes('cold brew')) cat = 'specialty';
    else if (n.includes('juice')) cat = 'juice';
    else if (n.includes('smoothie')) cat = 'smoothie';
    else if (n.includes('cheese cake') || n.includes('molten') || n.includes('san sebastian') || n.includes('tiramisu')) cat = 'dessert';
    else if (n.includes('croissant') || n.includes('patisserie') || n.includes('cookies')) cat = 'bakery';
    else if (n.includes('red bull') || n.includes('v cola') || n.includes('c4')) cat = 'energy';

    const pool = specificPool || photoPool[cat] || photoPool.latte;
    if (!categoryCounters[cat]) categoryCounters[cat] = 0;

    let photoId = pool[categoryCounters[cat] % pool.length];

    for (let i = 0; i < pool.length; i++) {
        let candidate = pool[(categoryCounters[cat] + i) % pool.length];
        if (!usedUnsplashIds.has(candidate)) {
            photoId = candidate;
            break;
        }
    }

    usedUnsplashIds.add(photoId);
    categoryCounters[cat]++;

    const nameHash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=600&h=600&sig=${Math.abs(nameHash)}`;
}


export function runImageUpdate() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database('bali.db');

        db.all('SELECT id, name, image_url FROM products', (err, rows) => {
            if (err) {
                console.error(err);
                db.close();
                return reject(err);
            }

            // Clear uniqueness tracking for a fresh run
            usedUnsplashIds.clear();

            db.serialize(() => {
                db.run('BEGIN TRANSACTION');
                const stmt = db.prepare('UPDATE products SET image_url = ? WHERE id = ?');

                rows.forEach(row => {
                    const url = getImageUrl(row);
                    stmt.run(url, row.id);
                });

                stmt.finalize();
                db.run('COMMIT', (err) => {
                    if (err) {
                        console.error('Commit failed:', err);
                        db.close();
                        reject(err);
                    } else {
                        console.log(`Successfully updated ${rows.length} products. Local images prioritized.`);
                        updateSeedFile();
                        db.close();
                        resolve();
                    }
                });
            });
        });
    });
}

// Support running directly or as a module
const isMain = import.meta.url === `file:///${path.join(process.cwd(), 'update_images.js').replace(/\\/g, '/')}`;
if (isMain) {
    runImageUpdate();
}

function updateSeedFile() {
    let seedSql = fs.readFileSync('seed.sql', 'utf8');
    const lines = seedSql.split('\n');
    const updatedLines = [];
    const seedCounters = {};

    updatedLines.push(...lines.map(line => {
        if (line.trim().startsWith('(') && !line.includes('INSERT INTO')) {
            // Extract product name - values are (id, 'Name', ...)
            // We search for the pattern: (id, 'Name | ...',
            const match = line.match(/^\(\d+,\s*'([^']+)'/);
            if (match) {
                const name = match[1];

                let url;
                // 0. Check manual exclusions
                if (manualExclusions.includes(name)) {
                    url = '';
                } else {
                    // Check local using smart matching
                    const imageMap = buildImageMap();
                    const localFile = findLocalImage(name, imageMap);

                    if (localFile) {
                        url = `/images/${encodeURIComponent(localFile)}`;
                    } else {
                        // Fallback Unsplash
                        const n = name.toLowerCase();
                        let cat = 'latte';
                        let specificPool = null;

                        for (const [key, pool] of Object.entries(keywordPool)) {
                            if (n.includes(key)) {
                                specificPool = pool;
                                break;
                            }
                        }

                        if (n.includes('espresso')) cat = 'espresso';
                        else if (n.includes('macchiato')) cat = 'macchiato';
                        else if (n.includes('mocha')) cat = 'mocha';
                        else if (n.includes('cappuccino')) cat = 'cappuccino';
                        else if (n.includes('turkish')) cat = 'turkish';
                        else if (n.includes('flat white')) cat = 'flatwhite';
                        else if (n.includes('latte')) cat = 'latte';
                        else if (n.includes('tea')) cat = 'tea';
                        else if (n.includes('shake')) cat = 'shake';
                        else if (n.includes('matcha')) cat = 'matcha';
                        else if (n.includes('boba')) cat = 'boba';
                        else if (n.includes('v60') || n.includes('chemex') || n.includes('syphon') || n.includes('cold brew')) cat = 'specialty';
                        else if (n.includes('juice')) cat = 'juice';
                        else if (n.includes('smoothie')) cat = 'smoothie';
                        else if (n.includes('cheese cake') || n.includes('molten') || n.includes('san sebastian') || n.includes('tiramisu')) cat = 'dessert';
                        else if (n.includes('croissant') || n.includes('patisserie') || n.includes('cookies')) cat = 'bakery';
                        else if (n.includes('red bull') || n.includes('v cola') || n.includes('c4')) cat = 'energy';

                        const pool = specificPool || photoPool[cat] || photoPool.latte;
                        if (!seedCounters[cat]) seedCounters[cat] = 0;
                        let photoId = pool[seedCounters[cat] % pool.length];
                        seedCounters[cat]++;
                        const nameHash = name.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
                        url = `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&q=80&w=600&h=600&sig=${Math.abs(nameHash)}`;
                    }
                }

                // Robust replacement for the 7th field
                // Fields: id, name, desc, desc_ar, long_desc, cat_id, image_url, tags, ingredients
                // We want to replace the value just before the first '[]' or JSON-like string near the end
                const regex = /,\s*(\d+),\s*('[^']*'|NULL),\s*('\[[^']*\]'|'\[\]')/;
                // 1: cat_id, 2: current_img_url, 3: tags
                return line.replace(regex, `, $1, '${url}', $3`);
            }
        }
        return line;
    }));

    fs.writeFileSync('seed.sql', updatedLines.join('\n'));
    console.log('Successfully updated seed.sql with local and Unsplash images.');
}


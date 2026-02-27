import http from 'http';

http.get('http://localhost:5001/api/products', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const products = JSON.parse(data);
            console.log('Products found:', products.length);
            const firstWithPrice = products.find(p => p.priceSmall || p.priceLarge);
            console.log('Sample Product:', firstWithPrice || products[0]);
        } catch (e) {
            console.error('Failed to parse:', data);
        }
    });
}).on('error', (err) => {
    console.error('Connection error:', err.message);
});

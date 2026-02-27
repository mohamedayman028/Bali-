import React, { useState, useEffect } from 'react';
import StickyHeader from './components/StickyHeader';
import Hero from './components/Hero';
import MenuSection from './components/MenuSection';
import Footer from './components/Footer';
import Loader from './components/Loader';
import ProductModal from './components/ProductModal';
import TableCard from './components/TableCard';
// import { categories, products } from './data/menuData';


function App() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use a relative path so the same code works in dev (with proxy) and in production on Vercel
        const res = await fetch('/api/menu');

        if (!res.ok) throw new Error('Failed to fetch menu data');

        const data = await res.json();

        setCategories(data.categories || []);
        setProducts(data.products || []);
        setTables(data.tables || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load menu data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Handle Category Click & Smooth Scroll
  const handleCategoryClick = (id) => {
    setActiveCategory(id);

    if (id !== 'all') {
      const section = document.getElementById(id);
      if (section) {
        // Offset for sticky header
        const headerOffset = 180;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Build content based on selection. 
  // For 'all', we show all sections vertically.
  // For specific category, we show just that one (or filter, but scrolling to section is nicer for 'all').
  // Let's assume 'all' shows everything stacked, and clicking a category scrolls to it.
  // Actually, 'all' filter usually implies showing everything.

  const filteredSections = activeCategory === 'all'
    ? categories.filter(c => c.id !== 'all')
    : categories.filter(c => c.id === activeCategory);

  if (loading) return <Loader />;
  if (error) return <div className="error-container">{error}</div>;

  return (

    <div className="App">
      <Hero />

      {/* Sticky Header with Nav takes over after Hero */}
      <StickyHeader
        categories={categories}
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
      />

      <main style={{ minHeight: '60vh', paddingBottom: '40px' }}>
        {activeCategory === 'all' ? (
          // Render All Sections
          categories.filter(c => c.id !== 'all').map(cat => (
            <div id={cat.id} key={cat.id}>
              <MenuSection
                title={cat.name}
                products={products.filter(p => p.category === cat.id)}
                onProductClick={setSelectedProduct}
              />
            </div>
          ))
        ) : (
          // Render Single Filtered Section
          <div id={activeCategory}>
            <MenuSection
              title={categories.find(c => c.id === activeCategory)?.name}
              products={products.filter(p => p.category === activeCategory)}
              onProductClick={setSelectedProduct}
            />
          </div>
        )}

        {/* Tables Section */}
        <section id="tables" style={{ padding: '40px 0', borderTop: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <div className="container">
            <h2 style={{ marginBottom: '24px', borderBottom: '2px solid var(--color-accent)', paddingBottom: '8px', display: 'inline-block' }}>
              Table Reservation
            </h2>
            <div className="menu-grid">
              {tables.map((table) => (
                <TableCard key={table.id} table={table} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Product Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}

export default App;

import React from 'react';
import ProductCard from './ProductCard';

const MenuSection = ({ title, products, onProductClick }) => {
    if (products.length === 0) return null;

    return (
        <section style={{ padding: '40px 0' }} className="animate-fade-in">
            <div className="container">
                <h2 style={{ marginBottom: '24px', borderBottom: '2px solid var(--color-accent)', paddingBottom: '8px', display: 'inline-block' }}>
                    {title}
                </h2>
                <div className="menu-grid">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onClick={onProductClick} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MenuSection;

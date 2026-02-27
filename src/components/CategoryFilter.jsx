import React from 'react';

const CategoryFilter = ({ categories, activeCategory, setActiveCategory }) => {
    return (
        <div
            style={{
                position: 'sticky',
                top: '70px', // Below header
                zIndex: 90,
                backgroundColor: 'var(--color-bg-light)',
                padding: '10px 0',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                marginBottom: '20px'
            }}
        >
            <div className="container" style={{ display: 'flex', gap: '12px' }}>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            padding: '8px 20px',
                            borderRadius: 'var(--radius-full)',
                            border: activeCategory === cat.id ? 'none' : '1px solid var(--color-primary-light)',
                            backgroundColor: activeCategory === cat.id ? 'var(--color-primary)' : 'transparent',
                            color: activeCategory === cat.id ? '#FFF' : 'var(--color-text-secondary)',
                            fontSize: '0.95rem',
                            fontWeight: activeCategory === cat.id ? '600' : '400',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryFilter;

import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const StickyHeader = ({ categories, onCategoryClick, activeCategory }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Main Sticky Container */}
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1000,
                    backgroundColor: scrolled ? 'var(--color-bg-light)' : 'rgba(250, 250, 245, 0.95)', // Always slightly solid for readability or full solid on scroll
                    backdropFilter: 'blur(12px)',
                    boxShadow: scrolled ? 'var(--shadow-md)' : 'none',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    borderBottom: scrolled ? '1px solid rgba(0,0,0,0.05)' : 'none',
                    paddingTop: '10px'
                }}
            >
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Top Row: Logo & Theme Toggle */}
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        {/* Placeholder for left balance if needed, or just justify-between */}
                        <div style={{ width: '40px' }}></div>

                        <Logo color="var(--color-primary-dark)" size={100} />

                        <ThemeToggle color="var(--color-primary-dark)" />
                    </div>

                    {/* Category Navigation Bar - Sticky Part within Header */}
                    <nav
                        style={{
                            width: '100%',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            paddingBottom: '12px',
                            paddingTop: '4px',
                            display: 'flex',
                            justifyContent: categories.length > 3 ? 'flex-start' : 'center',
                            gap: '10px',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                        }}
                        className="hide-scrollbar"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryClick(cat.id)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: 'var(--radius-full)',
                                    border: 'none',
                                    backgroundColor: activeCategory === cat.id ? 'var(--color-primary-dark)' : 'transparent',
                                    color: activeCategory === cat.id ? '#FFF' : 'var(--color-text-secondary)',
                                    fontFamily: 'var(--font-heading)',
                                    fontSize: '0.95rem',
                                    fontWeight: activeCategory === cat.id ? '600' : '400',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    flexShrink: 0,
                                    boxShadow: activeCategory === cat.id ? 'var(--shadow-sm)' : 'none'
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </nav>

                </div>

                {/* Hide Scrollbar Style injection */}
                <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
            </header>
        </>
    );
};

export default StickyHeader;

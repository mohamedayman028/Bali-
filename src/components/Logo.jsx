import React from 'react';

const Logo = ({ className = "", size = 120, color }) => {
    const brown = color || "#4E342E";
    const glowColor = "#C5A059"; // Luxury Gold Glow

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '10px'
            }}
        >
            {/* Subtle LED Glow Behind Logo - Classy & Minimal */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${glowColor}22 0%, transparent 70%)`, // Very subtle gradient
                zIndex: 0,
                pointerEvents: 'none',
                filter: 'blur(10px)'
            }} />

            {/* Logo Content */}
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                <h1
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.8rem',
                        fontWeight: '700',
                        color: brown,
                        margin: 0,
                        letterSpacing: '2px', // Elegant spacing
                        textTransform: 'uppercase',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    Bali
                </h1>
                <span
                    style={{
                        display: 'block',
                        fontFamily: "'Lato', sans-serif",
                        fontSize: '0.75rem',
                        letterSpacing: '4px',
                        color: brown,
                        opacity: 0.8,
                        marginTop: '-4px',
                        textTransform: 'uppercase'
                    }}
                >
                    Cafe
                </span>
            </div>
        </div>
    );
};

export default Logo;

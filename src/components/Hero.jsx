import React from 'react';

const Hero = () => {
    return (
        <section
            style={{
                position: 'relative',
                height: '50vh', // Keep this height as per design
                minHeight: '350px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                width: '100%',
                backgroundColor: 'var(--color-bg-light)'
            }}
            className="animate-fade-in"
        >
            {/* Immersive Background Image */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1920")',
                    backgroundSize: 'cover',
                    // Moved image slightly down (30%) to create top spacing as requested
                    backgroundPosition: 'center 30%',
                    zIndex: 0
                }}
            />

            {/* Darker Overlay for Text Readability */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    zIndex: 1
                }}
            />

            {/* Welcome Text Container */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    textAlign: 'center',
                    padding: '0 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <h2
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        color: '#FDF5E6', // Soft Beige / Cream
                        fontWeight: '700',
                        textShadow: '0 4px 12px rgba(0,0,0,0.6)', // Shadow for depth
                        margin: 0,
                        letterSpacing: '1px',
                        // Animation properties
                        opacity: 0,
                        animation: 'fadeInText 1s ease-out forwards 0.3s'
                    }}
                >
                    Welcome To Bali
                </h2>
            </div>

            {/* In-component Styles for specific animation */}
            <style>{`
                @keyframes fadeInText {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </section>
    );
};

export default Hero;

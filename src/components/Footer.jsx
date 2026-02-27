import React from 'react';

const Footer = () => {
    return (
        <footer
            style={{
                backgroundColor: 'var(--color-primary-dark)',
                color: '#FFF',
                padding: '40px 0',
                textAlign: 'center',
                marginTop: '60px'
            }}
        >
            <div className="container">
                <p style={{ marginBottom: '10px', fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>Bali – Your Daily Escape</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>&copy; {new Date().getFullYear()} All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;

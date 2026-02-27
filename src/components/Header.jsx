import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';

const Header = () => {
    return (
        <header
            style={{
                position: 'absolute', // Absolute to overlap hero without fixed scroll behavior
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 1000,
                backgroundColor: 'transparent',
                transition: 'none',
                padding: '20px 0',
                color: '#FFF'
            }}
        >
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ transformOrigin: 'left' }}>
                    <Logo color="#FFF" />
                </div>
                <ThemeToggle color="#FFF" />
            </div>
        </header>
    );
};

export default Header;

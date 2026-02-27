import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeToggle = ({ color }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="Toggle Dark Mode"
            style={{
                padding: '10px',
                borderRadius: '50%',
                backgroundColor: color === '#FFF' ? 'rgba(255,255,255,0.1)' : 'var(--color-bg-paper)',
                color: color || 'var(--color-primary)',
                boxShadow: color === '#FFF' ? 'none' : 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s ease',
                backdropFilter: color === '#FFF' ? 'blur(5px)' : 'none'
            }}
        >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
        </button>
    );
};

export default ThemeToggle;

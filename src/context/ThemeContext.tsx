import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTheme } from '../types/theme';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('vantage_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'nordic') {
        return saved;
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
    // Default to the new high-focus Obsidian Dark theme
    return 'dark';
  });

  useEffect(() => {
    try {
      localStorage.setItem('vantage_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme', e);
    }

    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-light', 'theme-nordic', 'dark');

    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
    } else if (theme === 'light') {
      root.classList.add('theme-light');
    } else if (theme === 'nordic') {
      root.classList.add('theme-nordic');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'nordic' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

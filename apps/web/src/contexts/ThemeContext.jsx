'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

const ThemeContext = createContext(null);

const THEMES = [
  { value: 'default', label: '默认', class: '' },
  { value: 'sunrise', label: '晨曦', class: 'sunrise' },
  { value: 'iceblue', label: '冰蓝', class: 'iceblue' },
];

export function ThemeProvider({ children }) {
  const [themeStyle, setThemeStyle] = useState('github');
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 加载主题风格
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-style') || 'github';
    setThemeStyle(savedTheme);
    setMounted(true);
  }, []);

  // 应用主题风格到 HTML 元素
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const themeConfig = THEMES.find((t) => t.value === themeStyle);

    // 移除所有主题类
    THEMES.forEach((t) => {
      if (t.class) root.classList.remove(t.class);
    });

    // 应用新主题
    if (themeConfig?.class) {
      root.classList.add(themeConfig.class);
    }

    // 保存到 localStorage
    localStorage.setItem('theme-style', themeStyle);
  }, [themeStyle, mounted]);

  const value = {
    themeStyle,
    setThemeStyle,
    themes: THEMES,
    mounted,
  };

  return (
    <NextThemesProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    </NextThemesProvider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

'use client';

import Script from 'next/script';

/**
 * 在页面渲染前应用主题风格，防止闪现
 * 这个组件必须在 layout 中尽早加载
 */
export default function ThemeScript() {
  const themeScript = `
    (function() {
      try {
        const themeStyle = localStorage.getItem('theme-style') || 'github';
        const root = document.documentElement;

        // 移除所有可能的主题类
        root.classList.remove('github', 'modern');

        // 应用主题风格
        if (themeStyle && themeStyle !== 'default') {
          root.classList.add(themeStyle);
        }
      } catch (e) {}
    })();
  `;

  return (
    <Script
      id='theme-script'
      strategy='beforeInteractive'
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}

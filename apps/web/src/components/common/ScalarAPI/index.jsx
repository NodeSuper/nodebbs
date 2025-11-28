'use client';

import { useEffect } from 'react';

export default function ScalarAPI({ config }) {
  useEffect(() => {
    // 加载 CDN 脚本
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@scalar/api-reference';
    script.async = true;

    script.onload = () => {
      if (window.Scalar) {
        window.Scalar.createApiReference('#ScalarAPP', config);
      }
    };

    document.body.appendChild(script);

    return () => script.remove();
  }, []);

  return <div id='ScalarAPP' />;
}

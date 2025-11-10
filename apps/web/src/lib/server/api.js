// SSR请求专用
import { cookies } from 'next/headers';

export const request = async (endpoint, options = {}) => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7100';
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const cks = await cookies();
  const token = cks.get('auth_token')?.value;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      cache: 'no-store', // 确保获取最新数据
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching:', error);
    return null;
  }
};

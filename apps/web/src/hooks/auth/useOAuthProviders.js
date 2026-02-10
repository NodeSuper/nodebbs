'use client';

import { useState, useEffect } from 'react';
import { oauthConfigApi } from '@/lib/api';

export function useOAuthProviders({ enabled = true } = {}) {
  const [oauthProviders, setOauthProviders] = useState([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    const fetchOauthConfig = async () => {
      try {
        setLoadingConfig(true);
        const oauthData = await oauthConfigApi.getProviders();
        if (oauthData?.items) {
          setOauthProviders(oauthData.items);
        }
      } catch (error) {
        console.error('Failed to fetch oauth config:', error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchOauthConfig();
  }, [enabled]);

  return { oauthProviders, loadingConfig };
}

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '@/lib/api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 加载设置
  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.getAll();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  // 获取单个设置的值
  const getSetting = (key, defaultValue = null) => {
    return settings[key]?.value ?? defaultValue;
  };

  // 更新单个设置
  const updateSetting = async (key, value) => {
    try {
      await settingsApi.update(key, value);
      setSettings(prev => ({
        ...prev,
        [key]: { ...prev[key], value }
      }));
      return { success: true };
    } catch (err) {
      console.error('Failed to update setting:', err);
      return { success: false, error: err.message };
    }
  };

  const value = {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    refreshSettings: loadSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook 来使用设置上下文
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

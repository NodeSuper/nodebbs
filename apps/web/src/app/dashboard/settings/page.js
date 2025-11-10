'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { Settings, ToggleLeft, Gauge } from 'lucide-react';
import { Loading } from '@/components/common/Loading';

// 导入组件
import { GeneralSettings } from './components/GeneralSettings';
import { FeatureSettings } from './components/FeatureSettings';
import { OAuthSettings } from './components/OAuthProviderCard';
import { EmailSettings } from './components/EmailProviderCard';
import { RateLimitSettings } from './components/RateLimitSettings';

export default function SystemSettingsPage() {
  const { settings, loading, updateSetting } = useSettings();
  const [saving, setSaving] = useState(false);

  const handleSave = async (key, value) => {
    setSaving(true);
    try {
      const result = await updateSetting(key, value);
      if (result.success) {
        toast.success('配置已保存');
      } else {
        toast.error('保存配置失败');
      }
    } catch (error) {
      console.error('Failed to save setting:', error);
      toast.error('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleBooleanChange = (key, checked) => {
    if (settings[key] && settings[key].value !== checked) {
      handleSave(key, checked);
    }
  };

  const handleNumberChange = (key, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && settings[key] && settings[key].value !== numValue) {
      handleSave(key, numValue);
    }
  };

  const handleStringChange = (key, value) => {
    const trimmedValue = value.trim();
    if (settings[key] && settings[key].value !== trimmedValue) {
      handleSave(key, trimmedValue);
    }
  };

  if (loading) {
    return <Loading text='加载中...' className='min-h-[400px]' />;
  }

  return (
    <div className='space-y-6'>
      {/* Page header */}
      <div>
        <h2 className='text-2xl font-semibold mb-2'>系统配置</h2>
        <p className='text-sm text-muted-foreground'>
          管理论坛的全局设置和功能开关
        </p>
      </div>

      <Tabs defaultValue='general' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='general'>
            <Settings className='h-4 w-4' />
            通用设置
          </TabsTrigger>
          <TabsTrigger value='features'>
            <ToggleLeft className='h-4 w-4' />
            功能开关
          </TabsTrigger>
          <TabsTrigger value='oauth'>
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M12 2L2 7l10 5 10-5-10-5z'/>
              <path d='M2 17l10 5 10-5'/>
              <path d='M2 12l10 5 10-5'/>
            </svg>
            OAuth 登录
          </TabsTrigger>
          <TabsTrigger value='email'>
            <svg className='h-4 w-4' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <rect x='2' y='4' width='20' height='16' rx='2'/>
              <path d='m2 7 10 7 10-7'/>
            </svg>
            邮件服务
          </TabsTrigger>
          <TabsTrigger value='rate-limit'>
            <Gauge className='h-4 w-4' />
            访问限速
          </TabsTrigger>
        </TabsList>

        {/* 通用设置 Tab */}
        <TabsContent value='general'>
          <GeneralSettings
            settings={settings}
            handleStringChange={handleStringChange}
            handleNumberChange={handleNumberChange}
            saving={saving}
          />
        </TabsContent>

        {/* 功能开关 Tab */}
        <TabsContent value='features'>
          <FeatureSettings
            settings={settings}
            handleStringChange={handleStringChange}
            handleBooleanChange={handleBooleanChange}
            saving={saving}
          />
        </TabsContent>

        {/* OAuth 配置 Tab */}
        <TabsContent value='oauth'>
          <OAuthSettings />
        </TabsContent>

        {/* 邮件服务配置 Tab */}
        <TabsContent value='email'>
          <EmailSettings />
        </TabsContent>

        {/* 访问限速 Tab */}
        <TabsContent value='rate-limit'>
          <RateLimitSettings
            settings={settings}
            handleBooleanChange={handleBooleanChange}
            handleNumberChange={handleNumberChange}
            saving={saving}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

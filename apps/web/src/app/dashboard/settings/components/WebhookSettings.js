'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/contexts/SettingsContext';
import { webhookConfigApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AVAILABLE_EVENTS = [
  { value: 'topic.created', label: '话题创建', description: '用户创建新话题时触发' },
  { value: 'post.created', label: '回复创建', description: '用户发布回复时触发' },
  { value: 'post.liked', label: '帖子点赞', description: '用户点赞帖子时触发' },
  { value: 'user.checkin', label: '用户签到', description: '用户完成签到时触发' },
];

export function WebhookSettings() {
  const { settings, updateSetting } = useSettings();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(() => {
    const cfg = settings?.webhook_config?.value || {};
    return {
      enabled: cfg.enabled || false,
      url: cfg.url || '',
      secret: cfg.secret || '',
      events: Array.isArray(cfg.events) ? cfg.events : [],
      retryCount: cfg.retryCount ?? 3,
      timeout: cfg.timeout ?? 5000,
    };
  });

  const handleTest = async () => {
    if (!formData.url) {
      toast.error('请先填写 Webhook URL');
      return;
    }

    try {
      setTesting(true);
      await webhookConfigApi.testWebhook(formData.url, formData.secret);
      toast.success('Webhook 测试成功');
    } catch (error) {
      toast.error(error.message || 'Webhook 测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSetting('webhook_config', formData);
      toast.success('Webhook 配置已保存');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const toggleEvent = (eventValue) => {
    setFormData((prev) => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter((e) => e !== eventValue)
        : [...prev.events, eventValue],
    }));
  };

  return (
    <div className='space-y-6'>
      <Alert>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          Webhook 允许您在系统事件发生时，自动向外部服务发送 HTTP 请求。
          请确保您的 Webhook 端点能够处理 POST 请求并验证签名。
        </AlertDescription>
      </Alert>

      <div className='space-y-4 border rounded-lg p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <Label>启用 Webhook</Label>
            <p className='text-sm text-muted-foreground'>开启后将向配置的 URL 发送事件通知</p>
          </div>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='webhook-url'>Webhook URL *</Label>
          <Input
            id='webhook-url'
            type='url'
            placeholder='https://your-domain.com/webhook'
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            autoComplete='off'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='webhook-secret'>签名密钥（可选）</Label>
          <Input
            id='webhook-secret'
            type='password'
            placeholder='用于 HMAC-SHA256 签名验证'
            value={formData.secret}
            onChange={(e) => setFormData({ ...formData, secret: e.target.value })}
            autoComplete='new-password'
          />
          <p className='text-xs text-muted-foreground'>
            设置后，每个请求会在 X-Webhook-Signature 头中包含 HMAC-SHA256 签名
          </p>
        </div>

        <div className='space-y-3'>
          <Label>订阅事件</Label>
          <div className='space-y-2'>
            {AVAILABLE_EVENTS.map((event) => (
              <div key={event.value} className='flex items-start space-x-2'>
                <Checkbox
                  id={event.value}
                  checked={formData.events.includes(event.value)}
                  onCheckedChange={() => toggleEvent(event.value)}
                />
                <div className='grid gap-1 leading-none'>
                  <label
                    htmlFor={event.value}
                    className='text-sm font-medium cursor-pointer'
                  >
                    {event.label}
                  </label>
                  <p className='text-xs text-muted-foreground'>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='retry-count'>重试次数</Label>
            <Input
              id='retry-count'
              type='number'
              min='0'
              max='10'
              value={formData.retryCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, retryCount: isNaN(val) ? 3 : Math.min(Math.max(val, 0), 10) });
              }}
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='timeout'>超时时间（毫秒）</Label>
            <Input
              id='timeout'
              type='number'
              min='1000'
              max='30000'
              step='1000'
              value={formData.timeout}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setFormData({ ...formData, timeout: isNaN(val) ? 5000 : Math.min(Math.max(val, 1000), 30000) });
              }}
            />
          </div>
        </div>

        <div className='flex gap-2 pt-4'>
          <Button onClick={handleTest} disabled={testing || !formData.url} variant='outline'>
            {testing && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            测试连接
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}

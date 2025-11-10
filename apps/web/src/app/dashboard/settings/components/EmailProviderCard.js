'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { emailConfigApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, Check, X } from 'lucide-react';
import { Loading } from '@/components/common/Loading';

export function EmailSettings() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProvider, setEditingProvider] = useState(null);
  const [testingProvider, setTestingProvider] = useState(null);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const data = await emailConfigApi.getAllProviders();
      setProviders(data.items || []);
    } catch (error) {
      console.error('Failed to fetch Email providers:', error);
      toast.error('获取邮件服务配置失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text='加载中...' className='min-h-[200px]' />;
  }

  return (
    <div className='space-y-4'>
      <div className='text-sm text-muted-foreground mb-4'>
        配置邮件发送服务，用于发送邮件验证、登录验证码、注册欢迎邮件以及各种订阅推送。
      </div>

      {providers.map((provider) => (
        <EmailProviderCard
          key={provider.id}
          provider={provider}
          onUpdate={fetchProviders}
          editingProvider={editingProvider}
          setEditingProvider={setEditingProvider}
          testingProvider={testingProvider}
          setTestingProvider={setTestingProvider}
        />
      ))}
    </div>
  );
}

function EmailProviderCard({ 
  provider, 
  onUpdate, 
  editingProvider, 
  setEditingProvider, 
  testingProvider, 
  setTestingProvider 
}) {
  const [formData, setFormData] = useState({
    isEnabled: provider.isEnabled,
    isDefault: provider.isDefault,
    smtpHost: provider.smtpHost || '',
    smtpPort: provider.smtpPort || 587,
    smtpSecure: provider.smtpSecure !== null ? provider.smtpSecure : true,
    smtpUser: provider.smtpUser || '',
    smtpPassword: provider.smtpPassword || '',
    fromEmail: provider.fromEmail || '',
    fromName: provider.fromName || '',
    apiKey: provider.apiKey || '',
    apiEndpoint: provider.apiEndpoint || '',
  });
  const [saving, setSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const isEditing = editingProvider === provider.provider;
  const isSmtpBased = provider.provider === 'smtp' || provider.provider === 'aliyun';
  const isApiBased = provider.provider === 'sendgrid' || provider.provider === 'resend';

  const handleSave = async () => {
    try {
      setSaving(true);
      await emailConfigApi.updateProvider(provider.provider, formData);
      toast.success(`${provider.displayName} 配置已保存`);
      setEditingProvider(null);
      onUpdate();
    } catch (error) {
      console.error('Failed to update Email provider:', error);
      toast.error('保存配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('请输入测试邮箱地址');
      return;
    }
    try {
      setTestingProvider(provider.provider);
      const result = await emailConfigApi.testProvider(provider.provider, testEmail);
      if (result.success) {
        toast.success(result.message || '测试邮件已发送');
      } else {
        toast.error(result.message || '测试失败');
      }
    } catch (error) {
      console.error('Failed to test Email provider:', error);
      toast.error('测试配置失败');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleToggleEnabled = async (checked) => {
    try {
      await emailConfigApi.updateProvider(provider.provider, { isEnabled: checked });
      toast.success(checked ? `${provider.displayName} 已启用` : `${provider.displayName} 已禁用`);
      onUpdate();
    } catch (error) {
      console.error('Failed to toggle Email provider:', error);
      toast.error('操作失败');
    }
  };

  return (
    <div className='border border-border rounded-lg bg-card'>
      <div className='p-4'>
        {/* 头部：提供商名称和开关 */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='text-lg font-semibold'>{provider.displayName}</div>
            {provider.isEnabled && (
              <span className='text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded'>
                已启用
              </span>
            )}
            {provider.isDefault && (
              <span className='text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded'>
                默认
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Switch
              checked={provider.isEnabled}
              onCheckedChange={handleToggleEnabled}
            />
            {!isEditing ? (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  setEditingProvider(provider.provider);
                  setFormData({
                    isEnabled: provider.isEnabled,
                    isDefault: provider.isDefault,
                    smtpHost: provider.smtpHost || '',
                    smtpPort: provider.smtpPort || 587,
                    smtpSecure: provider.smtpSecure !== null ? provider.smtpSecure : true,
                    smtpUser: provider.smtpUser || '',
                    smtpPassword: provider.smtpPassword || '',
                    fromEmail: provider.fromEmail || '',
                    fromName: provider.fromName || '',
                    apiKey: provider.apiKey || '',
                    apiEndpoint: provider.apiEndpoint || '',
                  });
                }}
              >
                配置
              </Button>
            ) : (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setEditingProvider(null)}
              >
                <X className='h-4 w-4' />
              </Button>
            )}
          </div>
        </div>

        {/* 配置表单 */}
        {isEditing && (
          <div className='space-y-4 pt-4 border-t border-border'>
            {/* 设为默认 */}
            <div className='flex items-center justify-between'>
              <Label htmlFor={`${provider.provider}-isDefault`}>设为默认邮件服务</Label>
              <Switch
                id={`${provider.provider}-isDefault`}
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked })}
              />
            </div>

            {/* 发件人信息 */}
            <div className='space-y-2'>
              <Label htmlFor={`${provider.provider}-fromEmail`}>发件人邮箱 *</Label>
              <Input
                id={`${provider.provider}-fromEmail`}
                type='email'
                value={formData.fromEmail}
                onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                placeholder='noreply@example.com'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor={`${provider.provider}-fromName`}>发件人名称</Label>
              <Input
                id={`${provider.provider}-fromName`}
                value={formData.fromName}
                onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                placeholder='我的论坛'
              />
            </div>

            {/* SMTP 配置 */}
            {isSmtpBased && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor={`${provider.provider}-smtpHost`}>SMTP 主机 *</Label>
                  <Input
                    id={`${provider.provider}-smtpHost`}
                    value={formData.smtpHost}
                    onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
                    placeholder='smtp.example.com'
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor={`${provider.provider}-smtpPort`}>SMTP 端口 *</Label>
                    <Input
                      id={`${provider.provider}-smtpPort`}
                      type='number'
                      value={formData.smtpPort}
                      onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) })}
                      placeholder='587'
                    />
                  </div>

                  <div className='flex items-center justify-between pt-8'>
                    <Label htmlFor={`${provider.provider}-smtpSecure`}>使用 SSL/TLS</Label>
                    <Switch
                      id={`${provider.provider}-smtpSecure`}
                      checked={formData.smtpSecure}
                      onCheckedChange={(checked) => setFormData({ ...formData, smtpSecure: checked })}
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`${provider.provider}-smtpUser`}>SMTP 用户名 *</Label>
                  <Input
                    id={`${provider.provider}-smtpUser`}
                    value={formData.smtpUser}
                    onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
                    placeholder='用户名或邮箱'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`${provider.provider}-smtpPassword`}>SMTP 密码 *</Label>
                  <Input
                    id={`${provider.provider}-smtpPassword`}
                    type='password'
                    value={formData.smtpPassword}
                    onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                    placeholder='密码或授权码'
                  />
                </div>
              </>
            )}

            {/* API 配置 */}
            {isApiBased && (
              <>
                <div className='space-y-2'>
                  <Label htmlFor={`${provider.provider}-apiKey`}>API Key *</Label>
                  <Input
                    id={`${provider.provider}-apiKey`}
                    type='password'
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder='输入 API Key'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor={`${provider.provider}-apiEndpoint`}>API 端点</Label>
                  <Input
                    id={`${provider.provider}-apiEndpoint`}
                    value={formData.apiEndpoint}
                    onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                    placeholder='API 端点 URL'
                    disabled
                  />
                  <p className='text-xs text-muted-foreground'>
                    默认端点，通常无需修改
                  </p>
                </div>
              </>
            )}

            {/* 测试邮件 */}
            <div className='space-y-2 pt-2 border-t border-border'>
              <Label htmlFor={`${provider.provider}-testEmail`}>测试邮箱</Label>
              <Input
                id={`${provider.provider}-testEmail`}
                type='email'
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder='输入邮箱地址以接收测试邮件'
              />
            </div>

            <div className='flex items-center gap-2 pt-2'>
              <Button
                onClick={handleSave}
                disabled={saving || !formData.fromEmail}
              >
                {saving ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    保存中...
                  </>
                ) : (
                  <>
                    <Check className='h-4 w-4' />
                    保存配置
                  </>
                )}
              </Button>
              <Button
                variant='outline'
                onClick={handleTest}
                disabled={testingProvider === provider.provider || !provider.fromEmail || !testEmail}
              >
                {testingProvider === provider.provider ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    发送中...
                  </>
                ) : (
                  '发送测试邮件'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 当前配置概览（非编辑状态） */}
        {!isEditing && provider.fromEmail && (
          <div className='text-sm text-muted-foreground space-y-1 pt-4 border-t border-border'>
            <div>发件人: {provider.fromName} &lt;{provider.fromEmail}&gt;</div>
            {isSmtpBased && provider.smtpHost && (
              <div className='text-xs'>SMTP: {provider.smtpHost}:{provider.smtpPort}</div>
            )}
            {isApiBased && provider.apiKey && (
              <div className='text-xs'>API Key: {provider.apiKey.substring(0, 20)}...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

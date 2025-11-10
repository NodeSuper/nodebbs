'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function RateLimitSettings({ settings, handleBooleanChange, handleNumberChange, saving }) {
  return (
    <div className='space-y-4'>
      {/* 启用限速 */}
      {settings.rate_limit_enabled && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='rate_limit_enabled' className='text-sm font-semibold'>
                  启用访问限速
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.rate_limit_enabled.description}
                </p>
              </div>
              <Switch
                id='rate_limit_enabled'
                checked={settings.rate_limit_enabled.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('rate_limit_enabled', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 时间窗口 */}
      {settings.rate_limit_window_ms && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4 space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='rate_limit_window_ms' className='text-sm font-semibold'>
                限速时间窗口（毫秒）
              </Label>
              <p className='text-sm text-muted-foreground'>
                {settings.rate_limit_window_ms.description}
              </p>
            </div>
            <Input
              id='rate_limit_window_ms'
              type='number'
              defaultValue={settings.rate_limit_window_ms.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_window_ms', e.target.value)
              }
              disabled={saving}
              className='max-w-xs'
            />
            <p className='text-xs text-muted-foreground'>
              当前值: {Math.round(settings.rate_limit_window_ms.value / 1000)} 秒
            </p>
          </div>
        </div>
      )}

      {/* 最大请求数 */}
      {settings.rate_limit_max_requests && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4 space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='rate_limit_max_requests' className='text-sm font-semibold'>
                时间窗口内最大请求数
              </Label>
              <p className='text-sm text-muted-foreground'>
                {settings.rate_limit_max_requests.description}
              </p>
            </div>
            <Input
              id='rate_limit_max_requests'
              type='number'
              defaultValue={settings.rate_limit_max_requests.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_max_requests', e.target.value)
              }
              disabled={saving}
              className='max-w-xs'
            />
          </div>
        </div>
      )}

      {/* 已登录用户倍数 */}
      {settings.rate_limit_auth_multiplier && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4 space-y-3'>
            <div className='space-y-1'>
              <Label htmlFor='rate_limit_auth_multiplier' className='text-sm font-semibold'>
                已登录用户限速倍数
              </Label>
              <p className='text-sm text-muted-foreground'>
                {settings.rate_limit_auth_multiplier.description}
              </p>
            </div>
            <Input
              id='rate_limit_auth_multiplier'
              type='number'
              step='0.1'
              defaultValue={settings.rate_limit_auth_multiplier.value}
              onBlur={(e) =>
                handleNumberChange('rate_limit_auth_multiplier', e.target.value)
              }
              disabled={saving}
              className='max-w-xs'
            />
            <p className='text-xs text-muted-foreground'>
              已登录用户限制:{' '}
              {settings.rate_limit_max_requests?.value &&
                Math.floor(
                  settings.rate_limit_max_requests.value *
                    settings.rate_limit_auth_multiplier.value
                )}{' '}
              请求
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

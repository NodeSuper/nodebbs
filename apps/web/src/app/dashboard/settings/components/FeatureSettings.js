'use client';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FeatureSettings({ settings, handleStringChange, handleBooleanChange, saving }) {
  return (
    <div className='space-y-4'>
      {/* 注册模式 */}
      {settings.registration_mode && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='p-4 flex items-center justify-between'>
            <div className='space-y-1'>
              <Label htmlFor='registration_mode' className='text-sm font-semibold'>
                注册模式
              </Label>
              <p className='text-sm text-muted-foreground'>
                {settings.registration_mode.description}
              </p>
            </div>
            <Select
              value={settings.registration_mode.value}
              onValueChange={(value) => handleStringChange('registration_mode', value)}
              disabled={saving}
            >
              <SelectTrigger className='max-w-xs'>
                <SelectValue>
                  {settings.registration_mode.value === 'open' && '开放注册'}
                  {settings.registration_mode.value === 'invitation' && '邀请注册'}
                  {settings.registration_mode.value === 'closed' && '关闭注册'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='open'>
                  <div className='flex items-center gap-2'>
                    <span>🌐</span>
                    <div>
                      <div className='font-medium'>开放注册</div>
                      <div className='text-xs text-muted-foreground'>
                        任何人都可以注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value='invitation'>
                  <div className='flex items-center gap-2'>
                    <span>🎫</span>
                    <div>
                      <div className='font-medium'>邀请码注册</div>
                      <div className='text-xs text-muted-foreground'>
                        需要邀请码才能注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value='closed'>
                  <div className='flex items-center gap-2'>
                    <span>🔒</span>
                    <div>
                      <div className='font-medium'>关闭注册</div>
                      <div className='text-xs text-muted-foreground'>
                        暂停所有新用户注册
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* 邮箱验证开关 */}
      {settings.email_verification_required && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='email_verification_required' className='text-sm font-semibold'>
                  邮箱验证要求
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.email_verification_required.description}
                </p>
              </div>
              <Switch
                id='email_verification_required'
                checked={settings.email_verification_required.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('email_verification_required', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}

      {/* 内容审核开关 */}
      {settings.content_moderation_enabled && (
        <div className='border border-border rounded-lg bg-card'>
          <div className='px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='space-y-1'>
                <Label htmlFor='content_moderation_enabled' className='text-sm font-semibold'>
                  内容审核
                </Label>
                <p className='text-sm text-muted-foreground'>
                  {settings.content_moderation_enabled.description}
                </p>
              </div>
              <Switch
                id='content_moderation_enabled'
                checked={settings.content_moderation_enabled.value}
                onCheckedChange={(checked) =>
                  handleBooleanChange('content_moderation_enabled', checked)
                }
                disabled={saving}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

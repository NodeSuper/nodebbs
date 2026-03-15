'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IconUpload } from '@/components/common/IconUpload';
import { Switch } from '@/components/ui/switch';
import { SettingSection, SettingItem } from '@/components/common/SettingLayout';

export function GeneralSettings({
  settings,
  handleChange,
  handleInputBlur,
  saving,
}) {
  return (
    <div className='space-y-6'>
      <SettingSection title="基础设置" description="配置站点的基础信息与元数据">
        {settings.site_name && (
          <SettingItem
            title="站点名称"
            description={settings.site_name.description}
            layout="vertical"
          >
            <div className="flex flex-col gap-3 w-full">
              <Input
                id='site_name'
                defaultValue={settings.site_name.value}
                onBlur={(e) => handleInputBlur('site_name', e)}
                disabled={saving}
                className='w-full max-w-xl'
              />
              {settings.show_logo_text && (
                <div className='flex items-center space-x-2'>
                  <Label
                    htmlFor='show_logo_text'
                    className='text-xs font-normal cursor-pointer text-muted-foreground'
                  >
                    {settings.show_logo_text.description}
                  </Label>
                  <Switch
                    id='show_logo_text'
                    checked={settings.show_logo_text.value === true}
                    onCheckedChange={(checked) =>
                      handleChange('show_logo_text', checked)
                    }
                    disabled={saving}
                    className="scale-90"
                  />
                </div>
              )}
            </div>
          </SettingItem>
        )}

        {settings.site_description && (
          <SettingItem
            title="站点描述"
            description={settings.site_description.description}
            layout="vertical"
          >
            <Textarea
              id='site_description'
              defaultValue={settings.site_description.value}
              onBlur={(e) => handleInputBlur('site_description', e)}
              disabled={saving}
              className='w-full max-w-xl min-h-20 resize-y'
            />
          </SettingItem>
        )}

        {settings.site_url && (
          <SettingItem
            title="站点 URL"
            description={settings.site_url.description}
            layout="vertical"
          >
            <Input
              id='site_url'
              defaultValue={settings.site_url.value}
              onBlur={(e) => handleInputBlur('site_url', e)}
              disabled={saving}
              className='w-full max-w-xl'
              placeholder='https://example.com'
            />
          </SettingItem>
        )}

        {settings.site_keywords && (
          <SettingItem
            title="SEO 关键词"
            description={settings.site_keywords.description}
            layout="vertical"
          >
            <Textarea
              id='site_keywords'
              defaultValue={settings.site_keywords.value}
              onBlur={(e) => handleInputBlur('site_keywords', e)}
              disabled={saving}
              className='w-full max-w-xl min-h-20 resize-y'
              placeholder='论坛,社区,讨论'
            />
          </SettingItem>
        )}
      </SettingSection>

      <SettingSection title="站点图标" description="自定义站点 Logo、Favicon 和 Apple Touch Icon，留空则使用默认图标">
        <div className='p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Logo</Label>
            <IconUpload
              value={settings.site_logo?.value || ''}
              onChange={(url) => handleChange('site_logo', url)}
              placeholder='/logo.svg'
              accept='image/svg+xml,image/png,image/jpeg,image/webp'
              hint='SVG/PNG, 建议 128x128'
            />
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Favicon</Label>
            <IconUpload
              value={settings.site_favicon?.value || ''}
              onChange={(url) => handleChange('site_favicon', url)}
              placeholder='/favicon.ico'
              accept='image/x-icon,image/png,image/vnd.microsoft.icon'
              hint='ICO/PNG, 建议 48x48+'
            />
          </div>

          <div className='space-y-3'>
            <Label className='text-sm font-medium'>Apple Touch Icon</Label>
            <IconUpload
              value={settings.site_apple_touch_icon?.value || ''}
              onChange={(url) => handleChange('site_apple_touch_icon', url)}
              placeholder='/apple-touch-icon.png'
              accept='image/png'
              hint='PNG, 建议 180x180'
            />
          </div>
        </div>
      </SettingSection>

      <SettingSection title="高级代码注入" description="在页面头部和底部注入自定义代码和统计脚本">
        {settings.site_analytics_scripts && (
          <SettingItem
            title="站点统计脚本"
            description={settings.site_analytics_scripts.description || '支持 Google Analytics、百度统计等脚本，包含 <script> 标签的纯代码请自行包裹'}
            layout="vertical"
          >
            <Textarea
              id='site_analytics_scripts'
              defaultValue={settings.site_analytics_scripts.value}
              onBlur={(e) => handleInputBlur('site_analytics_scripts', e)}
              disabled={saving}
              className='w-full min-h-35 font-mono text-xs resize-y'
              placeholder='<script>...</script>'
            />
          </SettingItem>
        )}

        {settings.site_footer_html && (
          <SettingItem
            title="页脚自定义 HTML"
            description={settings.site_footer_html.description || '支持 HTML 标签，将显示在页脚区域'}
            layout="vertical"
          >
            <Textarea
              id='site_footer_html'
              defaultValue={settings.site_footer_html.value}
              onBlur={(e) => handleInputBlur('site_footer_html', e)}
              disabled={saving}
              className='w-full min-h-35 font-mono text-xs resize-y'
              placeholder='<span>...</span>'
            />
          </SettingItem>
        )}
      </SettingSection>
    </div>
  );
}

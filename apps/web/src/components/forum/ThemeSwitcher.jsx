'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Check } from 'lucide-react';
import { useTheme as useCustomTheme } from '@/contexts/ThemeContext';
import { useTheme } from 'next-themes';

export default function ThemeSwitcher() {
  const { themeStyle, setThemeStyle, themes, fontSize, setFontSize, fontSizes, mounted: customMounted } = useCustomTheme();
  const { theme, setTheme, systemTheme } = useTheme();

  // 防止服务端渲染不匹配
  if (!customMounted) {
    return (
      <Button variant='ghost' size='icon' className='h-9 w-9'>
        <Palette className='h-4 w-4' />
      </Button>
    );
  }

  const modes = [
    { value: 'light', label: '浅色' },
    { value: 'dark', label: '深色' },
    { value: 'system', label: '跟随系统' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='h-9 w-9' title='切换主题'>
          <Palette className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          主题风格
        </DropdownMenuLabel>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => setThemeStyle(t.value)}
            className='cursor-pointer'
          >
            <span className='flex-1'>{t.label}</span>
            {themeStyle === t.value && <Check className='h-4 w-4 text-primary' />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          颜色模式
        </DropdownMenuLabel>
        {modes.map((m) => (
          <DropdownMenuItem
            key={m.value}
            onClick={() => setTheme(m.value)}
            className='cursor-pointer'
          >
            <span className='flex-1'>{m.label}</span>
            {theme === m.value && <Check className='h-4 w-4 text-primary' />}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
          字号
        </DropdownMenuLabel>
        <div className='px-2 pb-2'>
          <Tabs value={fontSize} onValueChange={setFontSize}>
            <TabsList className='w-full'>
              {fontSizes.map((f) => (
                <TabsTrigger key={f.value} value={f.value} className='flex-1'>
                  {f.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

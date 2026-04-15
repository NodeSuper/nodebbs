'use client';

import Link from '@/components/common/Link';
import { useSettings } from '@/contexts/SettingsContext';

export default function Footer({ version }) {
  const { settings } = useSettings();

  return (
    <footer className='border-t border-border bg-background mt-auto'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <span>{settings?.site_name?.value || 'NodeBBS'}</span>
            <span>·</span>
            {settings?.site_footer_html?.value ? (
              <div
                className='[&_a]:hover:text-foreground [&_a]:transition-colors'
                dangerouslySetInnerHTML={{ __html: settings.site_footer_html.value }}
              />
            ) : (
              <>
                <Link href='/about' className='hover:text-foreground transition-colors'>关于</Link>
                <span>·</span>
                <Link href='/reference' className='hover:text-foreground transition-colors'>API</Link>
              </>
            )}
          </div>
          {version && (
            <a
              href='https://github.com/aiprojecthub/nodebbs'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-foreground transition-colors'
            >
              Built with NodeBBS v{version}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

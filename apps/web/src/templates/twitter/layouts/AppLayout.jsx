import { getTemplate } from '@/templates';
import { GLOBALS } from '@/templates/constants';
import DesktopNavAside from '../components/DesktopNavAside';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import '../styles.css';

export default function AppLayout({ children }) {
  const Header = getTemplate(GLOBALS.Header);

  return (
    <div className='min-h-screen bg-background' style={{ '--header-offset': '16px' }}>
      <Header />
      <EmailVerificationBanner />
      <div className='container mx-auto flex min-h-screen'>
        {/* 桌面端：左侧导航栏（profile/dashboard 自动收窄） */}
        <DesktopNavAside />

        {/* 内容区 */}
        <main className='flex-1 min-w-0 flex flex-col'>
          {children}
        </main>
      </div>
    </div>
  );
}

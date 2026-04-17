import { getTemplate } from '@/templates';
import { GLOBALS } from '@/templates/constants';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import '../styles.css';

export default function AppLayout({ children }) {
  const Header = getTemplate(GLOBALS.Header);
  const Footer = getTemplate(GLOBALS.Footer);

  return (
    <div className='jatra-template min-h-screen text-foreground flex flex-col font-sans' style={{ '--header-offset': '89px' }}>
      <Header />
      <EmailVerificationBanner />
      
      {/* 主内容区域 */}
      <div className='flex-grow flex flex-col bg-background'>
        {children}
      </div>

      <Footer />
    </div>
  );
}

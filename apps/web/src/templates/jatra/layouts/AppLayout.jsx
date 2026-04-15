import { getTemplate } from '@/templates';
import { GLOBALS } from '@/templates/constants';
import EmailVerificationBanner from '@/components/auth/EmailVerificationBanner';
import '../styles.css';

export default function AppLayout({ children, apiInfo }) {
  const Header = getTemplate(GLOBALS.Header);
  const Footer = getTemplate(GLOBALS.Footer);

  return (
    <div className='min-h-screen bg-muted/40 flex flex-col' style={{ '--header-offset': '77px' }}>
      <Header />
      <EmailVerificationBanner />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer version={apiInfo?.version} />
    </div>
  );
}

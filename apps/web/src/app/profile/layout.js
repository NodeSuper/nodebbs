import ProfileSidebar from '@/components/profile/ProfileSidebar';
import RequireAuth from '@/components/auth/RequireAuth';
import StickySidebar from '@/components/forum/StickySidebar';

export const metadata = {
  title: '个人中心 - 技术论坛',
  description: '管理你的话题和个人设置',
};

export default function ProfileLayout({ children }) {
  return (
    <RequireAuth>
      <div className='container mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* 左侧栏 */}
          <div className='w-full lg:w-64 shrink-0'>
            <StickySidebar className='sticky top-[81px]'>
              <ProfileSidebar />
            </StickySidebar>
          </div>

          {/* 主内容区 */}
          <main className='flex-1 min-w-0'>{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}

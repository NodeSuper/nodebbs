import { TopicProvider } from '@/contexts/TopicContext';
import TopicContent from '@/app/(main)/topic/[id]/components/TopicContent';
import ReplySection from '@/app/(main)/topic/[id]/components/ReplySection';
import TopicActionMenu from '../components/TopicActionMenu';
import { getTemplate } from '@/templates';
import { LAYOUTS } from '@/templates/constants';

export default function TopicView({
  topic: initialTopic,
  initialPosts,
  totalPosts,
  totalPages,
  currentPage,
  limit,
  initialRewardStats = {},
  initialIsRewardEnabled = false,
}) {
  const SidebarLayout = getTemplate(LAYOUTS.SidebarLayout);

  return (
    <SidebarLayout>
      <TopicProvider
        initialTopic={initialTopic}
        initialRewardStats={initialRewardStats}
        initialIsRewardEnabled={initialIsRewardEnabled}
        currentPage={currentPage}
        limit={limit}
      >
        <div className='overflow-hidden'>
          <TopicContent />
          <TopicActionMenu />
          <ReplySection
            initialPosts={initialPosts}
            totalPosts={totalPosts}
            totalPages={totalPages}
            currentPage={currentPage}
            limit={limit}
          />
        </div>
      </TopicProvider>
    </SidebarLayout>
  );
}

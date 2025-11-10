import { notFound } from 'next/navigation';
import TopicPageClient from '@/components/topic/TopicPageClient';
import { request } from '@/lib/server/api';

// 服务端获取话题数据的函数
async function getTopicData(id) {
  try {
    const d = await request(`/api/topics/${id}`);
    // console.log(d);
    return d;
  } catch (error) {
    console.error('Error fetching topic:', error);
    return null;
  }
}

// 服务端获取回复数据的函数
async function getPostsData(topicId, page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({
      topicId: topicId.toString(),
      page: page.toString(),
      limit: limit.toString(),
    });

    const d = await request(`/api/posts?${params}`);
    return d;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { items: [], total: 0 };
  }
}

// 生成页面元数据（SEO优化）
export async function generateMetadata({ params }) {
  const { id } = await params;
  const topic = await getTopicData(id);

  if (!topic) {
    return {
      title: '话题不存在',
    };
  }

  // 提取纯文本内容作为描述（去除Markdown标记）
  const description =
    topic.content?.replace(/[#*`\[\]]/g, '').substring(0, 160) || '';

  return {
    title: `${topic.title} - 话题详情`,
    description,
    openGraph: {
      title: topic.title,
      description,
      type: 'article',
      publishedTime: topic.createdAt,
      modifiedTime: topic.updatedAt,
      authors: [topic.userName || topic.username],
    },
  };
}

// 主页面组件（服务端组件）
export default async function TopicDetailPage({ params, searchParams }) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page) || 1;
  const LIMIT = 20;

  // 并行获取话题和回复数据
  const [topic, postsData] = await Promise.all([
    getTopicData(id),
    getPostsData(id, currentPage, LIMIT),
  ]);

  // 话题不存在
  if (!topic) {
    notFound();
  }

  const posts = postsData.items || [];
  const totalPosts = postsData.total || 0;
  const totalPages = Math.ceil(totalPosts / LIMIT);

  return (
    <TopicPageClient
      topic={topic}
      initialPosts={posts}
      totalPosts={totalPosts}
      totalPages={totalPages}
      currentPage={currentPage}
      limit={LIMIT}
    />
  );
}

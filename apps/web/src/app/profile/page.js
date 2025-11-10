import { redirect } from 'next/navigation';

export default function ProfilePage() {
  // 重定向到我的话题页面
  redirect('/profile/topics');
}

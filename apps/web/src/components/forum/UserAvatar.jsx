import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';

/**
 * 用户头像组件
 * @param {string} url - 头像 URL（可以是完整 URL 或相对路径）
 * @param {string} name - 用户名（用于生成 fallback 和 alt）
 * @param {string} size - 尺寸大小，可选值：'xs', 'sm', 'md', 'lg', 'xl'
 * @param {string} className - 额外的 CSS 类名
 */
export default function UserAvatar({ 
  url, 
  name, 
  size = 'md',
  className = '' 
}) {
  // 处理头像 URL
  const getAvatarUrl = () => {
    if (!url) return null;
    
    // 如果是完整 URL（http 或 https 开头），直接使用
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 否则拼接 API 基础 URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7100';
    const pathname = url.replace('/uploads/', '/uploads/embed,f_webp,s_200x200/');
    return `${baseUrl}${pathname}`;
  };

  // 生成 fallback 文字（取名字的首字母）
  const getFallbackText = () => {
    if (!name) return <User className="h-1/2 w-1/2" />;
    return name.charAt(0).toUpperCase();
  };

  // 尺寸映射
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  const avatarUrl = getAvatarUrl();
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <Avatar className={`${sizeClass} ${className}`}>
      {avatarUrl && (
        <AvatarImage 
          src={avatarUrl} 
          alt={name || '用户头像'} 
          className="object-cover"
        />
      )}
      <AvatarFallback className="bg-muted text-muted-foreground">
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
}

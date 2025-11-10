import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Eye, FileText, Clock } from 'lucide-react';
import TimeAgo from './TimeAgo';

export default function CategoryCard({ category }) {
  return (
    <Link href={`/categories/${category.slug}`}>
      <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md hover:border-primary/50 transition-all group">
        {/* 分类头部 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {category.name}
            </h3>
          </div>
        </div>

        {/* 分类描述 */}
        {category.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
            {category.description}
          </p>
        )}

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            <span className="font-medium">{category.topicCount || 0}</span>
            <span>话题</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            <span className="font-medium">{category.postCount || 0}</span>
            <span>回复</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-medium">{category.viewCount || 0}</span>
            <span>浏览</span>
          </div>
        </div>

        {/* 最新话题 */}
        {category.latestTopic ? (
          <div className="pt-3 border-t border-border">
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-0.5">最新话题</p>
                <p className="text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                  {category.latestTopic.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  <TimeAgo date={category.latestTopic.updatedAt} />
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">暂无话题</p>
          </div>
        )}

        {/* 子分类标记 */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">子分类:</span>
              {category.subcategories.slice(0, 3).map((sub) => (
                <Badge
                  key={sub.id}
                  variant="outline"
                  className="text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/categories/${sub.slug}`;
                  }}
                >
                  {sub.name}
                </Badge>
              ))}
              {category.subcategories.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{category.subcategories.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
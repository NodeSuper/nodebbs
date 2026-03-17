import { Eye } from 'lucide-react';

const TYPE_LABELS = {
  reply: '以下内容回复可见',
};

export default function ProtectedContentBlock({ type, children }) {
  const label = TYPE_LABELS[type] || '以下内容需要解锁';

  return (
    <div className="my-4 border border-border rounded-lg overflow-hidden">
      <div className="not-prose flex items-center gap-2 px-3 py-1.5 bg-muted/50 text-xs text-muted-foreground border-b border-border">
        <Eye className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <div className="px-3 py-1 *:first:mt-0 *:last:mb-0">
        {children}
      </div>
    </div>
  );
}

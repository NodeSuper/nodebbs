import { Lock } from 'lucide-react';

const TYPE_LABELS = {
  reply: '回复后可查看隐藏内容',
};

export default function ProtectedHiddenBlock({ type }) {
  const label = TYPE_LABELS[type] || '此内容暂不可见';

  return (
    <div className="not-prose my-4 flex items-center gap-3 p-4 border border-dashed border-border rounded-lg bg-muted/30 text-muted-foreground">
      <Lock className="h-5 w-5 shrink-0" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

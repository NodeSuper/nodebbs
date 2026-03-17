import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProtectedTool({ editor, disabled }) {
  const handleClick = () => {
    editor.insertText(':::protected{type="reply"}\n', '\n:::');
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      onClick={handleClick}
      disabled={disabled}
      title="回复可见"
    >
      <ShieldCheck className="h-4 w-4" />
    </Button>
  );
}

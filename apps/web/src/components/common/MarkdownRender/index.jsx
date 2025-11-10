import { useState } from 'react';
import { Copy } from 'lucide-react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { Button } from '@/components/ui/button';

export default function MarkdownRender({ content }) {
  return (
    <Markdown
      remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
      components={{
        a: ({ node, ...props }) => (
          <Link {...props} target='_blank' rel='noopener noreferrer' />
        ),
        code(props) {
          const { children, className, node, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');
          return match ? (
            <CodeBlock {...rest} language={match[1]} code={code} />
          ) : (
            <code {...rest} className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </Markdown>
  );
}

function CodeBlock({ language, code, ...rest }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className='relative group'>
      <Button
        onClick={handleCopy}
        variant='ghost'
        className='absolute right-2 top-2 h-7 shrink opacity-0 group-hover:opacity-100 transition'
      >
        {copied ? '已复制' : <Copy className='w-4 h-4' />}
      </Button>
      <SyntaxHighlighter
        {...rest}
        language={language}
        style={tomorrow}
        PreTag='div'
        // className='rounded-xl border-[3px] border-border'
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

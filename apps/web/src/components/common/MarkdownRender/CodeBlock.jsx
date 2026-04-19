'use client';

import React from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy } from 'lucide-react';
import CopyButton from '@/components/common/CopyButton';

import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import diff from 'react-syntax-highlighter/dist/esm/languages/prism/diff';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import toml from 'react-syntax-highlighter/dist/esm/languages/prism/toml';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

const LANGUAGES = {
  bash, sh: bash, shell: bash, 'shell-session': bash, console: bash,
  css,
  diff,
  docker, dockerfile: docker,
  go, golang: go,
  java,
  javascript, js: javascript,
  json,
  jsx,
  markdown, md: markdown,
  markup, html: markup, xml: markup,
  php,
  python, py: python,
  ruby, rb: ruby,
  rust, rs: rust,
  sql,
  toml,
  tsx,
  typescript, ts: typescript,
  yaml, yml: yaml,
};

for (const [name, definition] of Object.entries(LANGUAGES)) {
  SyntaxHighlighter.registerLanguage(name, definition);
}

export default function CodeBlock({ language, code, ...rest }) {
  return (
    <div className='relative group rounded-lg w-full max-w-full grid grid-cols-1 min-w-0'>
      <CopyButton
        value={code}
        variant='ghost'
        size='sm'
        className='absolute text-accent right-2 top-2 shrink opacity-0 group-hover:opacity-100 transition z-10'
      >
        {({ copied }) => (copied ? '已复制' : <Copy className='w-4 h-4' />)}
      </CopyButton>
      <SyntaxHighlighter
        {...rest}
        language={language}
        style={tomorrow}
        customStyle={{ margin: 0, overflowX: 'auto', maxWidth: '100%' }}
        PreTag='div'
        className='rounded-xl border-[3px] border-border overflow-x-auto max-w-full min-w-0'
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

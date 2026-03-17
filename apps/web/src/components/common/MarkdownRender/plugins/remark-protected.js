import { visit } from 'unist-util-visit';

/**
 * 受保护内容插件
 *
 * 处理两种 containerDirective：
 * - :::protected{type="reply"} — 已解锁，正常渲染子节点
 * - :::protected-hidden{type="reply"} — 未解锁，渲染提示卡片
 *
 * 属性通过 data-* 传递给前端组件
 */
export default function remarkProtected() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'containerDirective') return;

      if (node.name === 'protected') {
        const attrs = node.attributes || {};
        node.data = node.data || {};
        node.data.hName = 'protected-content';
        node.data.hProperties = {
          'data-type': attrs.type || '',
        };
      }

      if (node.name === 'protected-hidden') {
        const attrs = node.attributes || {};
        node.data = node.data || {};
        node.data.hName = 'protected-hidden';
        node.data.hProperties = {
          'data-type': attrs.type || '',
        };
      }
    });
  };
}

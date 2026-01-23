'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import Link from '@/components/common/Link';
import { cn } from '@/lib/utils';

/**
 * 通用操作菜单组件
 * 支持下拉菜单和内联按钮两种模式
 *
 * @param {Object} props
 * @param {Array} props.items - 操作项配置
 *   - label: string - 显示文本
 *   - icon: Component - lucide 图标组件
 *   - onClick: () => void - 点击回调
 *   - href: string - 链接地址（可选）
 *   - target: '_blank' | '_self' - 链接打开方式
 *   - variant: 'default' | 'destructive' | 'warning' - 样式变体
 *   - hidden: boolean - 是否隐藏
 *   - disabled: boolean - 是否禁用
 *   - separator: boolean - 在此项后添加分隔线
 * @param {'dropdown' | 'inline'} props.mode - 显示模式，默认 'dropdown'
 * @param {'start' | 'end'} props.align - 下拉菜单对齐方式，默认 'end'
 * @param {Component} props.triggerIcon - 自定义触发图标，默认 MoreHorizontal
 * @param {string} props.className - 容器额外样式
 */
export function ActionMenu({
  items = [],
  mode = 'dropdown',
  align = 'end',
  triggerIcon: TriggerIcon = MoreHorizontal,
  className,
}) {
  // 过滤掉隐藏的项
  const visibleItems = items.filter((item) => !item.hidden);

  if (visibleItems.length === 0) {
    return null;
  }

  // 获取变体样式
  const getVariantClassName = (variant) => {
    switch (variant) {
      case 'destructive':
        return 'text-destructive hover:text-destructive';
      case 'warning':
        return 'text-orange-600 hover:text-orange-600';
      default:
        return '';
    }
  };

  // 渲染单个操作项的内容
  const renderItemContent = (item) => {
    const Icon = item.icon;
    return (
      <>
        {Icon && <Icon className="h-4 w-4" />}
        {item.label}
      </>
    );
  };

  // 下拉菜单模式
  if (mode === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={className}>
            <TriggerIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align}>
          {visibleItems.map((item, index) => {
            // 纯分隔线项（只有 separator 属性，没有 label）
            if (item.separator && !item.label) {
              return <DropdownMenuSeparator key={index} />;
            }

            return (
              <React.Fragment key={index}>
                {item.href ? (
                  <DropdownMenuItem
                    asChild
                    disabled={item.disabled}
                    className={getVariantClassName(item.variant)}
                  >
                    <Link href={item.href} target={item.target}>
                      {renderItemContent(item)}
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={getVariantClassName(item.variant)}
                  >
                    {renderItemContent(item)}
                  </DropdownMenuItem>
                )}
              </React.Fragment>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // 内联按钮模式
  return (
    <div className={cn('flex items-center justify-end gap-1', className)}>
      {visibleItems.map((item, index) => {
        const Icon = item.icon;
        const buttonClassName = cn(
          'h-8 w-8 p-0',
          getVariantClassName(item.variant)
        );

        if (item.href) {
          return (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              asChild
              disabled={item.disabled}
              className={buttonClassName}
            >
              <Link href={item.href} target={item.target} title={item.label}>
                {Icon && <Icon className="h-4 w-4" />}
              </Link>
            </Button>
          );
        }

        return (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={item.onClick}
            disabled={item.disabled}
            className={buttonClassName}
            title={item.label}
          >
            {Icon && <Icon className="h-4 w-4" />}
          </Button>
        );
      })}
    </div>
  );
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// ============= 共享内容组件 =============
function ConfirmPopoverContent({
  title = '确认操作',
  description,
  confirmText = '确认',
  cancelText = '取消',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}) {
  const isDestructive = variant === 'destructive';

  return (
    <div className="space-y-3">
      {/* 标题区域 */}
      <div className="flex items-start gap-3">
        {isDestructive && (
          <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </div>
        )}
        <div className="space-y-1 flex-1">
          <h4 className="font-medium text-sm leading-none">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* 按钮区域 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={loading}
          className="h-8"
        >
          {cancelText}
        </Button>
        <Button
          variant={isDestructive ? 'destructive' : 'default'}
          size="sm"
          onClick={onConfirm}
          disabled={loading}
          className="h-8 gap-1.5"
          autoFocus
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {confirmText}
        </Button>
      </div>
    </div>
  );
}

// ============= 全局状态管理（类似 sonner toast） =============
let listeners = [];
let memoryState = { open: false, position: { x: 0, y: 0 }, options: {}, resolve: null };

function dispatch(action) {
  memoryState = { ...memoryState, ...action };
  listeners.forEach((listener) => listener(memoryState));
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

/**
 * confirm - 函数式确认弹出层
 * 
 * @example
 * import { confirm } from '@/components/common/ConfirmPopover';
 * 
 * const handleDelete = async (e) => {
 *   const confirmed = await confirm(e, {
 *     title: '确认删除',
 *     variant: 'destructive',
 *   });
 *   if (confirmed) {
 *     // 执行删除
 *   }
 * };
 */
export function confirm(event, options = {}) {
  let x = 0, y = 0;
  
  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top;
  } else if (event?.clientX !== undefined) {
    x = event.clientX;
    y = event.clientY;
  }

  return new Promise((resolve) => {
    dispatch({
      open: true,
      position: { x, y },
      options,
      resolve,
    });
  });
}

// ============= Portal 组件（放在 layout 中渲染弹出层） =============
import { useRef } from 'react';

export function ConfirmPopoverPortal() {
  const [state, setState] = useState(memoryState);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [safePosition, setSafePosition] = useState({ x: 0, y: 0 });
  const popoverRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    return subscribe(setState);
  }, []);

  // 边界检测：计算安全位置
  useEffect(() => {
    if (!state.open || !popoverRef.current) return;

    const popoverWidth = 288; // w-72 = 18rem = 288px
    const popoverHeight = popoverRef.current.offsetHeight || 120;
    const padding = 16; // 边缘安全距离

    let { x, y } = state.position;

    // 水平边界检测
    const minX = popoverWidth / 2 + padding;
    const maxX = window.innerWidth - popoverWidth / 2 - padding;
    x = Math.max(minX, Math.min(maxX, x));

    // 垂直边界检测：如果上方空间不足，显示在下方
    const spaceAbove = state.position.y - padding;
    if (spaceAbove < popoverHeight) {
      // 显示在触发点下方
      y = state.position.y + 40; // 40px offset for trigger height
    }

    setSafePosition({ x, y });
  }, [state.open, state.position]);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (state.options.onConfirm) {
        await state.options.onConfirm();
      }
      state.resolve?.(true);
      dispatch({ open: false });
    } catch (error) {
      console.error('ConfirmPopover onConfirm error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, state]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    state.resolve?.(false);
    dispatch({ open: false });
  }, [loading, state]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      handleCancel();
    }
  }, [handleConfirm, handleCancel, loading]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && !loading) {
      handleCancel();
    }
  }, [handleCancel, loading]);

  if (!mounted || !state.open) return null;

  // 判断是显示在上方还是下方
  const showBelow = state.position.y < 150;

  return createPortal(
    <div 
      className="fixed inset-0 z-50" 
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={popoverRef}
        className="absolute bg-popover text-popover-foreground rounded-md border p-4 shadow-lg w-72"
        style={{
          left: safePosition.x,
          top: showBelow ? state.position.y + 8 : state.position.y,
          transform: showBelow 
            ? 'translate(-50%, 0)' 
            : 'translate(-50%, calc(-100% - 8px))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfirmPopoverContent
          {...state.options}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </div>,
    document.body
  );
}

// ============= 组件式 API =============
/**
 * ConfirmPopover - 确认弹出层组件（组件式）
 * 
 * @example
 * <ConfirmPopover title="确认删除" onConfirm={handleDelete}>
 *   <Button>删除</Button>
 * </ConfirmPopover>
 */
export function ConfirmPopover({
  title,
  description,
  confirmText,
  cancelText,
  variant = 'default',
  onConfirm,
  children,
  disabled = false,
  align = 'center',
  side = 'top',
  sideOffset = 8,
  className,
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      await onConfirm?.();
      setOpen(false);
    } catch (error) {
      console.error('ConfirmPopover onConfirm error:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, onConfirm]);

  const handleCancel = useCallback(() => {
    if (loading) return;
    setOpen(false);
  }, [loading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      handleConfirm();
    }
  }, [handleConfirm, loading]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {children}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={sideOffset}
        className={cn('w-72 p-4', className)}
        onKeyDown={handleKeyDown}
      >
        <ConfirmPopoverContent
          title={title}
          description={description}
          confirmText={confirmText}
          cancelText={cancelText}
          variant={variant}
          loading={loading}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </PopoverContent>
    </Popover>
  );
}

export default ConfirmPopover;

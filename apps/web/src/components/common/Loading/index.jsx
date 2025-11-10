import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

/**
 * Loading 组件 - 基于 shadcn Spinner 的加载指示器
 * 
 * @param {Object} props
 * @param {string} [props.size='default'] - 尺寸: 'sm' | 'default' | 'lg' | 'xl'
 * @param {string} [props.variant='default'] - 变体: 'default' | 'fullscreen' | 'overlay' | 'inline'
 * @param {string} [props.text] - 加载文本
 * @param {string} [props.className] - 额外的 CSS 类名
 * @param {boolean} [props.center=true] - 是否居中显示
 */
export function Loading({
  size = 'default',
  variant = 'default',
  text,
  className,
  center = true,
  ...props
}) {
  const sizeClasses = {
    sm: 'size-4',
    default: 'size-6',
    lg: 'size-8',
    xl: 'size-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // 全屏加载
  if (variant === 'fullscreen') {
    return (
      <div
        className={cn(
          'fixed inset-0 z-50 flex flex-col items-center justify-center bg-background',
          className
        )}
        {...props}
      >
        <Spinner className={sizeClasses[size]} />
        {text && (
          <p className={cn('mt-4 text-muted-foreground', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // 遮罩层加载
  if (variant === 'overlay') {
    return (
      <div
        className={cn(
          'absolute inset-0 z-40 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <Spinner className={sizeClasses[size]} />
        {text && (
          <p className={cn('mt-4 text-muted-foreground', textSizeClasses[size])}>
            {text}
          </p>
        )}
      </div>
    );
  }

  // 行内加载
  if (variant === 'inline') {
    return (
      <span
        className={cn('inline-flex items-center gap-2', className)}
        {...props}
      >
        <Spinner className={sizeClasses[size]} />
        {text && <span className={textSizeClasses[size]}>{text}</span>}
      </span>
    );
  }

  // 默认加载
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        center && 'justify-center',
        className
      )}
      {...props}
    >
      <Spinner className={sizeClasses[size]} />
      {text && (
        <p className={cn('text-muted-foreground', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );
}

/**
 * LoadingButton - 带加载状态的按钮内容
 * 用于在按钮内显示加载状态
 */
export function LoadingButton({ loading, children, loadingText = 'Loading...' }) {
  if (loading) {
    return (
      <span className="inline-flex items-center gap-2">
        <Spinner className="size-4" />
        <span>{loadingText}</span>
      </span>
    );
  }
  return children;
}

/**
 * LoadingContainer - 带加载状态的容器
 * 在内容加载时显示加载指示器
 */
export function LoadingContainer({
  loading,
  children,
  loadingText,
  size = 'default',
  className,
  minHeight = '200px',
}) {
  if (loading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ minHeight }}
      >
        <Loading size={size} text={loadingText} />
      </div>
    );
  }
  return children;
}

/**
 * LoadingOverlay - 相对定位的遮罩层
 * 需要父元素设置 position: relative
 */
export function LoadingOverlay({ loading, children, loadingText, size = 'default' }) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <Loading variant="overlay" size={size} text={loadingText} />
      )}
    </div>
  );
}

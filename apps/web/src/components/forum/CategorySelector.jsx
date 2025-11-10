'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categoryApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Loading } from '../common/Loading';

/**
 * 分类选择器组件 - 支持树型展示
 * @param {Object} props
 * @param {string|number} props.value - 当前选中的分类 ID
 * @param {Function} props.onChange - 选择变化回调
 * @param {string} props.placeholder - 占位符文本
 * @param {boolean} props.disabled - 是否禁用
 * @param {number} props.excludeId - 排除的分类 ID（用于编辑时排除自己）
 * @param {boolean} props.onlyTopLevel - 只显示顶级分类
 * @param {string} props.className - 自定义样式类
 */
export default function CategorySelector({
  value,
  onChange,
  placeholder = '选择分类',
  disabled = false,
  excludeId = null,
  onlyTopLevel = false,
  className = '',
}) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryApi.getAll();
      setCategories(data || []);
    } catch (err) {
      console.error('获取分类列表失败:', err);
      toast.error('获取分类列表失败');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // 扁平化分类列表，添加层级标识
  const flattenCategories = (cats, level = 0, parentName = '') => {
    const result = [];

    cats.forEach((cat) => {
      // 排除指定的分类
      if (excludeId && cat.id === excludeId) {
        return;
      }

      // 如果只显示顶级分类，跳过子分类
      if (onlyTopLevel && level > 0) {
        return;
      }

      result.push({
        ...cat,
        level,
        displayName: cat.name,
        parentName,
      });

      // 递归处理子分类
      if (cat.subcategories && cat.subcategories.length > 0 && !onlyTopLevel) {
        result.push(
          ...flattenCategories(cat.subcategories, level + 1, cat.name)
        );
      }
    });

    return result;
  };

  const flatCategories = flattenCategories(categories);

  // 获取选中分类的显示名称
  const getSelectedCategoryName = () => {
    if (!value) return null;

    const findCategory = (cats) => {
      for (const cat of cats) {
        if (cat.id === Number(value)) {
          return cat.name;
        }
        if (cat.subcategories && cat.subcategories.length > 0) {
          const found = findCategory(cat.subcategories);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(categories);
  };

  if (loading) {
    return (
      <div
        className={`flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 ${className}`}
      >
        <Loading text='加载中...' size='sm' variant='inline' />
      </div>
    );
  }

  return (
    <Select
      value={value ? String(value) : undefined}
      onValueChange={(val) => onChange(Number(val))}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {getSelectedCategoryName()}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {flatCategories.length === 0 ? (
          <div className='py-6 text-center text-sm text-muted-foreground'>
            暂无分类
          </div>
        ) : (
          flatCategories.map((category) => (
            <SelectItem
              key={category.id}
              value={String(category.id)}
              className='cursor-pointer'
            >
              <div className='flex items-center gap-2'>
                {/* 层级缩进 */}
                {category.level > 0 && (
                  <span
                    className='text-muted-foreground'
                    style={{ marginLeft: `${category.level * 12}px` }}
                  >
                    └─
                  </span>
                )}

                {/* 分类颜色标识 */}
                {category.color && (
                  <div
                    className='h-3 w-3 rounded-sm shrink-0'
                    style={{ backgroundColor: category.color }}
                  />
                )}

                {/* 分类图标 */}
                {category.icon && (
                  <span className='text-base shrink-0'>{category.icon}</span>
                )}

                {/* 分类名称 */}
                <span
                  className={category.level > 0 ? 'text-sm' : 'font-medium'}
                >
                  {category.displayName}
                </span>

                {/* 父分类提示（可选） */}
                {category.level > 0 && category.parentName && (
                  <span className='text-xs text-muted-foreground'>
                    ({category.parentName})
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

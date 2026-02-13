'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import MultiSelect from '@/components/common/MultiSelect';

export function MultiRoleSelect({
  value = [],
  onChange,
  disabled,
  placeholder = '选择角色...',
  roles = [],
}) {
  const options = useMemo(
    () => roles.map((r) => ({ value: r.id, label: r.name, ...r })),
    [roles]
  );

  return (
    <MultiSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      searchPlaceholder="搜索角色..."
      disabled={disabled}
      renderOption={(opt) => (
        <div className="flex items-center gap-2">
          {opt.color && (
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: opt.color }}
            />
          )}
          <span>{opt.name}</span>
          {opt.isSystem && (
            <Badge variant="outline" className="text-[10px] px-1 h-4">
              系统
            </Badge>
          )}
        </div>
      )}
    />
  );
}

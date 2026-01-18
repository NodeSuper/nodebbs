import { useState } from 'react';
import { DataTable } from '@/components/common/DataTable';
import { ActionMenu } from '@/components/common/ActionMenu';
import { Badge } from '@/components/ui/badge';

import { Edit, Trash2 } from 'lucide-react';
import { Loading } from '@/components/common/Loading';
import { ItemTypeIcon } from '../shared/ItemTypeIcon';
import { getItemTypeLabel } from '../../utils/itemTypes';

/**
 * Shop items management table for admin
 * @param {Object} props
 * @param {Array} props.items - Array of shop items
 * @param {boolean} props.loading - Loading state
 * @param {Object} props.pagination - { page, total, limit, onPageChange }
 * @param {Function} props.onEdit - Callback when edit button clicked
 * @param {Function} props.onDelete - Callback when delete confirmed
 */
export function ShopItemTable({ items, loading, pagination, onEdit, onDelete }) {

  const columns = [
    {
      label: 'ID',
      key: 'id',
      render: (value) => <span className="text-muted-foreground">#{value}</span>,
    },
    {
      label: '类型',
      key: 'type',
      render: (value) => (
        <div className="flex items-center gap-2">
          <ItemTypeIcon type={value} className="h-4 w-4" />
          <span>{getItemTypeLabel(value)}</span>
        </div>
      ),
    },
    {
      label: '商品信息',
      key: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.imageUrl && (
            <div className="relative w-24 h-24">
              <img
                src={row.imageUrl}
                alt={row.name}
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{row.name}</div>
            {row.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">
                {row.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      label: '价格',
      key: 'price',
      render: (value) => (
        <span className="font-semibold text-yellow-600">{value}</span>
      ),
    },
    {
      label: '库存',
      key: 'stock',
      render: (value) => (
        <span>
          {value === null ? (
            <Badge variant="secondary">不限</Badge>
          ) : (
            <Badge variant={value > 10 ? 'default' : 'destructive'}>
              {value}
            </Badge>
          )}
        </span>
      ),
    },
    {
      label: '状态',
      key: 'isActive',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? '上架' : '下架'}
        </Badge>
      ),
    },
    {
      label: '排序',
      key: 'displayOrder',
      render: (value) => (
        <span className="text-muted-foreground">{value || 0}</span>
      ),
    },
    {
      label: '操作',
      key: 'operation',
      align: 'right',
      sticky: 'right',
      render: (value, row) => (
        <ActionMenu
          mode="inline"
          items={[
            {
              label: '编辑',
              icon: Edit,
              onClick: () => onEdit(row),
            },
            {
              label: '删除',
              icon: Trash2,
              onClick: (e) => onDelete(e, row),
              variant: 'destructive',
            },
          ]}
        />
      ),
    },
  ];

  if (loading) {
    return <Loading text="加载中..." className="py-12" />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        pagination={pagination}
      />


    </>
  );
}

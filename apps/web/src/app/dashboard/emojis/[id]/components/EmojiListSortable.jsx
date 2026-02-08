'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function SortableEmojiItem({ emoji, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: emoji.id });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group flex flex-col items-center justify-between p-2 bg-card border border-border rounded-lg min-h-[100px]',
        'hover:border-primary/50 hover:shadow-sm',
        isDragging && 'shadow-lg opacity-50 z-50 scale-105'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex-1 flex items-center justify-center py-2 h-16 w-full">
         <img 
            src={emoji.url} 
            alt={emoji.code}
            className="w-10 h-10 object-contain pointer-events-none select-none"
         />
      </div>
      
      <div className="w-full text-[10px] text-muted-foreground font-mono text-center break-all leading-tight px-1 pb-1 truncate">
        {emoji.code}
      </div>

      {/* 删除按钮（悬停时显示） */}
      <button
        onClick={(e) => {
           e.stopPropagation(); // 阻止冒泡
           onDelete(emoji);
        }}
        // 使用 pointer-events-auto 确保点击事件能被捕获
        className="absolute top-1 right-1 p-1.5 bg-destructive/10 text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-background pointer-events-auto"
        title="删除表情"
        // 阻止 DndKit 将此元素作为拖拽句柄
        data-no-dnd="true"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      
      {/* 序号标记（调试用） */}
      {/* <div className="absolute top-1 left-1 text-[10px] text-muted-foreground opacity-50">
         {emoji.order}
      </div> */}
    </div>
  );
}

export default function EmojiListSortable({ emojis, onReorder, onDelete }) {
  const [items, setItems] = useState(emojis);

  useEffect(() => {
    setItems(emojis);
  }, [emojis]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(newItems);
      
      const newOrder = newItems.map((item) => item.id);
      onReorder?.(newOrder);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
        暂无表情，请上传
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {items.map((emoji) => (
            <SortableEmojiItem 
               key={emoji.id} 
               emoji={emoji} 
               onDelete={onDelete} 
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

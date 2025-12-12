import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';
import { FormDialog } from '@/components/common/FormDialog';

export function BadgeFormDialog({ open, onOpenChange, mode, initialData, onSubmit }) {
  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      iconUrl: '',
      category: 'general',
      unlockCondition: '{}',
      displayOrder: 0,
      isActive: true,
    },
  });

  // 解析条件的辅助函数
  const parseCondition = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr || '{}');
      return {
        type: parsed.type || 'manual',
        threshold: parsed.threshold || 0
      };
    } catch {
      return { type: 'manual', threshold: 0 };
    }
  };

  // 解析元数据的辅助函数
  const parseMetadata = (jsonStr) => {
    try {
      return typeof jsonStr === 'string' ? JSON.parse(jsonStr) : (jsonStr || {});
    } catch {
      return {};
    }
  };

  useEffect(() => {
    if (open && mode === 'edit' && initialData) {
      const parsedCondition = parseCondition(initialData.unlockCondition);
      const parsedMetadata = parseMetadata(initialData.metadata);
      const effects = parsedMetadata.effects || {};

      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        iconUrl: initialData.iconUrl,
        category: initialData.category || 'general',
        unlockCondition: initialData.unlockCondition || '{}',
        // UI 辅助字段 - 条件
        _conditionType: parsedCondition.type,
        _threshold: parsedCondition.threshold,
        // UI 辅助字段 - 特效
        _effectCheckInBonus: effects.checkInBonus || 0,
        _effectCheckInBonusPercent: effects.checkInBonusPercent || 0,
        _effectReplyCostReduction: effects.replyCostReductionPercent || 0,
        
        displayOrder: initialData.displayOrder || 0,
        isActive: initialData.isActive !== false,
      });
    } else if (open && mode === 'create') {
      reset({
        name: '',
        slug: '',
        description: '',
        iconUrl: '',
        category: 'general',
        unlockCondition: '{"type": "manual"}',
        _conditionType: 'manual',
        _threshold: 0,
        // UI 辅助字段 - 特效
        _effectCheckInBonus: 0,
        _effectCheckInBonusPercent: 0,
        _effectReplyCostReduction: 0,
        
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [open, mode, initialData, reset]);

  const onFormSubmit = async (data) => {
    try {
      // 从 UI 字段构建 JSON (Condition)
      const conditionObj = {
        type: data._conditionType,
      };
      
      if (data._conditionType !== 'manual') {
        conditionObj.threshold = Number(data._threshold);
      }
      
      // 构建 Metadata (Effects)
      let currentMetadata = {};
      if (mode === 'edit' && initialData && initialData.metadata) {
         currentMetadata = parseMetadata(initialData.metadata);
      }
      
      const effects = {};
      if (data._effectCheckInBonus > 0) effects.checkInBonus = data._effectCheckInBonus;
      if (data._effectCheckInBonusPercent > 0) effects.checkInBonusPercent = data._effectCheckInBonusPercent;
      if (data._effectReplyCostReduction > 0) effects.replyCostReductionPercent = data._effectReplyCostReduction;

      const metadataObj = {
        ...currentMetadata,
        effects: Object.keys(effects).length > 0 ? effects : undefined
      };
      
      const finalData = {
        ...data,
        unlockCondition: JSON.stringify(conditionObj),
        metadata: JSON.stringify(metadataObj)
      };
      
      // 移除辅助字段
      delete finalData._conditionType;
      delete finalData._threshold;
      delete finalData._effectCheckInBonus;
      delete finalData._effectCheckInBonusPercent;
      delete finalData._effectReplyCostReduction;

      await onSubmit(finalData);
    } catch (error) {
       // handled by parent
       console.error("Form submit error", error);
    }
  };
  
  // 监听条件类型以有条件地显示阈值
  const conditionType = useForm().watch ? useForm().watch('_conditionType') : 'manual'; 


  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === 'create' ? '新建勋章' : '编辑勋章'}
      maxWidth="max-w-lg max-h-[90vh] overflow-y-auto"
      submitText={mode === 'create' ? '创建' : '保存'}
      onSubmit={handleSubmit(onFormSubmit)}
    >
        <form className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名称</Label>
              <Input 
                id="name" 
                placeholder="勋章名称"
                {...register('name', { required: '请输入勋章名称' })} 
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (唯一标识)</Label>
              <Input 
                id="slug" 
                placeholder="例如: checkin-master" 
                {...register('slug', { required: '请输入唯一标识 (Slug)' })} 
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label htmlFor="category">分类</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">通用 (General)</SelectItem>
                      <SelectItem value="achievement">成就 (Achievement)</SelectItem>
                      <SelectItem value="event">活动 (Event)</SelectItem>
                      <SelectItem value="manual">人工 (Manual)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="iconUrl">图标 URL</Label>
              <Input 
                id="iconUrl" 
                placeholder="/images/badges/example.png" 
                {...register('iconUrl', { required: '请输入图标 URL' })} 
              />
              {errors.iconUrl && <p className="text-sm text-destructive">{errors.iconUrl.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea 
              id="description" 
              placeholder="简短描述该勋章的获取方式"
              className="resize-none h-20"
              {...register('description')} 
            />
          </div>

          {/* 解锁条件构建器 */}
          <div className="space-y-4 border p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">解锁条件配置</h3>
                <span className="text-xs text-muted-foreground">配置自动获取规则</span>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label htmlFor="_conditionType" className="text-xs">条件类型</Label>
                <Controller
                  name="_conditionType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="选择类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">人工发放 (Manual)</SelectItem>
                        <SelectItem value="post_count">发帖数量 (Post Count)</SelectItem>
                        <SelectItem value="topic_count">话题数量 (Topic Count)</SelectItem>
                        <SelectItem value="like_received_count">获赞数量 (Likes Received)</SelectItem>
                        <SelectItem value="checkin_streak">连续签到 (Check-in Streak)</SelectItem>
                        <SelectItem value="registration_days">注册天数 (Days Registered)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {watch('_conditionType') !== 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="_threshold" className="text-xs">阈值</Label>
                  <Input 
                    id="_threshold" 
                    type="number" 
                    className="bg-background"
                    placeholder="例如: 10" 
                    {...register('_threshold', { 
                        required: watch('_conditionType') !== 'manual' ? '请输入阈值' : false,
                        valueAsNumber: true 
                    })} 
                  />
                </div>
              )}
            </div>
            
             {watch('_conditionType') !== 'manual' && (
                <div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border truncate">
                预览: {JSON.stringify({
                    type: watch('_conditionType') || 'manual',
                    threshold: Number(watch('_threshold') || 0)
                })}
                </div>
             )}
          </div>


                {/* Passive Effects Configuration */}
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="mb-2 text-sm font-medium">被动效果 (可选)</h4>
            
            {/* Check-in Bonus */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="_effectCheckInBonus">签到额外积分</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="_effectCheckInBonus"
                    type="number"
                    placeholder="例如: 5"
                    {...register('_effectCheckInBonus', { valueAsNumber: true })}
                  />
                  <span className="text-sm text-muted-foreground">分</span>
                </div>
                <p className="text-xs text-muted-foreground">固定数值，例如 5 表示额外加 5 分</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="_effectCheckInBonusPercent">签到积分加成</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="_effectCheckInBonusPercent"
                    type="number"
                    placeholder="例如: 10"
                    {...register('_effectCheckInBonusPercent', { valueAsNumber: true })}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
                 <p className="text-xs text-muted-foreground">百分比，例如 10 表示额外加 10%</p>
              </div>
            </div>

            {/* Reply Cost Reduction */}
            <div className="space-y-2">
              <Label htmlFor="_effectReplyCostReduction">回复扣费减免</Label>
               <div className="flex items-center gap-2">
                <Input
                  id="_effectReplyCostReduction"
                  type="number"
                  placeholder="例如: 50"
                  max="100"
                  {...register('_effectReplyCostReduction', { valueAsNumber: true, max: 100 })}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">百分比，例如 50 表示减免 50% 的费用</p>
            </div>
          </div>

          
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="displayOrder">排序权重</Label>
              <Input 
                id="displayOrder" 
                type="number" 
                {...register('displayOrder', { valueAsNumber: true })} 
              />
              <p className="text-[10px] text-muted-foreground">数字越小排序越靠前</p>
            </div>

            <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background h-[42px]">
              <div className="space-y-0.5">
                <Label htmlFor="isActive" className="cursor-pointer">启用状态</Label>
              </div>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </form>
    </FormDialog>
  );
}

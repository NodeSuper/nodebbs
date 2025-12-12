import React from 'react';
import { Lock, Zap, Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function BadgeCard({ badge, isUnlocked = false }) {
  // Parse unlock condition
  const condition = badge.unlockCondition ? JSON.parse(badge.unlockCondition) : {};
  // Parse metadata for effects
  const metadata = typeof badge.metadata === 'string' 
    ? (JSON.parse(badge.metadata || '{}')) 
    : (badge.metadata || {});
  const effects = metadata.effects || {};

  // Format condition text
  const getConditionText = () => {
     if (badge.category === 'manual') return '通过管理员发放或商城购买获得';
     if (condition.type === 'checkin_streak') return `连续签到满 ${condition.threshold} 天`;
     if (condition.type === 'post_count') return `累计发布 ${condition.threshold} 篇帖子`;
     if (condition.type === 'topic_count') return `累计发布 ${condition.threshold} 个话题`;
     if (condition.type === 'like_received_count') return `累计获得 ${condition.threshold} 次点赞`;
     if (condition.type === 'registration_days') return `注册满 ${condition.threshold} 天`;
     return badge.description || '探索社区以解锁此勋章';
  };

  const conditionText = getConditionText();

  // Helper to render effects
  const hasEffects = Object.keys(effects).length > 0;
  
  const renderEffects = () => {
    if (!hasEffects) return null;
    return (
      <div className="space-y-1 mt-2">
        <div className="flex items-center gap-1 text-xs font-semibold text-amber-500">
           <Zap className="w-3 h-3" /> 佩戴权益
        </div>
        <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside pl-1">
          {effects.checkInBonus > 0 && <li>签到额外 +{effects.checkInBonus} 分</li>}
          {effects.checkInBonusPercent > 0 && <li>签到积分 +{effects.checkInBonusPercent}%</li>}
          {effects.replyCostReductionPercent > 0 && <li>回复扣费 -{effects.replyCostReductionPercent}%</li>}
        </ul>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div 
            className={`
              group relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 cursor-default h-full
              ${isUnlocked 
                ? 'bg-card border-primary/20 shadow-sm hover:border-primary/50' 
                : 'bg-muted/40 border-transparent hover:bg-muted/60' // Locked state
              }
            `}
          >
            {/* Icon Area */}
            <div className="w-16 h-16 mb-3 relative transition-transform duration-300 group-hover:scale-110">
              <img 
                src={badge.iconUrl} 
                alt={badge.name} 
                className={`w-full h-full object-contain drop-shadow-sm ${!isUnlocked && 'grayscale opacity-40'}`}
              />
              {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-muted-foreground/50 drop-shadow-sm" />
                </div>
              )}
            </div>
            
            {/* Text Area */}
            <h3 className={`font-bold text-sm text-center mb-1 line-clamp-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
              {badge.name}
            </h3>
            
            <div className="text-[10px] text-center min-h-[1.5em] flex items-center justify-center w-full px-1">
              {isUnlocked ? (
                <span className="text-primary font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                  已获得
                </span>
              ) : (
                <span className="text-muted-foreground/60 line-clamp-2" title={conditionText}>
                  {badge.description || conditionText}
                </span>
              )}
            </div>

            {/* Unlock Status Badges (Visual Only) */}
            {hasEffects && isUnlocked && (
               <div className="absolute top-2 right-2">
                 <Zap className="w-3 h-3 text-amber-500 opacity-60" />
               </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px] p-4 bg-muted/95 backdrop-blur-sm text-popover-foreground [&_.z-50]:!bg-muted/95 [&_.z-50]:!fill-muted/95">
           <div className="space-y-3">
             <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                  <Award className="w-3 h-3" /> 获取条件
                </div>
                <p className="text-xs text-muted-foreground">
                   {conditionText}
                </p>
             </div>
             {renderEffects()}
           </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

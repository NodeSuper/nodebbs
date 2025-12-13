'use client';

import { Coins } from 'lucide-react';
import { RewardSystemSettings } from '../../components/admin/RewardSystemSettings';

export default function AdminRewardsPage() {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
            <Coins className="h-6 w-6" />
            积分账户
          </h1>
          <p className="text-muted-foreground">查看积分账户统计、管理用户积分及配置奖励规则</p>
        </div>
      </div>

      <RewardSystemSettings />

      {/* Dialog */}

    </div>
  );
}

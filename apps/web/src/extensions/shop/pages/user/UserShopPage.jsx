'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { shopApi, rewardsApi, ledgerApi } from '@/lib/api';
import { toast } from 'sonner';
import { useShopItems } from '@/extensions/shop/hooks/useShopItems';
import { BalanceCard } from '@/extensions/ledger/components/user/BalanceCard';
import { ItemTypeSelector } from '@/extensions/shop/components/shared/ItemTypeSelector';
import { PurchaseDialog } from '../../components/user/PurchaseDialog';
import { ItemPurchaseSuccessDialog } from '../../components/user/ItemPurchaseSuccessDialog';
import { BadgeUnlockDialog } from '../../components/user/BadgeUnlockDialog';
import { ShopItemGrid } from '../../components/user/ShopItemGrid';

export default function UserShopPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [itemType, setItemType] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  
  // 勋章解锁状态
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  
  // 购买成功跳转状态
  const [showViewItemsDialog, setShowViewItemsDialog] = useState(false);
  const [purchasedItem, setPurchasedItem] = useState(null); // Track purchased item for success dialog

  const [accounts, setAccounts] = useState([]);
  const { items, loading, refetch: refetchItems } = useShopItems({ type: itemType });
  
  const fetchAccounts = async () => {
    try {
      if (isAuthenticated) {
        const data = await ledgerApi.getAccounts();
        setAccounts(data);
      }
    } catch (error) {
       console.error('Failed to fetch accounts', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [isAuthenticated]);

  const handleBuyClick = (item) => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      return;
    }
    setSelectedItem(item);
    setBuyDialogOpen(true);
  };

  const handleBuy = async (data = {}) => {
    if (!selectedItem) return;
    const { isGift, receiverId, message } = data;

    setIsBuying(true);
    try {
      if (isGift) {
        await shopApi.giftItem(selectedItem.id, receiverId, message);
        toast.success('赠送成功！');
      } else {
        await shopApi.buyItem(selectedItem.id);
        
        // 显示成功反馈
        if (selectedItem.type === 'badge') {
          setUnlockedBadge(selectedItem);
          setShowUnlockDialog(true);
        } else {
          // toast.success('购买成功！'); // Success dialog replaces toast for items
          setPurchasedItem(selectedItem); // Save item for dialog
          setShowViewItemsDialog(true);
        }
      }
      
      // 关闭购买对话框
      setBuyDialogOpen(false);
      
      // 刷新数据
      await Promise.all([
          fetchAccounts(),
          refetchItems()
      ]);

      setSelectedItem(null);
      // setPurchasedItem(null); // Do not clear purchasedItem here, let the dialog handle it or clear when dialog closes
    } catch (error) {
      toast.error(error.message || '购买失败');
    } finally {
      setIsBuying(false);
    }
  };

  const currentPointsBalance = accounts.find(a => a.currency.code === 'credits')?.balance || 0;

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground mb-2 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            积分商城
          </h1>
          <p className="text-muted-foreground">使用积分购买专属装扮</p>
        </div>

        {/* 余额显示 - 默认显示积分，或者显示所有？目前仅保留积分 */}
        {isAuthenticated && (
          <BalanceCard balance={currentPointsBalance} />
        )}
      </div>

      {/* 商品类型选择器 & 网格 */}
      <ItemTypeSelector value={itemType} onChange={setItemType} excludedTypes={[]}>
        <ShopItemGrid
          items={items}
          accounts={accounts}
          onPurchase={handleBuyClick}
          isAuthenticated={isAuthenticated}
          loading={loading}
        />
      </ItemTypeSelector>

      {/* 购买对话框 */}
      <PurchaseDialog
        open={buyDialogOpen}
        item={selectedItem}
        accounts={accounts}
        onConfirm={handleBuy}
        onCancel={() => setBuyDialogOpen(false)}

        purchasing={isBuying}
      />

      {/* 购买成功跳转对话框 */}
      <ItemPurchaseSuccessDialog
        open={showViewItemsDialog}
        onOpenChange={setShowViewItemsDialog}
        item={purchasedItem}
        onView={() => router.push('/profile/items')}
        onStay={() => setShowViewItemsDialog(false)}
      />

      {/* 勋章解锁对话框 */}
      <BadgeUnlockDialog
        open={showUnlockDialog}
        onOpenChange={setShowUnlockDialog}
        badgeItem={unlockedBadge}
      />
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserAvatar from '@/components/forum/UserAvatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Calendar,
  Upload,
  Save,
  Loader2,
  Lock,
  MessageSquare,
  Shield,
  Eye,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, authApi } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
import Time from '@/components/forum/Time';

export default function SettingsPage() {
  const { user, isAuthenticated, loading: authLoading, checkAuth } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    messagePermission: 'everyone',
    contentVisibility: 'everyone',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
        messagePermission: user.messagePermission || 'everyone',
        contentVisibility: user.contentVisibility || 'everyone',
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const result = await userApi.uploadAvatar(file);
      setFormData((prev) => ({
        ...prev,
        avatar: result.avatar,
      }));
      toast.success('头像上传成功');
      await checkAuth(); // Refresh user data in auth context
    } catch (err) {
      console.error('上传头像失败:', err);
      toast.error('上传头像失败：' + err.message);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('姓名不能为空');
      return;
    }

    setLoading(true);

    try {
      await userApi.updateProfile({
        name: formData.name.trim(),
        bio: formData.bio.trim(),
        messagePermission: formData.messagePermission,
        contentVisibility: formData.contentVisibility,
      });

      toast.success('个人资料更新成功');
      await checkAuth(); // Refresh user data
    } catch (err) {
      console.error('更新资料失败:', err);
      toast.error('更新失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      toast.error('请填写所有密码字段');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('新密码长度至少为 6 位');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('两次输入的新密码不一致');
      return;
    }

    setChangingPassword(true);

    try {
      const res = await userApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (res.error) {
        throw new Error(res.error);
      }

      toast.success('密码修改成功');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      console.error('修改密码失败:', err);
      toast.error('修改密码失败：' + err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const avatarUrl = formData.avatar
    ? formData.avatar.startsWith('http')
      ? formData.avatar
      : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7100'}${
          formData.avatar
        }`
    : 'https://github.com/shadcn.png';

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-card-foreground mb-2'>
          个人设置
        </h1>
        <p className='text-muted-foreground'>管理你的账户信息和偏好设置</p>
      </div>

      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid grid-cols-3'>
          <TabsTrigger value='profile'>
            <User className='h-4 w-4' />
            个人资料
          </TabsTrigger>
          <TabsTrigger value='privacy'>
            <Shield className='h-4 w-4' />
            隐私设置
          </TabsTrigger>
          <TabsTrigger value='security'>
            <Lock className='h-4 w-4' />
            安全设置
          </TabsTrigger>
        </TabsList>

        {/* 个人资料 Tab */}
        <TabsContent value='profile'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* 个人资料 */}
            <div className='bg-card border border-border rounded-lg overflow-hidden'>
              <div className='px-4 py-3 bg-muted border-b border-border'>
                <h3 className='text-sm font-medium text-card-foreground'>
                  个人资料
                </h3>
              </div>
              <div className='p-6 space-y-6'>
                {/* 头像 */}
                <div className='flex items-start space-x-4'>
                  <UserAvatar url={formData.avatar} name={user.username} size="xl" />
                  <div className='flex-1'>
                    <Label className='text-sm font-medium text-card-foreground block mb-2'>
                      头像
                    </Label>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                    />
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={handleAvatarClick}
                      disabled={uploadingAvatar}
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className='h-4 w-4 animate-spin' />
                          上传中...
                        </>
                      ) : (
                        <>
                          <Upload className='h-4 w-4' />
                          上传新头像
                        </>
                      )}
                    </Button>
                    <p className='text-xs text-muted-foreground mt-2'>
                      推荐尺寸：200x200px，支持 JPG、PNG 格式，最大 5MB
                    </p>
                  </div>
                </div>

                {/* 用户名 - 只读 */}
                <div>
                  <Label className='text-sm font-medium text-card-foreground block mb-2'>
                    用户名
                  </Label>
                  <Input
                    type='text'
                    value={user.username}
                    disabled
                    className='bg-muted'
                  />
                  <p className='text-xs text-muted-foreground mt-1'>
                    用户名不可修改
                  </p>
                </div>

                {/* 邮箱 - 只读 */}
                <div>
                  <Label className='text-sm font-medium text-card-foreground block mb-2'>
                    <Mail className='h-4 w-4 inline mr-1' />
                    邮箱地址
                  </Label>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='email'
                      value={user.email}
                      disabled
                      className='bg-muted flex-1'
                    />
                    {user.isEmailVerified ? (
                      <Badge variant='success' className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                        已验证
                      </Badge>
                    ) : (
                      <Badge variant='warning' className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'>
                        未验证
                      </Badge>
                    )}
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    邮箱不可修改
                  </p>
                </div>

                {/* 姓名 */}
                <div>
                  <Label className='text-sm font-medium text-card-foreground block mb-2'>
                    姓名 *
                  </Label>
                  <Input
                    type='text'
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder='请输入姓名'
                    required
                  />
                </div>

                {/* 个人简介 */}
                <div>
                  <Label className='text-sm font-medium text-card-foreground block mb-2'>
                    个人简介
                  </Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    placeholder='介绍一下你自己...'
                    className='resize-none'
                  />
                </div>
              </div>
            </div>

            {/* 账户信息 */}
            <div className='bg-card border border-border rounded-lg overflow-hidden'>
              <div className='px-4 py-3 bg-muted border-b border-border'>
                <h3 className='text-sm font-medium text-card-foreground'>
                  账户信息
                </h3>
              </div>
              <div className='p-6 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <Calendar className='h-4 w-4' />
                    <span>加入时间</span>
                  </div>
                  <span className='text-sm text-card-foreground'>
                    <Time date={user.createdAt} />
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <User className='h-4 w-4' />
                    <span>用户ID</span>
                  </div>
                  <Badge variant='secondary'>#{user.id}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2 text-sm text-muted-foreground'>
                    <User className='h-4 w-4' />
                    <span>用户角色</span>
                  </div>
                  <Badge variant='outline'>
                    {user.role === 'admin'
                      ? '管理员'
                      : user.role === 'moderator'
                      ? '版主'
                      : '用户'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className='flex items-center justify-end space-x-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setFormData({
                    name: user.name || '',
                    bio: user.bio || '',
                    avatar: user.avatar || '',
                    messagePermission: user.messagePermission || 'everyone',
                    contentVisibility: user.contentVisibility || 'everyone',
                  });
                }}
              >
                重置
              </Button>
              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    保存设置
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* 隐私设置 Tab */}
        <TabsContent value='privacy'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='bg-card border border-border rounded-lg overflow-hidden'>
              <div className='px-4 py-3 bg-muted border-b border-border'>
                <h3 className='text-sm font-medium text-card-foreground'>
                  站内信设置
                </h3>
              </div>
              <div className='p-6 space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1 mr-4'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <MessageSquare className='h-4 w-4 text-muted-foreground' />
                      <Label className='text-sm font-medium text-card-foreground'>
                        站内信权限
                      </Label>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      控制谁可以给你发送站内信
                    </p>
                  </div>
                  <Select
                    value={formData.messagePermission}
                    onValueChange={(value) =>
                      handleInputChange('messagePermission', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formData.messagePermission === 'everyone' && '所有已登录用户'}
                        {formData.messagePermission === 'followers' && '关注我的用户'}
                        {formData.messagePermission === 'disabled' && '禁用'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align='end'>
                      <SelectItem value='everyone'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>所有已登录用户</span>
                          <span className='text-xs text-muted-foreground'>
                            任何登录用户都可以给你发站内信
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='followers'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>关注我的用户</span>
                          <span className='text-xs text-muted-foreground'>
                            只有关注你的用户可以发站内信
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='disabled'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>禁用</span>
                          <span className='text-xs text-muted-foreground'>
                            不接收任何站内信
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center justify-between'>
                  <div className='flex-1 mr-4'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <Eye className='h-4 w-4 text-muted-foreground' />
                      <Label className='text-sm font-medium text-card-foreground'>
                        话题/回复查看权限
                      </Label>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      控制谁可以在你的个人主页查看你发布的话题和回复
                    </p>
                  </div>
                  <Select
                    value={formData.contentVisibility}
                    onValueChange={(value) =>
                      handleInputChange('contentVisibility', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {formData.contentVisibility === 'everyone' && '所有人'}
                        {formData.contentVisibility === 'authenticated' && '登录用户'}
                        {formData.contentVisibility === 'private' && '仅自己'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent align='end'>
                      <SelectItem value='everyone'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>所有人</span>
                          <span className='text-xs text-muted-foreground'>
                            任何人都可以查看你的话题和回复
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='authenticated'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>登录用户</span>
                          <span className='text-xs text-muted-foreground'>
                            只有登录用户可以查看
                          </span>
                        </div>
                      </SelectItem>
                      <SelectItem value='private'>
                        <div className='flex flex-col items-start'>
                          <span className='font-medium'>仅自己</span>
                          <span className='text-xs text-muted-foreground'>
                            只有你自己可以查看
                          </span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 保存按钮 */}
            <div className='flex items-center justify-end'>
              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    保存中...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4' />
                    保存设置
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* 安全设置 Tab */}
        <TabsContent value='security'>
          <div className='space-y-6'>
            {/* 邮箱验证 */}
            <div className='bg-card border border-border rounded-lg overflow-hidden'>
              <div className='px-4 py-3 bg-muted border-b border-border'>
                <h3 className='text-sm font-medium text-card-foreground'>
                  邮箱验证
                </h3>
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex-1 mr-4'>
                    <div className='flex items-center space-x-2 mb-1'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <Label className='text-sm font-medium text-card-foreground'>
                        {user.email}
                      </Label>
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {user.isEmailVerified
                        ? '您的邮箱已验证'
                        : '请验证您的邮箱以使用完整功能'}
                    </p>
                  </div>
                  {user.isEmailVerified ? (
                    <Badge variant='success' className='bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'>
                      已验证
                    </Badge>
                  ) : (
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={async () => {
                        try {
                          const data = await authApi.resendVerification();
                          toast.success(data.message || '验证邮件已发送');
                        } catch (err) {
                          toast.error(err.message || '发送失败');
                        }
                      }}
                    >
                      <Mail className='h-4 w-4' />
                      发送验证邮件
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* 修改密码 */}
            <form onSubmit={handlePasswordSubmit} className='space-y-6'>
              <div className='bg-card border border-border rounded-lg overflow-hidden'>
                <div className='px-4 py-3 bg-muted border-b border-border'>
                  <h3 className='text-sm font-medium text-card-foreground'>
                    修改密码
                  </h3>
                </div>
                <div className='p-6 space-y-4'>
                  <div>
                    <Label className='text-sm font-medium text-card-foreground block mb-2'>
                      当前密码 *
                    </Label>
                    <Input
                      type='password'
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handlePasswordChange('currentPassword', e.target.value)
                      }
                      placeholder='请输入当前密码'
                    />
                  </div>

                  <div>
                    <Label className='text-sm font-medium text-card-foreground block mb-2'>
                      新密码 *
                    </Label>
                    <Input
                      type='password'
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handlePasswordChange('newPassword', e.target.value)
                      }
                      placeholder='请输入新密码（至少6位）'
                    />
                  </div>

                  <div>
                    <Label className='text-sm font-medium text-card-foreground block mb-2'>
                      确认新密码 *
                    </Label>
                    <Input
                      type='password'
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handlePasswordChange('confirmPassword', e.target.value)
                      }
                      placeholder='请再次输入新密码'
                    />
                  </div>
                </div>
              </div>

              <div className='flex items-center justify-end'>
                <Button type='submit' disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      修改中...
                    </>
                  ) : (
                    <>
                      <Lock className='h-4 w-4' />
                      修改密码
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

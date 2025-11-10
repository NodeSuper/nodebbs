'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Loading } from '@/components/common/Loading';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('无效的重置链接');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.resetPassword(token, password);
      setSuccess(true);
      toast.success(data.message || '密码重置成功！');
      // 3秒后跳转到首页
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      const errorMsg = err.message || '重置失败，请稍后重试';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className='container max-w-md mx-auto py-16'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2 text-destructive'>
              <XCircle className='h-5 w-5' />
              <CardTitle>无效的重置链接</CardTitle>
            </div>
            <CardDescription>该密码重置链接无效或已过期</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className='w-full'>
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className='container max-w-md mx-auto py-16'>
        <Card>
          <CardHeader>
            <div className='flex items-center gap-2 text-green-600'>
              <CheckCircle className='h-5 w-5' />
              <CardTitle>密码重置成功</CardTitle>
            </div>
            <CardDescription>
              您的密码已成功重置，即将跳转到首页...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className='w-full'>
              立即返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container max-w-md mx-auto py-16'>
      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>请输入您的新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && (
              <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20'>
                {error}
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='password'>新密码</Label>
              <Input
                id='password'
                type='password'
                placeholder='至少6位字符'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>确认新密码</Label>
              <Input
                id='confirmPassword'
                type='password'
                placeholder='请再次输入新密码'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button type='submit' className='w-full' disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  重置中...
                </>
              ) : (
                '重置密码'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

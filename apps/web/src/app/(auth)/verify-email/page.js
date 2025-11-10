'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Loading } from '@/components/common/Loading';

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('缺少验证令牌');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token) => {
    try {
      const data = await authApi.verifyEmail(token);
      setStatus('success');
      setMessage(data.message || '邮箱验证成功');

      // Refresh user data if logged in
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.message || '验证失败，请重试');
    }
  };

  return (
    <div className='container max-w-2xl py-12 mx-auto'>
      <div className='bg-card border border-border rounded-lg p-8 text-center'>
        {status === 'verifying' && (
          <>
            <Loader2 className='h-16 w-16 animate-spin text-primary mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-foreground mb-2'>
              正在验证邮箱...
            </h1>
            <p className='text-muted-foreground'>
              请稍候，我们正在验证您的邮箱地址
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className='h-16 w-16 text-green-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-foreground mb-2'>
              验证成功！
            </h1>
            <p className='text-muted-foreground mb-6'>{message}</p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className='h-16 w-16 text-red-500 mx-auto mb-4' />
            <h1 className='text-2xl font-bold text-foreground mb-2'>
              验证失败
            </h1>
            <p className='text-muted-foreground mb-6'>{message}</p>
            <div className='flex gap-3 justify-center'>
              <Button variant='outline' onClick={() => router.push('/')}>
                返回首页
              </Button>
              <Button onClick={() => router.push('/profile/settings')}>
                前往设置
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Loading text='加载中...' />}>
      <VerifyEmailPage />
    </Suspense>
  );
}

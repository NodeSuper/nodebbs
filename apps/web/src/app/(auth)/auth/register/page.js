'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RegisterSection } from '@/components/auth/RegisterSection';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { settings } = useSettings();

  const codeFromUrl = searchParams.get('code') || '';
  const registrationMode = settings?.registration_mode?.value || 'open';

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  const isClosed = registrationMode === 'closed';

  return (
    <Card className="w-full max-w-md shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">注册</CardTitle>
        <CardDescription>
          {isClosed ? '系统当前已关闭用户注册' : '加入社区，开始讨论'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isClosed && (
          <RegisterSection
            initialInvitationCode={codeFromUrl}
            onSuccess={() => router.push('/')}
          />
        )}

        <div className="text-center text-sm mt-4">
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/auth/login')}
          >
            {isClosed ? '返回登录' : '已有账户？立即登录'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

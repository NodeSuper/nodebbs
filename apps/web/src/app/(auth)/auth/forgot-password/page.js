'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from '@/components/auth/LoginDialog/ForgotPasswordForm';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <Card className="w-full max-w-md shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">找回密码</CardTitle>
        <CardDescription>通过邮箱验证码重置密码</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm
          onSuccess={() => {
            toast.success('密码重置成功，请使用新密码登录');
            router.push('/auth/login');
          }}
        />

        <div className="text-center text-sm mt-4">
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/auth/login')}
          >
            返回登录
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

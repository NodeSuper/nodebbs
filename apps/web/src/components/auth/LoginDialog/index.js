'use client';

import { useState } from 'react';
import { FormDialog } from '@/components/common/FormDialog';
import { toast } from 'sonner';

import { LoginSection } from '@/components/auth/LoginSection';
import { RegisterSection } from '@/components/auth/RegisterSection';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { ModeSwitcher } from './ModeSwitcher';

const MODE_CONFIG = {
  login: { title: '登录', description: '欢迎回来' },
  register: { title: '注册', description: '加入社区，开始讨论' },
  'forgot-password': { title: '找回密码', description: '通过邮箱验证码重置密码' },
};

export default function LoginDialog({ open, onOpenChange }) {
  const [mode, setMode] = useState('login');
  const [dialogKey, setDialogKey] = useState(0);

  const { title, description } = MODE_CONFIG[mode];

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setMode('login');
      setDialogKey(k => k + 1);
    }
    onOpenChange?.(isOpen);
  };

  const handleClose = () => handleOpenChange(false);

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      maxWidth="sm:max-w-[450px]"
      footer={null}
    >
      <div key={dialogKey}>
        {mode === 'login' && (
          <LoginSection
            onSuccess={handleClose}
            onForgotPassword={() => setMode('forgot-password')}
          />
        )}
        {mode === 'register' && (
          <RegisterSection onSuccess={handleClose} />
        )}
        {mode === 'forgot-password' && (
          <ForgotPasswordForm
            onSuccess={() => {
              setMode('login');
              toast.success('密码重置成功，请使用新密码登录');
            }}
          />
        )}
      </div>

      <ModeSwitcher mode={mode} onModeChange={setMode} />
    </FormDialog>
  );
}

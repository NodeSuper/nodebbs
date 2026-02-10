'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const initialFormData = {
  identifier: '',
  password: '',
};

export function useLoginForm({ onSuccess } = {}) {
  const { login } = useAuth();

  const [formData, setFormData] = useState({ ...initialFormData });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.identifier || !formData.password) {
      setError('请填写用户名/邮箱和密码');
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData.identifier, formData.password, captchaToken);

      if (result.success) {
        toast.success('登录成功！');
        resetForm();
        onSuccess?.();
      } else {
        setError(result.error || '登录失败');
        toast.error(result.error || '登录失败');
      }
    } catch (err) {
      const errorMsg = err.message || '登录失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [formData, captchaToken, login, onSuccess]);

  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData });
    setError('');
    setCaptchaToken(null);
  }, []);

  return {
    formData,
    isLoading,
    error,
    setError,
    captchaToken,
    handleChange,
    handleSubmit,
    setCaptchaToken,
    resetForm,
  };
}

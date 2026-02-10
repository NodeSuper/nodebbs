'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { invitationsApi } from '@/lib/api';
import { toast } from 'sonner';
import { validateUsername } from '@/lib/validateUsername';

const initialFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  invitationCode: '',
};

export function useRegisterForm({ initialInvitationCode = '', onSuccess } = {}) {
  const { register } = useAuth();
  const { settings } = useSettings();

  const registrationMode = settings?.registration_mode?.value || 'open';

  const [formData, setFormData] = useState({
    ...initialFormData,
    invitationCode: initialInvitationCode,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationCodeStatus, setInvitationCodeStatus] = useState(null);
  const [captchaToken, setCaptchaToken] = useState(null);

  // Auto-validate invitation code from URL on mount
  useEffect(() => {
    if (initialInvitationCode) {
      validateInvitationCode(initialInvitationCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialInvitationCode]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
  }, []);

  const validateInvitationCode = useCallback(async (code) => {
    const value = code || formData.invitationCode.trim();
    if (!value) {
      setInvitationCodeStatus(null);
      return;
    }

    try {
      const result = await invitationsApi.validate(value);
      setInvitationCodeStatus(result);
    } catch (error) {
      setInvitationCodeStatus({
        valid: false,
        message: '验证失败，请稍后重试',
      });
    }
  }, [formData.invitationCode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    if (registrationMode === 'closed') {
      setError('系统当前已关闭用户注册');
      toast.error('系统当前已关闭用户注册');
      return;
    }

    if (registrationMode === 'invitation' && !formData.invitationCode) {
      setError('邀请码注册模式下必须提供邀请码');
      toast.error('邀请码注册模式下必须提供邀请码');
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      setError('请填写所有必填字段');
      return;
    }

    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.valid) {
      setError(usernameValidation.error);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (formData.password.length < 6) {
      setError('密码长度至少为6位');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        name: formData.name || formData.username,
      };

      if (registrationMode === 'invitation') {
        registerData.invitationCode = formData.invitationCode;
      }

      const result = await register({ ...registerData, captchaToken });

      if (result.success) {
        toast.success('注册成功！欢迎加入！');
        resetForm();
        onSuccess?.();
      } else {
        setError(result.error || '注册失败');
        toast.error(result.error || '注册失败');
      }
    } catch (err) {
      const errorMsg = err.message || '注册失败';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [formData, registrationMode, captchaToken, register, onSuccess]);

  const resetForm = useCallback(() => {
    setFormData({ ...initialFormData });
    setError('');
    setInvitationCodeStatus(null);
    setCaptchaToken(null);
  }, []);

  return {
    formData,
    isLoading,
    error,
    setError,
    invitationCodeStatus,
    captchaToken,
    registrationMode,
    handleChange,
    handleSubmit,
    validateInvitationCode,
    setCaptchaToken,
  };
}

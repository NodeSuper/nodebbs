'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// OAuth 按钮组件
function OAuthButton({ provider, isLogin, isLoading, setIsLoading, setError }) {
  const handleOAuthLogin = async () => {
    try {
      setIsLoading(true);
      let authorizationUri;
      
      switch (provider.provider) {
        case 'github':
          const githubData = await authApi.getGithubAuthUrl();
          authorizationUri = githubData.authorizationUri;
          break;
        case 'google':
          const googleData = await authApi.getGoogleAuthUrl();
          authorizationUri = googleData.authorizationUri;
          break;
        case 'apple':
          const appleData = await authApi.getAppleAuthUrl();
          authorizationUri = appleData.authorizationUri;
          break;
        default:
          throw new Error('不支持的 OAuth 提供商');
      }
      
      window.location.href = authorizationUri;
    } catch (err) {
      setError(err.message || `${provider.displayName} 登录失败`);
      toast.error(err.message || `${provider.displayName} 登录失败`);
      setIsLoading(false);
    }
  };

  const getProviderIcon = () => {
    switch (provider.provider) {
      case 'github':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        );
      case 'google':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        );
      case 'apple':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleOAuthLogin}
      disabled={isLoading}
    >
      {getProviderIcon()}
      使用 {provider.displayName} {isLogin ? '登录' : '注册'}
    </Button>
  );
}
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { settingsApi, authApi, invitationsApi, oauthConfigApi } from '@/lib/api';
import { toast } from 'sonner';

export default function LoginDialog({ open, onOpenChange }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot-password'
  const [oauthProviders, setOauthProviders] = useState([]);
  const [formData, setFormData] = useState({
    identifier: '', // 用于登录的用户名或邮箱
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    invitationCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationMode, setRegistrationMode] = useState('open');
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [invitationCodeStatus, setInvitationCodeStatus] = useState(null);
  
  const isLogin = mode === 'login';
  const isForgotPassword = mode === 'forgot-password';

  // 获取注册模式设置和 OAuth 提供商
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [settings, oauthData] = await Promise.all([
          settingsApi.getAll(),
          oauthConfigApi.getProviders().catch(() => ({ items: [] })),
        ]);
        
        if (settings.registration_mode) {
          setRegistrationMode(settings.registration_mode.value);
        }
        
        if (oauthData.items) {
          setOauthProviders(oauthData.items);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        // 默认开放注册
        setRegistrationMode('open');
      } finally {
        setLoadingSettings(false);
      }
    };

    if (open) {
      fetchSettings();
    }
  }, [open]);

  // 验证邀请码
  const validateInvitationCode = async () => {
    if (!formData.invitationCode.trim()) {
      setInvitationCodeStatus(null);
      return;
    }

    try {
      const result = await invitationsApi.validate(formData.invitationCode.trim());
      setInvitationCodeStatus(result);
    } catch (error) {
      setInvitationCodeStatus({
        valid: false,
        message: '验证失败，请稍后重试',
      });
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(''); // 清除错误
    setSuccess(''); // 清除成功消息
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email) {
      setError('请输入邮箱地址');
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.forgotPassword(formData.email);
      setSuccess(data.message || '密码重置链接已发送到您的邮箱，请查收');
      toast.success('密码重置链接已发送到您的邮箱');
      // 3秒后切换回登录
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 3000);
    } catch (err) {
      const errorMsg = err.message || '发送失败，请稍后重试';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 找回密码使用单独的处理函数
    if (isForgotPassword) {
      return handleForgotPassword(e);
    }

    // 验证
    if (isLogin) {
      if (!formData.identifier || !formData.password) {
        setError('请填写用户名/邮箱和密码');
        return;
      }
    } else {
      // 检查注册模式
      if (registrationMode === 'closed') {
        setError('系统当前已关闭用户注册');
        toast.error('系统当前已关闭用户注册');
        return;
      }
      
      // 如果是邀请码模式，检查邀请码
      if (registrationMode === 'invitation' && !formData.invitationCode) {
        setError('邀请码注册模式下必须提供邀请码');
        toast.error('邀请码注册模式下必须提供邀请码');
        return;
      }
      
      if (!formData.username || !formData.email || !formData.password) {
        setError('请填写所有必填字段');
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
    }

    setIsLoading(true);

    try {
      let result;
      if (isLogin) {
        // 登录（使用用户名或邮箱）
        result = await login(formData.identifier, formData.password);
      } else {
        // 注册
        const registerData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.username
        };
        
        // 如果是邀请码模式，添加邀请码
        if (registrationMode === 'invitation') {
          registerData.invitationCode = formData.invitationCode;
        }
        
        result = await register(registerData);
      }

      if (result.success) {
        toast.success(isLogin ? '登录成功！' : '注册成功！欢迎加入！');
        handleOpenChange(false);
        // 重置表单
        setFormData({
          identifier: '',
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          name: '',
          invitationCode: ''
        });
        setInvitationCodeStatus(null);
      } else {
        setError(result.error || (isLogin ? '登录失败' : '注册失败'));
        toast.error(result.error || (isLogin ? '登录失败' : '注册失败'));
      }
    } catch (err) {
      const errorMsg = err.message || (isLogin ? '登录失败' : '注册失败');
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    // 当对话框关闭时，重置表单
    if (!isOpen) {
      setMode('login');
      setFormData({
        identifier: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        invitationCode: ''
      });
      setError('');
      setSuccess('');
      setInvitationCodeStatus(null);
    }
    onOpenChange?.(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isForgotPassword ? '找回密码' : isLogin ? '登录' : '注册'}
          </DialogTitle>
          <DialogDescription>
            {isForgotPassword
              ? '输入您的邮箱地址，我们将发送密码重置链接'
              : isLogin
              ? '登录到您的账户以继续'
              : '创建新账户以加入社区'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-900">
                {success}
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">用户名 *</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="请输入您的姓名（可选）"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {isLogin ? (
              <div className="grid gap-2">
                <Label htmlFor="identifier">用户名或邮箱 *</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  value={formData.identifier}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="email">邮箱 *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {!isForgotPassword && (
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">密码 *</Label>
                  {isLogin && (
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs font-normal"
                      onClick={() => {
                        setMode('forgot-password');
                        setError('');
                        setSuccess('');
                      }}
                      disabled={isLoading}
                    >
                      忘记密码？
                    </Button>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isLogin ? "请输入密码" : "至少6位字符"}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">确认密码 *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {/* 邀请码输入框（仅在邀请码注册模式下显示） */}
            {!isLogin && !isForgotPassword && registrationMode === 'invitation' && (
              <div className="grid gap-2">
                <Label htmlFor="invitationCode">
                  邀请码 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="invitationCode"
                  name="invitationCode"
                  type="text"
                  placeholder="请输入邀请码"
                  value={formData.invitationCode}
                  onChange={handleChange}
                  onBlur={validateInvitationCode}
                  disabled={isLoading}
                  required
                />
                {invitationCodeStatus && (
                  <p
                    className={`text-sm ${
                      invitationCodeStatus.valid
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {invitationCodeStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading 
                ? (isForgotPassword ? '发送中...' : isLogin ? '登录中...' : '注册中...') 
                : (isForgotPassword ? '发送重置链接' : isLogin ? '登录' : '注册')}
            </Button>
          </DialogFooter>
        </form>

        {/* OAuth 登录选项 */}
        {!isForgotPassword && oauthProviders.length > 0 && (
          <>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或使用以下方式{isLogin ? '登录' : '注册'}
                </span>
              </div>
            </div>

            <div className="grid gap-2">
              {oauthProviders.map((provider) => (
                <OAuthButton
                  key={provider.provider}
                  provider={provider}
                  isLogin={isLogin}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                  setError={setError}
                />
              ))}
            </div>
          </>
        )}

        {/* 注册/登录/找回密码切换 */}
        {!loadingSettings && (
          <div className="text-center text-sm space-y-2">
            {isForgotPassword ? (
              <Button
                variant="link"
                className="p-0 h-auto font-normal"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                disabled={isLoading}
              >
                返回登录
              </Button>
            ) : registrationMode !== 'closed' ? (
              <>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => {
                    setMode(isLogin ? 'register' : 'login');
                    setError('');
                    setSuccess('');
                    setInvitationCodeStatus(null);
                  }}
                  disabled={isLoading}
                >
                  {isLogin
                    ? "还没有账户？点击注册"
                    : "已有账户？点击登录"}
                </Button>
                {/* 邀请码模式提示 */}
                {!isLogin && registrationMode === 'invitation' && (
                  <p className="text-muted-foreground text-xs">
                    当前为邀请码注册模式，需要邀请码才能注册
                  </p>
                )}
              </>
            ) : (
              isLogin ? (
                <p className="text-muted-foreground text-xs">
                  系统当前已关闭用户注册
                </p>
              ) : (
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  disabled={isLoading}
                >
                  返回登录
                </Button>
              )
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
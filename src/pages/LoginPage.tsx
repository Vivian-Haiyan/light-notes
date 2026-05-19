import { useState, useEffect } from 'react';
import { MailOutlined, LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Input, Button, Segmented, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useUserStore } from '../store/useUserStore';

type AuthMode = 'password' | 'otp';

const getAuthErrorMessage = (error: unknown, fallback: string) => {
  const messageText = error instanceof Error ? error.message : '';

  if (messageText.includes('Anonymous sign-ins are disabled')) {
    return '当前项目还未开启访客登录，请先在 Supabase 中启用匿名登录';
  }

  if (
    messageText.includes('over_email_send_rate_limit') ||
    messageText.includes('email rate limit exceeded')
  ) {
    return '邮件发送过于频繁，请稍后再试';
  }

  return messageText || fallback;
};

const LoginPage = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    signIn,
    signUp,
    signInAsGuest,
    sendEmailOtp,
    verifyEmailOtp,
    isLoggedIn
  } = useUserStore();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/books');
    }
  }, [isLoggedIn, navigate]);

  const handleEmailSubmit = async () => {
    if (!email || !password) {
      message.warning('请输入邮箱和密码');
      return;
    }

    try {
      setLoading(true);
      if (isLogin) {
        await signIn(email, password);
        message.success('登录成功');
      } else {
        const signedIn = await signUp(email, password, email.split('@')[0]);
        if (!signedIn) {
          message.success('注册成功，请先完成邮箱验证后再登录');
          setIsLogin(true);
          return;
        }
        message.success('注册成功');
      }
      navigate('/books');
    } catch (error) {
      message.error(getAuthErrorMessage(error, '操作失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail.trim()) {
      message.warning('请输入邮箱');
      return;
    }

    try {
      setLoading(true);
      await sendEmailOtp(otpEmail.trim());
      setOtpSent(true);
      message.success('验证码已发送，请到邮箱中查收');
    } catch (error) {
      message.error(getAuthErrorMessage(error, '验证码发送失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpEmail.trim() || !otpCode.trim()) {
      message.warning('请输入邮箱和验证码');
      return;
    }

    try {
      setLoading(true);
      await verifyEmailOtp(otpEmail.trim(), otpCode.trim());
      message.success('登录成功');
      navigate('/books');
    } catch (error) {
      message.error(getAuthErrorMessage(error, '验证码校验失败'));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      await signInAsGuest();
      message.success('已进入访客模式');
      navigate('/books');
    } catch (error) {
      message.error(getAuthErrorMessage(error, '访客登录失败'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundImage: 'url(/image/1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(245, 245, 233, 0.45) 0%, rgba(227, 242, 253, 0.28) 100%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      <div
        style={{
          width: '420px',
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(18px)',
          borderRadius: '20px',
          padding: '42px 48px 40px',
          boxShadow: '0 20px 60px rgba(107, 142, 107, 0.15)',
          border: '1px solid rgba(255,255,255,0.7)',
          position: 'relative',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Logo size="large" />
          <p style={{ color: '#9E9E9E', marginTop: '12px' }}>在光影与文字之间，收藏每一次阅读心动</p>
        </div>

        <Segmented
          block
          value={authMode}
          onChange={(value) => setAuthMode(value as AuthMode)}
          options={[
            { label: '密码登录', value: 'password' },
            { label: '验证码登录', value: 'otp' }
          ]}
          style={{ marginBottom: '20px' }}
        />

        {authMode === 'password' ? (
          <>
            <Input
              placeholder="邮箱"
              prefix={<MailOutlined />}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={{ height: '48px', marginBottom: '16px' }}
            />
            <Input.Password
              placeholder="密码"
              prefix={<LockOutlined />}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={{ height: '48px', marginBottom: '20px' }}
            />
            <Button type="primary" block size="large" onClick={handleEmailSubmit} loading={loading} style={{ height: '48px' }}>
              {isLogin ? '登录' : '注册'}
            </Button>
            <Button block size="large" onClick={() => setIsLogin(!isLogin)} style={{ height: '48px', marginTop: '12px' }}>
              {isLogin ? '创建账号' : '已有账号，返回登录'}
            </Button>
          </>
        ) : (
          <>
            <Input
              placeholder="邮箱"
              prefix={<SafetyCertificateOutlined />}
              value={otpEmail}
              onChange={(event) => setOtpEmail(event.target.value)}
              style={{ height: '48px', marginBottom: '16px' }}
            />
            <Input
              placeholder="邮箱验证码"
              prefix={<MailOutlined />}
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
              style={{ height: '48px', marginBottom: '16px' }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                block
                size="large"
                onClick={handleSendOtp}
                loading={loading}
                style={{ height: '48px' }}
              >
                {otpSent ? '重新发送' : '发送验证码'}
              </Button>
              <Button
                type="primary"
                block
                size="large"
                onClick={handleVerifyOtp}
                loading={loading}
                style={{ height: '48px' }}
              >
                验证并登录
              </Button>
            </div>
            {otpSent && (
              <p style={{ margin: '12px 0 0', color: '#7A7A7A', fontSize: '13px', textAlign: 'center' }}>
                已发送验证码，请在邮箱中查收
              </p>
            )}
          </>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0 16px' }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
          <span style={{ color: '#9E9E9E', fontSize: '13px' }}>或者</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.08)' }} />
        </div>

        <Button
          block
          size="large"
          icon={<UserOutlined />}
          onClick={handleGuestLogin}
          loading={loading}
          style={{ height: '48px' }}
        >
          访客体验
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

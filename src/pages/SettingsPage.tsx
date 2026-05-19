import { useState, useEffect } from 'react';
import { InfoOutlined, CheckOutlined, TagOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { Card, Button, message, Popconfirm, Radio } from 'antd';
import type { RadioChangeEvent } from 'antd';
import { setThemeColor, getThemeColor, type ThemeColor } from '../utils/backgroundManager';
import { supabase } from '../lib/supabase';
import { requireUserId } from '../lib/currentUser';

interface ThemeConfig {
  id: ThemeColor;
  name: string;
  primary: string;
  secondary: string;
  gradient: string;
  previewImage?: string;
}

const themes: ThemeConfig[] = [
  {
    id: '森绿',
    name: '森绿',
    primary: '#66BB6A',
    secondary: '#43A047',
    gradient: 'linear-gradient(135deg, #81C784 0%, #66BB6A 100%)',
    previewImage: '/image/1.jpg'
  },
  {
    id: '海蓝',
    name: '海蓝',
    primary: '#42A5F5',
    secondary: '#1E88E5',
    gradient: 'linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%)',
    previewImage: '/image/海蓝.png'
  },
  {
    id: '暖橙',
    name: '暖橙',
    primary: '#FFA726',
    secondary: '#FB8C00',
    gradient: 'linear-gradient(135deg, #FFB74D 0%, #FFA726 100%)',
    previewImage: '/image/暖橙.png'
  },
  {
    id: '薰衣草',
    name: '薰衣草',
    primary: '#AB47BC',
    secondary: '#8E24AA',
    gradient: 'linear-gradient(135deg, #BA68C8 0%, #AB47BC 100%)',
    previewImage: '/image/薰衣草.png'
  }
];

const SettingsPage = () => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeColor>('森绿');

  useEffect(() => {
    const savedTheme = getThemeColor();
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: ThemeColor) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.primary);
      document.documentElement.style.setProperty('--secondary-color', theme.secondary);
      document.documentElement.style.setProperty('--primary-gradient', theme.gradient);
    }
  };

  const handleThemeChange = (e: RadioChangeEvent) => {
    const themeId = e.target.value as ThemeColor;
    setSelectedTheme(themeId);
    applyTheme(themeId);
    setThemeColor(themeId);
    message.success('主题已更新，页面背景将随之变化');
  };

  const handleResetData = async () => {
    try {
      const userId = await requireUserId();
      await Promise.all([
        supabase.from('card_appearances').delete().eq('user_id', userId),
        supabase.from('deleted_notes').delete().eq('user_id', userId),
        supabase.from('deleted_books').delete().eq('user_id', userId),
        supabase.from('collection_books').delete().eq('user_id', userId),
        supabase.from('reading_plans').delete().eq('user_id', userId),
        supabase.from('notes').delete().eq('user_id', userId),
        supabase.from('collections').delete().eq('user_id', userId),
        supabase.from('books').delete().eq('user_id', userId)
      ]);
      message.success('数据已重置');
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '重置失败');
    }
  };

  return (
    <div
      style={{ padding: '40px' }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <Card 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(129, 199, 132, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TagOutlined style={{ fontSize: '20px', color: '#66BB6A' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                color: '#424242'
              }}>主题颜色</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#9E9E9E' }}>
                选择您喜欢的主题配色，背景将随之变化
              </p>
            </div>
          </div>

          <Radio.Group
            value={selectedTheme}
            onChange={handleThemeChange}
            optionType="button"
            buttonStyle="solid"
            style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}
          >
            {themes.map(theme => (
              <Radio.Button 
                key={theme.id} 
                value={theme.id}
                style={{
                  borderRadius: '12px',
                  height: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  padding: '0 28px',
                  border: 'none',
                  background: selectedTheme === theme.id ? theme.gradient : '#FAFAFA',
                  color: selectedTheme === theme.id ? 'white' : '#616161',
                  boxShadow: selectedTheme === theme.id ? `0 4px 12px ${theme.primary}40` : 'none',
                  minWidth: '80px',
                  textAlign: 'center',
                  fontSize: '15px',
                  fontWeight: '500'
                }}
              >
                {theme.name}
              </Radio.Button>
            ))}
          </Radio.Group>

        </Card>

        <Card 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
            marginBottom: '24px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(244, 67, 54, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DeleteOutlined style={{ fontSize: '20px', color: '#F44336' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                color: '#424242'
              }}>重置数据</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#9E9E9E' }}>
                清空所有书籍、笔记和用户数据
              </p>
            </div>
          </div>

          <Popconfirm
            title="确定要重置所有数据吗？"
            description="此操作将清空您的所有书籍、笔记和用户信息，且无法恢复。"
            okText="确定重置"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={handleResetData}
          >
            <Button 
              type="primary" 
              danger
              icon={<SettingOutlined />}
              style={{ borderRadius: '12px' }}
            >
              重置所有数据
            </Button>
          </Popconfirm>
        </Card>

        <Card 
          style={{ 
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(66, 165, 245, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <InfoOutlined style={{ fontSize: '20px', color: '#42A5F5' }} />
            </div>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: '600',
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                color: '#424242'
              }}>关于拾光札记</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#9E9E9E' }}>
                记录阅读时光，珍藏文字感动
              </p>
            </div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(129, 199, 132, 0.05)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #C8E6C9 0%, #E3F2FD 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '24px' }}>📚</span>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', fontFamily: "'Playfair Display', serif", color: '#2E7D32' }}>
                  拾光札记
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#616161' }}>
                  Version 1.0
                </p>
              </div>
            </div>

            <p style={{ color: '#616161', lineHeight: '1.8', margin: 0 }}>
              拾光札记是一款简洁优雅的读书笔记应用，帮助您记录阅读心得、整理书摘卡片、管理阅读计划。
              在这里，每一次阅读都是一次心灵的旅行，每一段文字都是一份珍贵的记忆。
            </p>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(107, 142, 107, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9E9E9E', fontSize: '14px' }}>
                <CheckOutlined style={{ color: '#66BB6A', fontSize: '16px' }} />
                <span>数据云端同步，多端可用</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9E9E9E', fontSize: '14px', marginTop: '8px' }}>
                <CheckOutlined style={{ color: '#66BB6A', fontSize: '16px' }} />
                <span>支持 Markdown 格式笔记</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9E9E9E', fontSize: '14px', marginTop: '8px' }}>
                <CheckOutlined style={{ color: '#66BB6A', fontSize: '16px' }} />
                <span>多主题配色，随心切换</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

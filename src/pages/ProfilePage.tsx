import { useState, useRef } from 'react';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  BookOutlined,
  FileTextOutlined,
  EditOutlined,
  CheckOutlined,
  XOutlined
} from '@ant-design/icons';
import { Card, Button, message, Skeleton } from 'antd';
import { useUserStore } from '../store/useUserStore';
import { getBooks } from '../data/books';
import { getNotes } from '../data/notes';
import { uploadAvatarFile } from '../lib/storage';
import { useCachedFetch } from '../hooks/useCachedFetch';

interface ProfileData {
  booksCount: number;
  notesCount: number;
}

const ProfilePage = () => {
  const { user, updateNickname, updateAvatar } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editNickname, setEditNickname] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProfileData = async (): Promise<ProfileData> => {
    const [books, notes] = await Promise.all([getBooks(), getNotes()]);
    return {
      booksCount: books.length,
      notesCount: notes.length
    };
  };

  const { data: profileData, loading } = useCachedFetch<ProfileData>(
    'profile',
    fetchProfileData
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const { path } = await uploadAvatarFile(file);
      await updateAvatar(path);
      message.success('头像更新成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '头像上传失败');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleSaveNickname = async () => {
    if (!editNickname.trim()) return;
    try {
      await updateNickname(editNickname.trim());
      setIsEditing(false);
      message.success('昵称更新成功');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '昵称更新失败');
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const renderSkeleton = () => (
    <div style={{ padding: '40px' }}>
      <Card style={{
        maxWidth: '800px',
        margin: '0 auto',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #C8E6C9 0%, #E3F2FD 100%)',
            margin: '0 auto 24px'
          }} />
          <Skeleton.Input style={{ width: 200, margin: '0 auto', display: 'block' }} active />
          <Skeleton paragraph={{ rows: 1, width: 150 }} active style={{ margin: '16px auto 0' }} />
        </div>
        <div style={{ borderTop: '1px solid rgba(107, 142, 107, 0.1)', paddingTop: '24px' }}>
          <Skeleton title={{ width: 100 }} paragraph={false} active />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
            {[1, 2, 3].map(i => (
              <Card key={i} style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Skeleton.Avatar style={{ background: 'rgba(129, 199, 132, 0.1)' }} active />
                  <div style={{ flex: 1 }}>
                    <Skeleton paragraph={{ rows: 2, width: [60, 80] }} active />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#9E9E9E' }}>请先登录</p>
      </div>
    );
  }

  if (loading && !profileData) {
    return renderSkeleton();
  }

  const statsCards = [
    { icon: <BookOutlined style={{ fontSize: '28px', color: '#81C784' }} />, label: '总书籍数', value: profileData?.booksCount || 0 },
    { icon: <FileTextOutlined style={{ fontSize: '28px', color: '#42A5F5' }} />, label: '阅读笔记', value: profileData?.notesCount || 0 },
    { icon: <CalendarOutlined style={{ fontSize: '28px', color: '#FFA726' }} />, label: '注册时间', value: formatDate(user.createdAt) }
  ];

  return (
    <div style={{ padding: '40px' }}>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      <Card style={{
        maxWidth: '800px',
        margin: '0 auto',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(107, 142, 107, 0.1)'
      }}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: user.avatar ? `url(${user.avatar})` : 'linear-gradient(135deg, #C8E6C9 0%, #E3F2FD 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadingAvatar ? 'wait' : 'pointer',
              position: 'relative',
              boxShadow: '0 4px 20px rgba(129, 199, 132, 0.3)'
            }}
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          >
            {!user.avatar && <UserOutlined style={{ fontSize: '64px', color: '#6B8E6B' }} />}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#81C784',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 2px 8px rgba(129, 199, 132, 0.5)'
              }}
            >
              <EditOutlined style={{ fontSize: '16px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            {isEditing ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <input
                  type="text"
                  value={editNickname}
                  onChange={(event) => setEditNickname(event.target.value)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid #81C784',
                    fontSize: '24px',
                    fontWeight: '600',
                    textAlign: 'center',
                    width: '200px',
                    fontFamily: "'Playfair Display', serif"
                  }}
                  autoFocus
                />
                <Button type="text" icon={<CheckOutlined />} onClick={handleSaveNickname} style={{ color: '#81C784' }} />
                <Button
                  type="text"
                  icon={<XOutlined />}
                  onClick={() => {
                    setIsEditing(false);
                    setEditNickname('');
                  }}
                  style={{ color: '#9E9E9E' }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '600', margin: 0, color: '#2E7D32' }}>{user.nickname}</h1>
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setEditNickname(user.nickname);
                    setIsEditing(true);
                  }}
                  style={{ color: '#9E9E9E', padding: '4px' }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#9E9E9E' }}>
            <MailOutlined style={{ fontSize: '16px' }} />
            <span>{user.email}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(107, 142, 107, 0.1)', paddingTop: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0', color: '#424242' }}>阅读统计</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {statsCards.map((card) => (
              <Card key={card.label} style={{ borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      background: 'rgba(129, 199, 132, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', color: '#9E9E9E' }}>{card.label}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: '600', color: '#424242' }}>{card.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

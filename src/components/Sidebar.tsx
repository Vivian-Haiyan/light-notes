import { 
  BookOutlined, 
  BulbOutlined, 
  CalendarOutlined,
  CiOutlined,
  TagOutlined,
  BarChartOutlined,
  DashOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Menu, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useUserStore } from '../store/useUserStore';
import { useTheme } from '../hooks/useBackground';
import { themeSidebarPalettes } from '../utils/backgroundManager';
import { useMemo } from 'react';

type MenuItem = Required<MenuProps>['items'][number];

const menuItems: MenuItem[] = [
  {
    key: '/books',
    icon: <BookOutlined />,
    label: '我的书架',
  },
  {
    key: '/inspirations',
    icon: <BulbOutlined />,
    label: '灵感集锦',
  },
  {
    key: '/reading-plans',
    icon: <CalendarOutlined />,
    label: '阅读计划',
  },
  {
    key: '/collections',
    icon: <CiOutlined />,
    label: '书单收藏',
  },
  {
    key: '/tags',
    icon: <TagOutlined />,
    label: '标签管理',
  },
  {
    key: '/stats',
    icon: <BarChartOutlined />,
    label: '数据统计',
  },
  {
    key: '/trash',
    icon: <DashOutlined />,
    label: '回收站',
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useUserStore();
  const { theme } = useTheme();
  const palette = themeSidebarPalettes[theme];
  
  const currentKey = useMemo(() => {
    return location.pathname.startsWith('/books') ? '/books' : 
           location.pathname.startsWith('/notes') ? '/notes' :
           location.pathname.startsWith('/search') ? '/books' :
           location.pathname;
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
  };

  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        logout();
        message.success('已退出登录');
        navigate('/login');
        break;
    }
  };

  const userMenuItems: MenuItem[] = [
    {
      key: 'profile',
      icon: <UserSwitchOutlined />,
      label: '个人主页',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const handleGuestClick = () => {
    navigate('/login');
  };

  return (
    <aside className="themed-sidebar" style={{
      width: '220px',
      minWidth: '220px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      flexShrink: 0,
      background: palette.background,
      borderRight: `1px solid ${palette.border}`,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      ['--sidebar-selected-bg' as any]: palette.selected,
      ['--sidebar-accent-color' as any]: palette.accent,
      ['--sidebar-hover-bg' as any]: palette.hover,
    }}>
      <style>
        {`
          .themed-sidebar .ant-menu-item-selected {
            background: var(--sidebar-selected-bg) !important;
            color: var(--sidebar-accent-color) !important;
          }

          .themed-sidebar .ant-menu-item-selected .ant-menu-item-icon,
          .themed-sidebar .ant-menu-item:hover,
          .themed-sidebar .ant-menu-item:hover .ant-menu-item-icon {
            color: var(--sidebar-accent-color) !important;
          }

          .themed-sidebar .ant-menu-item:hover {
            background: var(--sidebar-hover-bg) !important;
          }
        `}
      </style>
      <div style={{
        padding: '20px 16px',
        borderBottom: `1px solid ${palette.border}`,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Logo size="small" />
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <Menu
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 'none',
            background: 'transparent',
            padding: '16px 0'
          }}
          inlineCollapsed={false}
        />
      </div>

      <div style={{
        paddingTop: '12px',
        borderTop: `1px solid ${palette.border}`
      }}>
        {isLoggedIn && user ? (
          <Dropdown
            menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
            placement="bottomRight"
          >
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              borderRadius: '12px',
              margin: '0 8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = palette.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: user.avatar 
                  ? `url(${user.avatar})` 
                  : 'linear-gradient(135deg, #C8E6C9 0%, #E3F2FD 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!user.avatar && <UserOutlined style={{ fontSize: '16px', color: '#6B8E6B' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#424242',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.nickname || '拾光读者'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9E9E9E' }}>
                  {user.email?.split('@')[0]}
                </p>
              </div>
              <DownOutlined style={{ fontSize: '14px', color: '#9E9E9E' }} />
            </div>
          </Dropdown>
        ) : (
          <div 
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'background 0.2s',
              borderRadius: '12px',
              margin: '0 8px'
            }}
            onClick={handleGuestClick}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #E0E0E0 0%, #F5F5F5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <UserOutlined style={{ fontSize: '16px', color: '#BDBDBD' }} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#9E9E9E' }}>
                未登录
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#BDBDBD' }}>点击登录</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

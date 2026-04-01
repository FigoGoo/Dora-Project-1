import React from 'react';
import { Layout, Button, Dropdown, MenuProps, message, Tooltip } from 'antd';
import {
  ProjectOutlined,
  SettingOutlined,
  LoginOutlined,
  MenuOutlined,
  PlusOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles, animationStyles } from '../theme';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onToggleSidebar }) => {
  const { projects, currentProject, setCurrentProject, setError, saveProject } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  // 项目切换菜单
  const projectMenuItems: MenuProps['items'] = projects.map((project) => ({
    key: project.id,
    label: project.name || `项目 ${project.id.slice(-4)}`,
    icon: project.id === currentProject?.id ? <span style={{ color: colors.primary }}>✓</span> : null,
    onClick: () => setCurrentProject(project),
  }));

  // 保存项目
  const handleSaveProject = () => {
    try {
      saveProject();
      messageApi.success('项目已保存 ✨');
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      {contextHolder}
      <AntHeader
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 32px',
          height: '72px',
          background: 'rgba(18, 18, 26, 0.9)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: `1px solid ${colors.borderLight}`,
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 顶部光晕装饰 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '2px',
          background: gradientStyles.primary,
          backgroundSize: '200% 200%',
          animation: 'gradientMove 4s ease infinite',
          opacity: 0.6,
        }} />

        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <Tooltip title={sidebarCollapsed ? '展开菜单' : '收起菜单'}>
            <MenuOutlined
              style={{
                fontSize: '24px',
                color: colors.textPrimary,
                marginRight: '16px',
                cursor: 'pointer',
                transition: `all ${animationStyles.fast}`,
                padding: '8px',
                borderRadius: '10px',
              }}
              onClick={onToggleSidebar}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.primaryLight;
                e.currentTarget.style.backgroundColor = 'rgba(107, 63, 160, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.textPrimary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
          </Tooltip>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            position: 'relative',
          }}>
            <span style={{
              marginRight: '12px',
              fontSize: '32px',
              animation: 'floatSlow 4s ease-in-out infinite',
              display: 'inline-block',
            }}>🎁</span>
            <span style={{
              background: gradientStyles.primary,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientMove 6s ease infinite',
              textShadow: '0 0 30px rgba(107, 63, 160, 0.3)',
            }}>
              Dora 魔盒
            </span>
            <span style={{
              marginLeft: '8px',
              fontSize: '14px',
              color: colors.textMuted,
              fontWeight: 400,
              background: 'rgba(107, 63, 160, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid rgba(107, 63, 160, 0.2)',
            }}>
              AI视频生成
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
          <Tooltip title="视频教程">
            <Button
              icon={<PlayCircleOutlined />}
              style={{
                background: 'transparent',
                borderColor: colors.border,
                color: colors.textSecondary,
                height: '44px',
                padding: '0 16px',
                borderRadius: '12px',
                transition: `all ${animationStyles.fast}`,
              }}
              onClick={() => navigate('/tutorials')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.textPrimary;
                e.currentTarget.style.backgroundColor = 'rgba(107, 63, 160, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textSecondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              视频教程
            </Button>
          </Tooltip>

          <Dropdown
            menu={{
              items: [
                {
                  key: 'new',
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PlusOutlined />
                      <span>新建项目</span>
                    </span>
                  ),
                  onClick: () => messageApi.info('新建项目功能开发中...'),
                },
                { type: 'divider' },
                ...projectMenuItems,
                { type: 'divider' },
                {
                  key: 'manage',
                  label: '项目管理',
                  onClick: () => messageApi.info('项目管理功能开发中...'),
                },
              ],
              title: '项目列表',
            }}
            placement="bottomRight"
          >
            <Button
              icon={<ProjectOutlined />}
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
                color: colors.textPrimary,
                height: '44px',
                padding: '0 20px',
                borderRadius: '12px',
                transition: `all ${animationStyles.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgCard;
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = shadowStyles.purpleSoft;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgTertiary;
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {currentProject?.name || '项目列表'}
            </Button>
          </Dropdown>

          <Tooltip title="设置">
            <Button
              icon={<SettingOutlined />}
              style={{
                background: 'transparent',
                borderColor: colors.border,
                color: colors.textSecondary,
                height: '44px',
                width: '44px',
                padding: 0,
                borderRadius: '12px',
                transition: `all ${animationStyles.fast}`,
              }}
              onClick={() => messageApi.info('设置功能开发中...')}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.color = colors.textPrimary;
                e.currentTarget.style.backgroundColor = 'rgba(107, 63, 160, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.color = colors.textSecondary;
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
          </Tooltip>

          {currentProject && (
            <Button
              type="primary"
              onClick={handleSaveProject}
              style={{
                background: gradientStyles.primary,
                backgroundSize: '200% 200%',
                border: 'none',
                height: '44px',
                padding: '0 24px',
                borderRadius: '12px',
                fontWeight: 500,
                transition: `all ${animationStyles.fast}`,
                animation: 'gradientMove 6s ease infinite',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = shadowStyles.buttonHover;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              保存项目
            </Button>
          )}

          <Button
            icon={<LoginOutlined />}
            style={{
              background: gradientStyles.purple,
              border: 'none',
              color: colors.textPrimary,
              height: '44px',
              padding: '0 24px',
              borderRadius: '12px',
              transition: `all ${animationStyles.fast}`,
            }}
            onClick={() => messageApi.info('登录功能开发中...')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = shadowStyles.purpleSoft;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            登录
          </Button>
        </div>
      </AntHeader>
    </>
  );
};

export default Header;

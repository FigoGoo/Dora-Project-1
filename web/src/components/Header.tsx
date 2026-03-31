import React from 'react';
import { Layout, Button, Dropdown, MenuProps, message } from 'antd';
import {
  ProjectOutlined,
  SettingOutlined,
  LoginOutlined,
  MenuOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Header: AntHeader } = Layout;

const Header: React.FC = () => {
  const { projects, currentProject, setCurrentProject, setError, saveProject } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();

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
      messageApi.success('项目已保存');
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
          background: 'rgba(18, 18, 26, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${colors.borderLight}`,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MenuOutlined
            style={{
              fontSize: '24px',
              color: colors.textPrimary,
              marginRight: '16px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
            onClick={() => messageApi.info('侧边栏功能开发中...')}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryLight;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.textPrimary;
            }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: colors.textPrimary,
            fontSize: '24px',
            fontWeight: 700,
            background: gradientStyles.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>
            <span style={{
              marginRight: '12px',
              fontSize: '32px',
              WebkitTextFillColor: 'initial',
            }}>🎁</span>
            Dora 魔盒
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'new',
                  label: '新建项目',
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
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgCard;
                e.currentTarget.style.borderColor = colors.primary;
                e.currentTarget.style.boxShadow = shadowStyles.purple;
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

          <Button
            icon={<SettingOutlined />}
            style={{
              background: 'transparent',
              borderColor: colors.border,
              color: colors.textSecondary,
              height: '44px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
            }}
            onClick={() => messageApi.info('设置功能开发中...')}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = colors.primary;
              e.currentTarget.style.color = colors.textPrimary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = colors.border;
              e.currentTarget.style.color = colors.textSecondary;
            }}
          >
            设置
          </Button>

          {currentProject && (
            <Button
              type="primary"
              onClick={handleSaveProject}
              style={{
                background: gradientStyles.primary,
                border: 'none',
                height: '44px',
                padding: '0 24px',
                borderRadius: '12px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = shadowStyles.purple;
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
              transition: 'all 0.2s ease',
            }}
            onClick={() => messageApi.info('登录功能开发中...')}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = shadowStyles.purple;
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

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Modal, Input, Space, Tooltip, Badge } from 'antd';
import {
  HomeOutlined,
  BulbOutlined,
  FileTextOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  SendOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

const Sidebar: React.FC<{ collapsed: boolean; onCollapse: (collapsed: boolean) => void }> = ({
  collapsed,
  onCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject, projects, createProject, updateProject, deleteProject, setCurrentProject } = useAppStore();
  const [projectModalVisible, setProjectModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
  const [newProjectName, setNewProjectName] = useState('');

  // 导航菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined style={{ fontSize: '18px' }} />,
      label: '工作台',
    },
    {
      key: '/inspiration',
      icon: <BulbOutlined style={{ fontSize: '18px' }} />,
      label: '灵感输入',
      disabled: !currentProject,
    },
    {
      key: '/script-editor',
      icon: <FileTextOutlined style={{ fontSize: '18px' }} />,
      label: '剧本编辑',
      disabled: !currentProject,
    },
    {
      key: '/storyboard',
      icon: <PictureOutlined style={{ fontSize: '18px' }} />,
      label: '分镜设计',
      disabled: !currentProject,
    },
    {
      key: '/image-editor',
      icon: <PictureOutlined style={{ fontSize: '18px' }} />,
      label: '画面绘制',
      disabled: !currentProject,
    },
    {
      key: '/video-editor',
      icon: <VideoCameraOutlined style={{ fontSize: '18px' }} />,
      label: '视频生成',
      disabled: !currentProject,
    },
    {
      key: '/publish',
      icon: <SendOutlined style={{ fontSize: '18px' }} />,
      label: '发布导出',
      disabled: !currentProject,
    },
  ];

  // 项目状态指示器
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string; emoji: string }> = {
      draft: { color: 'rgba(158, 158, 158, 0.3)', text: '草稿', emoji: '📝' },
      inspiration: { color: 'rgba(255, 193, 7, 0.3)', text: '灵感', emoji: '💡' },
      script: { color: 'rgba(107, 63, 160, 0.3)', text: '剧本', emoji: '📖' },
      storyboard: { color: 'rgba(0, 212, 255, 0.3)', text: '分镜', emoji: '🎨' },
      image: { color: 'rgba(82, 196, 26, 0.3)', text: '图像', emoji: '🖼️' },
      video: { color: 'rgba(255, 87, 34, 0.3)', text: '视频', emoji: '🎬' },
      completed: { color: 'rgba(76, 175, 80, 0.3)', text: '完成', emoji: '✅' },
      published: { color: 'rgba(33, 150, 243, 0.3)', text: '已发布', emoji: '🚀' },
    };
    return statusMap[status] || { color: 'rgba(158, 158, 158, 0.3)', text: '未知', emoji: '❓' };
  };

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  // 处理创建新项目
  const handleCreateProject = () => {
    setEditingProject(null);
    setNewProjectName('');
    setProjectModalVisible(true);
  };

  // 处理编辑项目
  const handleEditProject = (project: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject({ id: project.id, name: project.name || `项目 ${project.id.slice(-4)}` });
    setNewProjectName(project.name || `项目 ${project.id.slice(-4)}`);
    setProjectModalVisible(true);
  };

  // 处理删除项目
  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    Modal.confirm({
      title: '确认删除项目',
      content: '确定要删除这个项目吗？此操作不可撤销。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => {
        deleteProject(projectId);
      },
    });
  };

  // 保存项目
  const handleSaveProject = () => {
    if (!newProjectName.trim()) {
      return;
    }

    if (editingProject) {
      // 编辑现有项目
      updateProject(editingProject.id, { name: newProjectName });
    } else {
      // 创建新项目
      const project = createProject();
      updateProject(project.id, { name: newProjectName });
    }

    setProjectModalVisible(false);
    setEditingProject(null);
    setNewProjectName('');
  };

  return (
    <div
      style={{
        width: collapsed ? 80 : 280,
        height: '100vh',
        background: colors.bgCard,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        boxShadow: shadowStyles.card,
      }}
    >
      {/* Logo 区域 */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: `1px solid ${colors.borderLight}`,
          background: 'linear-gradient(135deg, rgba(107, 63, 160, 0.1) 0%, rgba(0, 0, 0, 0) 100%)',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: gradientStyles.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            animation: 'floatSlow 4s ease-in-out infinite',
          }}
        >
          🎁
        </div>
        {!collapsed && (
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                background: gradientStyles.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Dora 魔盒
            </div>
            <div
              style={{
                fontSize: 11,
                color: colors.textMuted,
              }}
            >
              AI 视频创作平台
            </div>
          </div>
        )}
      </div>

      {/* 导航菜单 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            border: 'none',
          }}
          inlineCollapsed={collapsed}
        />
      </div>

      {/* 项目列表 */}
      {!collapsed && (
        <div
          style={{
            borderTop: `1px solid ${colors.borderLight}`,
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: colors.textSecondary,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}
            >
              我的项目
            </span>
            <Tooltip title="新建项目">
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleCreateProject}
                style={{ color: colors.textSecondary }}
              />
            </Tooltip>
          </div>

          {projects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 12px',
                color: colors.textMuted,
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
              <div style={{ fontSize: '12px' }}>暂无项目</div>
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleCreateProject}
                style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: colors.primary,
                }}
              >
                创建第一个项目
              </Button>
            </div>
          ) : (
            projects.map((project) => {
              const status = getStatusBadge(project.status);
              const isActive = currentProject?.id === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => setCurrentProject(project)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'rgba(107, 63, 160, 0.15)' : 'transparent',
                    border: isActive ? `1px solid ${colors.primary}` : `1px solid transparent`,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = colors.bgTertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: status.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {status.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: isActive ? 600 : 500,
                          fontSize: '13px',
                          color: isActive ? colors.primary : colors.textPrimary,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {project.name || `项目 ${project.id.slice(-4)}`}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '4px',
                        }}
                      >
                        <Badge
                          status={isActive ? 'processing' : 'default'}
                          text={
                            <span style={{ fontSize: '11px', color: colors.textMuted }}>
                              {status.text}
                            </span>
                          }
                        />
                        <span
                          style={{
                            fontSize: '10px',
                            color: colors.textMuted,
                          }}
                        >
                          <ClockCircleOutlined style={{ marginRight: '2px' }} />
                          {new Date(project.updatedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                    </div>
                    <Space size="small">
                      <Tooltip title="重命名">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => handleEditProject(project, e)}
                          style={{
                            fontSize: '12px',
                            color: colors.textMuted,
                            padding: '4px',
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="删除">
                        <Button
                          type="text"
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          style={{
                            fontSize: '12px',
                            color: colors.textMuted,
                            padding: '4px',
                          }}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 收起/展开按钮 */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: `1px solid ${colors.borderLight}`,
          display: 'flex',
          justifyContent: collapsed ? 'center' : 'flex-end',
        }}
      >
        <Tooltip title={collapsed ? '展开侧边栏' : '收起侧边栏'}>
          <Button
            type="text"
            icon={<FolderOpenOutlined rotate={collapsed ? 0 : 180} />}
            onClick={() => onCollapse(!collapsed)}
            style={{ color: colors.textSecondary }}
          />
        </Tooltip>
      </div>

      {/* 项目编辑弹窗 */}
      <Modal
        title={
          <div style={{ color: colors.textPrimary }}>
            {editingProject ? '编辑项目' : '新建项目'}
          </div>
        }
        open={projectModalVisible}
        onOk={handleSaveProject}
        onCancel={() => {
          setProjectModalVisible(false);
          setEditingProject(null);
          setNewProjectName('');
        }}
        okText="保存"
        cancelText="取消"
        centered
        okButtonProps={{
          style: {
            background: gradientStyles.primary,
            border: 'none',
          },
        }}
        cancelButtonProps={{
          style: {
            background: colors.bgTertiary,
            borderColor: colors.border,
            color: colors.textPrimary,
          },
        }}
      >
        <div style={{ padding: '8px 0' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: colors.textPrimary, fontWeight: 500 }}>
            项目名称
          </label>
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="输入项目名称"
            autoFocus
            onPressEnter={handleSaveProject}
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Sidebar;

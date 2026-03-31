import React, { useState } from 'react';
import { Card, Button, Tag, List, Typography, Empty, Modal, Form, Input, Dropdown, MenuProps, message } from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { formatDate } from '../utils';
import { Project } from '../types';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, currentProject, createProject, setCurrentProject, updateProject, deleteProject } = useAppStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  const handleCreateProject = () => {
    const newProject = createProject();
    setCurrentProject(newProject);
    navigate('/inspiration');
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    // 根据项目状态导航到对应页面
    const statusPathMap: Record<string, string> = {
      inspiration: '/inspiration',
      script: '/script-editor',
      storyboard: '/storyboard',
      image: '/image-editor',
      video: '/video-editor',
      completed: '/publish',
      published: '/publish',
    };
    const path = statusPathMap[project.status] || '/inspiration';
    navigate(path);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    form.setFieldsValue({ name: project.name || '' });
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    form.validateFields()
      .then((values) => {
        if (selectedProject) {
          updateProject(selectedProject.id, { name: values.name });
          message.success('项目名称已更新');
          setEditModalVisible(false);
          setSelectedProject(null);
        }
      })
      .catch(() => {
        message.error('请输入有效的项目名称');
      });
  };

  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeleteModalVisible(true);
  };

  const confirmDeleteProject = () => {
    if (selectedProject) {
      deleteProject(selectedProject.id);
      message.success('项目已删除');
      setDeleteModalVisible(false);
      setSelectedProject(null);
    }
  };

  const getProjectMenuItems = (project: Project): MenuProps['items'] => [
    {
      key: 'open',
      icon: <FolderOpenOutlined />,
      label: '打开项目',
      onClick: () => handleOpenProject(project),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '重命名',
      onClick: () => handleEditProject(project),
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      danger: true,
      icon: <DeleteOutlined />,
      label: '删除项目',
      onClick: () => handleDeleteProject(project),
    },
  ];

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'inspiration':
        return <span>✨</span>;
      case 'script':
        return <span>📝</span>;
      case 'storyboard':
        return <span>🎬</span>;
      case 'image':
        return <span>🎨</span>;
      case 'video':
        return <span>🎥</span>;
      case 'completed':
        return <span>✅</span>;
      case 'published':
        return <span>🚀</span>;
      default:
        return <span>📁</span>;
    }
  };

  const getStatusTag = (status: Project['status']) => {
    const tagMap: Record<string, { bgColor: string; textColor: string; text: string }> = {
      inspiration: { bgColor: 'rgba(107, 63, 160, 0.2)', textColor: colors.primary, text: '灵感阶段' },
      script: { bgColor: 'rgba(107, 63, 160, 0.2)', textColor: colors.primary, text: '剧本阶段' },
      storyboard: { bgColor: 'rgba(0, 212, 255, 0.2)', textColor: colors.cyan, text: '分镜阶段' },
      image: { bgColor: 'rgba(255, 152, 0, 0.2)', textColor: colors.amber, text: '画面阶段' },
      video: { bgColor: 'rgba(233, 30, 140, 0.2)', textColor: colors.pink, text: '视频阶段' },
      completed: { bgColor: 'rgba(82, 196, 26, 0.2)', textColor: colors.success, text: '已完成' },
      published: { bgColor: 'rgba(82, 196, 26, 0.2)', textColor: colors.success, text: '已发布' },
    };
    const tag = tagMap[status] || { bgColor: 'rgba(107, 107, 128, 0.2)', textColor: colors.textSecondary, text: '草稿' };
    return (
      <Tag
        style={{
          background: tag.bgColor,
          color: tag.textColor,
          border: 'none',
          borderRadius: '8px',
        }}
      >
        {tag.text}
      </Tag>
    );
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 欢迎区域 */}
      <Card
        style={{
          marginBottom: '24px',
          background: colors.bgCard,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          boxShadow: shadowStyles.card,
        }}
        headStyle={{
          borderBottom: `1px solid ${colors.borderLight}`,
        }}
        bodyStyle={{
          padding: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0, color: colors.textPrimary }}>
              欢迎使用 Dora 魔盒 🎁
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: colors.textSecondary }}>
              输入灵感，一键生成精彩视频
            </Paragraph>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
            style={{
              height: '48px',
              padding: '0 32px',
              fontSize: '16px',
              background: gradientStyles.primary,
              border: 'none',
              borderRadius: '12px',
              fontWeight: 500,
            }}
          >
            创建新项目
          </Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📁</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary }}>
                {projects.length}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                全部项目
              </div>
            </div>
          </div>
        </Card>

        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>⏳</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary }}>
                {projects.filter(p => p.status !== 'completed' && p.status !== 'published').length}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                进行中
              </div>
            </div>
          </div>
        </Card>

        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary }}>
                {projects.filter(p => p.status === 'completed' || p.status === 'published').length}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                已完成
              </div>
            </div>
          </div>
        </Card>

        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>🎥</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.textPrimary }}>
                {projects.filter(p => p.finalVideo).length}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                视频输出
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 项目列表 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.textPrimary }}>
            <span style={{ fontSize: '24px' }}>📂</span>
            我的项目
          </div>
        }
        extra={
          <Button
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
              borderRadius: '12px',
            }}
          >
            新建项目
          </Button>
        }
        style={{
          background: colors.bgCard,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          boxShadow: shadowStyles.card,
        }}
        headStyle={{
          borderBottom: `1px solid ${colors.borderLight}`,
          padding: '24px 32px',
        }}
        bodyStyle={{
          padding: '32px',
        }}
      >
        {projects.length === 0 ? (
          <Empty
            image={<div style={{ fontSize: '64px' }}>🎁</div>}
            description={
              <span style={{ color: colors.textSecondary }}>
                还没有项目，开始你的第一个创作吧！
              </span>
            }
          >
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateProject}
              style={{
                background: gradientStyles.primary,
                border: 'none',
                borderRadius: '12px',
              }}
            >
              创建第一个项目
            </Button>
          </Empty>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            dataSource={[...projects].sort((a, b) => b.updatedAt - a.updatedAt)}
            renderItem={(project) => (
              <List.Item>
                <Card
                  hoverable
                  style={{
                    cursor: 'pointer',
                    background: colors.bgTertiary,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '16px',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => handleOpenProject(project)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = shadowStyles.purple;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  cover={
                    project.finalVideo ? (
                      <div style={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: gradientStyles.primary,
                        color: 'white',
                        fontSize: '48px',
                        borderRadius: '16px 16px 0 0',
                      }}>
                        ▶️
                      </div>
                    ) : (
                      <div style={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colors.bgSecondary,
                        fontSize: '48px',
                        borderRadius: '16px 16px 0 0',
                      }}>
                        {getStatusIcon(project.status)}
                      </div>
                    )
                  }
                  actions={[
                    <Dropdown
                      key="actions"
                      menu={{
                        items: getProjectMenuItems(project),
                        onClick: (e) => {
                          e.domEvent.stopPropagation();
                        },
                      }}
                    >
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        style={{
                          color: colors.textSecondary,
                          padding: '4px',
                          borderRadius: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      />
                    </Dropdown>,
                  ]}
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: colors.textPrimary }}>
                          {project.name || '未命名项目'}
                        </span>
                        {currentProject?.id === project.id && (
                          <Tag style={{ background: 'rgba(107, 63, 160, 0.3)', color: colors.primary }}>
                            当前
                          </Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {getStatusTag(project.status)}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                          <ClockCircleOutlined style={{ marginRight: '4px' }} />
                          {formatDate(project.updatedAt)}
                        </div>
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 编辑项目模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EditOutlined />
            重命名项目
          </div>
        }
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        okButtonProps={{
          style: {
            background: gradientStyles.primary,
            border: 'none',
            borderRadius: '12px',
          },
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input
              placeholder="请输入项目名称"
              style={{
                borderRadius: '12px',
                background: colors.bgSecondary,
                border: `1px solid ${colors.border}`,
              }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除项目确认模态框 */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.error }}>
            <DeleteOutlined />
            删除项目
          </div>
        }
        open={deleteModalVisible}
        onOk={confirmDeleteProject}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确认删除"
        cancelText="取消"
        okButtonProps={{
          danger: true,
          style: {
            borderRadius: '12px',
          },
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <p style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 500 }}>
            确定要删除项目「{selectedProject?.name || '未命名项目'}」吗？
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '14px', marginTop: '8px' }}>
            删除后无法恢复，所有内容将被永久删除。
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;

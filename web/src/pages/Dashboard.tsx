import React from 'react';
import { Card, Button, Tag, List, Typography, Empty } from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { formatDate } from '../utils';
import { Project } from '../types';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { projects, currentProject, createProject, setCurrentProject } = useAppStore();

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
    const tagMap: Record<string, { color: string; text: string }> = {
      inspiration: { color: 'blue', text: '灵感阶段' },
      script: { color: 'purple', text: '剧本阶段' },
      storyboard: { color: 'cyan', text: '分镜阶段' },
      image: { color: 'orange', text: '画面阶段' },
      video: { color: 'magenta', text: '视频阶段' },
      completed: { color: 'green', text: '已完成' },
      published: { color: 'success', text: '已发布' },
    };
    const tag = tagMap[status] || { color: 'default', text: '草稿' };
    return <Tag color={tag.color}>{tag.text}</Tag>;
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* 欢迎区域 */}
      <Card style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              欢迎使用 Dora 魔盒 🎁
            </Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#999' }}>
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
              background: 'linear-gradient(135deg, #6b3fa0 0%, #e91e8c 100%)',
              border: 'none',
            }}
          >
            创建新项目
          </Button>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>📁</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {projects.length}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                全部项目
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>⏳</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {projects.filter(p => p.status !== 'completed' && p.status !== 'published').length}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                进行中
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>✅</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {projects.filter(p => p.status === 'completed' || p.status === 'published').length}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                已完成
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>🎥</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                {projects.filter(p => p.finalVideo).length}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                视频输出
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 项目列表 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>📂</span>
            我的项目
          </div>
        }
        extra={
          <Button icon={<PlusOutlined />} onClick={handleCreateProject}>
            新建项目
          </Button>
        }
      >
        {projects.length === 0 ? (
          <Empty
            image={<div style={{ fontSize: '64px' }}>🎁</div>}
            description="还没有项目，开始你的第一个创作吧！"
          >
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateProject}
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
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleOpenProject(project)}
                  cover={
                    project.finalVideo ? (
                      <div style={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontSize: '48px',
                      }}>
                        ▶️
                      </div>
                    ) : (
                      <div style={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f5f5f5',
                        fontSize: '48px',
                      }}>
                        {getStatusIcon(project.status)}
                      </div>
                    )
                  }
                >
                  <Card.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {project.name || '未命名项目'}
                        {currentProject?.id === project.id && (
                          <Tag color="blue">当前</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          {getStatusTag(project.status)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#999' }}>
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
    </div>
  );
};

export default Dashboard;

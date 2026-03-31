import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Divider,
  message,
  List,
  Typography,
  Tag,
  Modal,
  Select,
} from 'antd';
import {
  LeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const PublishPage: React.FC = () => {
  const { currentProject } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();

  const project = currentProject;

  // 下载视频
  const handleDownload = async () => {
    if (!project?.finalVideo) {
      messageApi.warning('视频尚未生成');
      return;
    }

    try {
      await api.downloadFile(project.finalVideo, `${project.name || 'dora-video'}.mp4`);
      messageApi.success('下载已开始');
    } catch (error) {
      messageApi.error('下载失败');
    }
  };

  // 分享视频
  const handleShare = () => {
    Modal.info({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🔗</span>
          <span style={{ color: colors.textPrimary }}>分享视频</span>
        </div>
      ),
      content: (
        <div>
          <p style={{ color: colors.textSecondary, marginBottom: '12px' }}>分享链接：</p>
          <Input
            value="https://dora-box.com/video/12345"
            readOnly
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
            addonAfter={
              <Button
                size="small"
                style={{
                  background: gradientStyles.primary,
                  border: 'none',
                  color: colors.textPrimary,
                }}
              >
                复制
              </Button>
            }
          />
        </div>
      ),
      centered: true,
      okButtonProps: {
        style: {
          background: gradientStyles.primary,
          border: 'none',
        },
      },
    });
  };

  // 发布到平台
  const handlePublish = (platform: string) => {
    setIsPublishing(true);

    messageApi.loading({
      content: `正在发布到 ${platform}...`,
      duration: 2,
    });

    setTimeout(() => {
      setIsPublishing(false);
      messageApi.success(`已成功发布到 ${platform}！`);
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {contextHolder}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* 左侧：视频预览 */}
        <div>
          <Card
            title={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                fontWeight: 600,
                color: colors.textPrimary,
              }}>
                <span style={{ fontSize: '32px' }}>🎉</span>
                视频发布
              </div>
            }
            style={{
              marginBottom: '32px',
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
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                height: '400px',
                backgroundColor: '#000',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}>
                {project?.finalVideo ? (
                  <video
                    src={project.finalVideo}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <div style={{
                    color: colors.textMuted,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '80px', marginBottom: '16px' }}>🎬</div>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>视频预览</div>
                    <div style={{ fontSize: '14px', color: colors.textMuted }}>
                      视频拼接完成后将在此处显示
                    </div>
                  </div>
                )}
              </div>

              <Form layout="vertical">
                <Form.Item
                  label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视频标题</span>}
                >
                  <Input
                    size="large"
                    value={project?.name || '未命名视频'}
                    placeholder="输入视频标题"
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视频描述</span>}
                >
                  <TextArea
                    rows={4}
                    placeholder="描述一下你的视频..."
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>标签</span>}
                >
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="添加标签"
                    tokenSeparators={[',']}
                  />
                </Form.Item>

                <Form.Item>
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      disabled={!project?.finalVideo}
                      style={{
                        background: gradientStyles.primary,
                        border: 'none',
                        height: '48px',
                        padding: '0 28px',
                        borderRadius: '12px',
                        fontWeight: 500,
                      }}
                    >
                      下载视频
                    </Button>
                    <Button
                      size="large"
                      icon={<ShareAltOutlined />}
                      onClick={handleShare}
                      disabled={!project?.finalVideo}
                      style={{
                        background: colors.bgTertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        height: '48px',
                        padding: '0 24px',
                        borderRadius: '12px',
                      }}
                    >
                      分享
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </div>
          </Card>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          <Button
            icon={<LeftOutlined />}
            size="large"
            href="#/video"
            style={{
              background: 'transparent',
              borderColor: colors.border,
              color: colors.textSecondary,
              height: '48px',
              padding: '0 24px',
              borderRadius: '12px',
            }}
          >
            回到视频编辑器
          </Button>
        </div>

        {/* 右侧：发布设置 */}
        <div>
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>发布到平台</span>}
            style={{
              marginBottom: '32px',
              background: colors.bgCard,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.border}`,
              borderRadius: '20px',
              boxShadow: shadowStyles.card,
            }}
            headStyle={{
              borderBottom: `1px solid ${colors.borderLight}`,
              padding: '20px 24px',
            }}
            bodyStyle={{
              padding: '24px',
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={[
                { name: '抖音', icon: '🎵', color: '#000' },
                { name: 'Bilibili', icon: '📺', color: '#fb7299' },
                { name: '小红书', icon: '📕', color: '#ff2442' },
                { name: 'YouTube', icon: '🔴', color: '#ff0000' },
              ]}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: '16px',
                    background: colors.bgTertiary,
                    borderRadius: '12px',
                    marginBottom: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.bgSecondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.bgTertiary;
                  }}
                  actions={[
                    <Button
                      type="link"
                      onClick={() => handlePublish(item.name)}
                      disabled={!project?.finalVideo}
                      style={{
                        color: colors.primary,
                      }}
                    >
                      发布
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: item.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                        }}
                      >
                        {item.icon}
                      </div>
                    }
                    title={<span style={{ color: colors.textPrimary }}>{item.name}</span>}
                    description={<span style={{ color: colors.textSecondary }}>一键发布到该平台</span>}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>项目信息</span>}
            style={{
              marginBottom: '32px',
              background: colors.bgCard,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${colors.border}`,
              borderRadius: '20px',
              boxShadow: shadowStyles.card,
            }}
            headStyle={{
              borderBottom: `1px solid ${colors.borderLight}`,
              padding: '20px 24px',
            }}
            bodyStyle={{
              padding: '24px',
            }}
          >
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                marginBottom: '4px',
              }}>
                项目名称
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: colors.textPrimary,
              }}>
                {project?.name || '未命名项目'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                marginBottom: '4px',
              }}>
                创建时间
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.textPrimary,
              }}>
                {project?.createdAt
                  ? new Date(project.createdAt).toLocaleString('zh-CN')
                  : '-'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                marginBottom: '4px',
              }}>
                视频时长
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.textPrimary,
              }}>
                {project?.videos?.reduce((sum, v) => sum + v.duration, 0) || 0} 秒
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '12px',
                color: colors.textSecondary,
                marginBottom: '4px',
              }}>
                状态
              </div>
              <Tag
                color={colors.success}
                style={{ background: 'rgba(82, 196, 26, 0.2)' }}
              >
                已完成
              </Tag>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublishPage;

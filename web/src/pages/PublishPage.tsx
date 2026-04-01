import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Divider,
  message,
  List,
  Tag,
  Modal,
  Select,
  Tabs,
  Tooltip,
  Switch,
  Upload,
  Progress,
} from 'antd';
import ContextHelp from '../components/ContextHelp';
import {
  LeftOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  CloudUploadOutlined,
  SettingOutlined,
  QrcodeOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  DeleteOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

import { useAppStore } from '../store';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 社交媒体平台
const PLATFORMS = [
  { id: 'douyin', name: '抖音', icon: '🎵', color: '#fe2c55', active: true },
  { id: 'bilibili', name: 'Bilibili', icon: '📺', color: '#00a1d6', active: true },
  { id: 'xiaohongshu', name: '小红书', icon: '📕', color: '#ff2442', active: false },
  { id: 'youtube', name: 'YouTube', icon: '🔴', color: '#ff0000', active: false },
  { id: 'facebook', name: 'Facebook', icon: 'f', color: '#1877f2', active: false },
  { id: 'instagram', name: 'Instagram', icon: '📸', color: '#e4405f', active: false },
];

// 水印位置选项
const WATERMARK_POSITIONS = [
  { value: 'bottom-right', label: '右下角', icon: '↘️' },
  { value: 'bottom-left', label: '左下角', icon: '↙️' },
  { value: 'top-right', label: '右上角', icon: '↗️' },
  { value: 'top-left', label: '左上角', icon: '↖️' },
  { value: 'center', label: '中心', icon: '🎯' },
];

// 定时发布预设
const SCHEDULE_PRESETS = [
  { value: 'immediate', label: '立即发布' },
  { value: '1h', label: '1小时后' },
  { value: '6h', label: '6小时后' },
  { value: '12h', label: '12小时后' },
  { value: '24h', label: '明天此时' },
  { value: 'custom', label: '自定义时间' },
];

const PublishPage: React.FC = () => {
  const { currentProject } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [, setIsPublishing] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    platforms: [] as string[],
    watermark: true,
    watermarkText: 'Dora魔盒',
    watermarkPosition: 'bottom-right',
    schedule: 'immediate',
    scheduledTime: '',
  });
  const [activePlatforms, setActivePlatforms] = useState<string[]>(['douyin', 'bilibili']);
  const [publishProgress, setPublishProgress] = useState<Record<string, number>>({});
  const [publishStatus, setPublishStatus] = useState<Record<string, 'pending' | 'publishing' | 'success' | 'failed'>>({});
  const [isScheduling, setIsScheduling] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  const project = currentProject;

  // 初始化设置
  useEffect(() => {
    if (project) {
      setPublishSettings(prev => ({
        ...prev,
        title: project.name || '未命名视频',
        description: project.inspiration?.description || '',
      }));
    }
  }, [project]);

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
                  color: '#fff',
                }}
                onClick={() => {
                  navigator.clipboard.writeText('https://dora-box.com/video/12345');
                  messageApi.success('已复制到剪贴板');
                }}
              >
                复制
              </Button>
            }
          />
          <div style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
              扫码分享
            </span>
            <div style={{
              width: '80px',
              height: '80px',
              background: colors.bgTertiary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: colors.textMuted,
            }}>
              📱 二维码
            </div>
          </div>
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

  // 切换平台授权状态
  const togglePlatform = (platformId: string) => {
    setActivePlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  // 发布到平台
  const handlePublish = async (platformId: string) => {
    setPublishStatus(prev => ({ ...prev, [platformId]: 'publishing' }));
    setPublishProgress(prev => ({ ...prev, [platformId]: 0 }));

    // 模拟发布过程
    const platform = PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    try {
      // 检查授权
      const isAuthorized = true; // 简化处理，实际应检查用户是否授权
      if (!isAuthorized) {
        throw new Error('未授权，请先授权平台');
      }

      // 模拟上传和发布
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setPublishProgress(prev => ({ ...prev, [platformId]: i }));
      }

      // 模拟成功
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishStatus(prev => ({ ...prev, [platformId]: 'success' }));
      setPublishProgress(prev => ({ ...prev, [platformId]: 100 }));
      messageApi.success(`已成功发布到 ${platform.name}！`);
    } catch (error: any) {
      setPublishStatus(prev => ({ ...prev, [platformId]: 'failed' }));
      messageApi.error(`发布到 ${platform?.name} 失败：${error.message}`);
    }
  };

  // 同时发布到所有选中平台
  const handlePublishAll = async () => {
    if (activePlatforms.length === 0) {
      messageApi.warning('请至少选择一个发布平台');
      return;
    }

    setIsScheduling(true);

    // 串行发布
    for (const platformId of activePlatforms) {
      await handlePublish(platformId);
    }

    setIsScheduling(false);
  };

  // 更新预设发布时间
  const handleScheduleChange = (value: string) => {
    setPublishSettings(prev => ({ ...prev, schedule: value }));
    if (value !== 'custom') {
      const now = new Date();
      let scheduledTime = new Date(now);
      switch (value) {
        case '1h':
          scheduledTime.setHours(now.getHours() + 1);
          break;
        case '6h':
          scheduledTime.setHours(now.getHours() + 6);
          break;
        case '12h':
          scheduledTime.setHours(now.getHours() + 12);
          break;
        case '24h':
          scheduledTime.setDate(now.getDate() + 1);
          break;
      }
      setPublishSettings(prev => ({
        ...prev,
        scheduledTime: scheduledTime.toISOString().slice(0, 16),
      }));
    }
  };

  // 生成自定义封面
  const generateCustomCover = () => {
    setIsGeneratingCover(true);
    messageApi.loading('正在生成封面...', 1.5);

    setTimeout(() => {
      setIsGeneratingCover(false);
      messageApi.success('封面已生成');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {contextHolder}
      <ContextHelp topic="publish" type="inline" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* 左侧：视频预览和基础设置 */}
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
                position: 'relative',
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
            </div>

            <Form layout="vertical" onValuesChange={(_, allValues) => setPublishSettings(allValues)}>
              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视频标题</span>}
                name="title"
              >
                <Input
                  size="large"
                  value={publishSettings.title}
                  onChange={(e) => setPublishSettings(prev => ({ ...prev, title: e.target.value }))}
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
                name="description"
              >
                <TextArea
                  rows={4}
                  value={publishSettings.description}
                  onChange={(e) => setPublishSettings(prev => ({ ...prev, description: e.target.value }))}
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
                name="tags"
              >
                <Select
                  mode="tags"
                  style={{ width: '100%' }}
                  placeholder="添加标签"
                  tokenSeparators={[',']}
                  options={[
                    { value: 'AI生成', label: 'AI生成' },
                    { value: '短视频', label: '短视频' },
                    { value: '创意视频', label: '创意视频' },
                  ]}
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                  onChange={(value) => setPublishSettings(prev => ({ ...prev, tags: value }))}
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

        {/* 右侧：发布配置 */}
        <div>
          {/* 平台选择 */}
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>📡 发布到平台</span>}
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
              padding: '20px 24px',
            }}
            bodyStyle={{
              padding: '24px',
            }}
          >
            <List
              itemLayout="horizontal"
              dataSource={PLATFORMS}
              renderItem={(item) => {
                const isActive = activePlatforms.includes(item.id);
                const status = publishStatus[item.id];
                const progress = publishProgress[item.id];

                return (
                  <List.Item
                    style={{
                      padding: '16px',
                      background: colors.bgTertiary,
                      borderRadius: '12px',
                      marginBottom: '12px',
                      transition: 'all 0.2s ease',
                      border: `2px solid ${isActive ? colors.primary : colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = colors.bgSecondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = colors.bgTertiary;
                    }}
                    actions={[
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {status === 'publishing' && (
                          <Progress
                            percent={progress || 0}
                            size="small"
                            strokeColor={item.color}
                            style={{ width: 60 }}
                          />
                        )}
                        {status === 'success' && (
                          <CheckCircleOutlined style={{ color: colors.success }} />
                        )}
                        {status === 'failed' && (
                          <CloseCircleOutlined style={{ color: colors.error }} />
                        )}
                        <Button
                          type={isActive ? 'link' : 'text'}
                          disabled={status === 'publishing'}
                          onClick={() => handlePublish(item.id)}
                          style={{
                            color: isActive ? item.color : colors.textMuted,
                          }}
                        >
                          {status === 'publishing' ? '发布中...' :
                           status === 'success' ? '重新发布' :
                           '发布'}
                        </Button>
                      </div>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: isActive ? item.color : colors.bgTertiary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            border: `2px solid ${isActive ? item.color : colors.border}`,
                          }}
                        >
                          {item.icon}
                        </div>
                      }
                      title={<span style={{ color: colors.textPrimary }}>{item.name}</span>}
                      description={<span style={{ color: colors.textSecondary }}>
                        {item.active ? '已授权' : '未授权'}
                      </span>}
                    />
                  </List.Item>
                );
              }}
            />

            <Button
              type="primary"
              block
              icon={<CloudUploadOutlined />}
              onClick={handlePublishAll}
              disabled={isScheduling || activePlatforms.length === 0}
              style={{
                background: gradientStyles.success,
                border: 'none',
                marginTop: '16px',
                height: '48px',
              }}
            >
              {isScheduling ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spin size="small" />
                  正在发布...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  发布到所有选中平台 ({activePlatforms.length})
                </span>
              )}
            </Button>
          </Card>

          {/* 发布设置 */}
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>⚙️ 发布配置</span>}
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
              padding: '20px 24px',
            }}
            bodyStyle={{
              padding: '24px',
            }}
          >
            <Tabs
              defaultActiveKey="basic"
              items={[
                {
                  key: 'basic',
                  label: '基础设置',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>添加水印</span>
                        <Switch
                          checked={publishSettings.watermark}
                          onChange={(checked) =>
                            setPublishSettings(prev => ({ ...prev, watermark: checked }))
                          }
                        />
                      </div>

                      {publishSettings.watermark && (
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <Input
                            placeholder="水印文字"
                            value={publishSettings.watermarkText}
                            onChange={(e) =>
                              setPublishSettings(prev => ({ ...prev, watermarkText: e.target.value }))
                            }
                            style={{
                              background: colors.bgTertiary,
                              borderColor: colors.border,
                              color: colors.textPrimary,
                            }}
                          />
                          <Select
                            value={publishSettings.watermarkPosition}
                            onChange={(value) =>
                              setPublishSettings(prev => ({ ...prev, watermarkPosition: value }))
                            }
                            style={{
                              background: colors.bgTertiary,
                              borderColor: colors.border,
                              color: colors.textPrimary,
                            }}
                          >
                            {WATERMARK_POSITIONS.map(pos => (
                              <Option key={pos.value} value={pos.value}>
                                {pos.label} {pos.icon}
                              </Option>
                            ))}
                          </Select>
                        </Space>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>定时发布</span>
                        <Switch
                          checked={publishSettings.schedule !== 'immediate'}
                          onChange={(checked) =>
                            setPublishSettings(prev => ({
                              ...prev,
                              schedule: checked ? '24h' : 'immediate',
                            }))
                          }
                        />
                      </div>

                      {publishSettings.schedule !== 'immediate' && (
                        <Space direction="vertical" style={{ width: '100%' }} size="small">
                          <Select
                            value={publishSettings.schedule}
                            onChange={handleScheduleChange}
                            style={{
                              background: colors.bgTertiary,
                              borderColor: colors.border,
                              color: colors.textPrimary,
                            }}
                          >
                            {SCHEDULE_PRESETS.map(preset => (
                              <Option key={preset.value} value={preset.value}>
                                {preset.label}
                              </Option>
                            ))}
                          </Select>

                          {publishSettings.schedule === 'custom' && (
                            <Input
                              type="datetime-local"
                              value={publishSettings.scheduledTime}
                              onChange={(e) =>
                                setPublishSettings(prev => ({ ...prev, scheduledTime: e.target.value }))
                              }
                              style={{
                                background: colors.bgTertiary,
                                borderColor: colors.border,
                                color: colors.textPrimary,
                              }}
                            />
                          )}
                        </Space>
                      )}
                    </Space>
                  ),
                },
                {
                  key: 'advanced',
                  label: '高级配置',
                  children: (
                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>优化画质</span>
                        <Switch defaultChecked />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>自动生成字幕</span>
                        <Switch defaultChecked />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>自动分类</span>
                        <Switch />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: colors.textPrimary }}>版权声明</span>
                        <Switch defaultChecked />
                      </div>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>

          {/* 项目信息 */}
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>📊 项目信息</span>}
            style={{
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

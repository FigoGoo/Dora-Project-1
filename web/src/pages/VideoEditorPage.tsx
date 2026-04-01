import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Button,
  Space,
  Divider,
  message,
  Tag,
  Modal,
  Select,
  Spin,
  Progress,
  Slider,
  Tabs,
  Tooltip,
  List,
  Badge,
  Switch,
} from 'antd';
import ContextHelp from '../components/ContextHelp';

const { Option } = Select;
const { TabPane } = Tabs;

import {
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ScissorOutlined,
  SettingOutlined,
  SoundOutlined,
  MutedOutlined,
  SwapOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { ImagePanel, VideoClip } from '../types';
import { generateId, formatDate } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

// 过渡效果选项
const TRANSITION_OPTIONS = [
  { value: 'fade', label: '淡入淡出', icon: '🌫️' },
  { value: 'slide', label: '滑动切换', icon: '➡️' },
  { value: 'zoom', label: '缩放过渡', icon: '🔍' },
  { value: 'wipe', label: '擦除效果', icon: '📸' },
  { value: 'dissolve', label: '溶解效果', icon: '✨' },
  { value: 'none', label: '无过渡', icon: '❌' },
];

// 视频格式选项
const FORMAT_OPTIONS = [
  { value: 'mp4', label: 'MP4 (H.264)', quality: 'high' },
  { value: 'webm', label: 'WebM (VP9)', quality: 'medium' },
  { value: 'mov', label: 'MOV (ProRes)', quality: 'professional' },
];

// 分辨率选项
const RESOLUTION_OPTIONS = [
  { value: '720p', label: '720p (HD)', width: 1280, height: 720 },
  { value: '1080p', label: '1080p (Full HD)', width: 1920, height: 1080 },
  { value: '1440p', label: '1440p (2K)', width: 2560, height: 1440 },
  { value: '2160p', label: '2160p (4K)', width: 3840, height: 2160 },
];

const VideoEditorPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [isConcatenating, setIsConcatenating] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoClip | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('grid');
  const [previewingIndex, setPreviewingIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // 拼接设置
  const [transitionType, setTransitionType] = useState('fade');
  const [transitionDuration, setTransitionDuration] = useState(0.5);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [outputResolution, setOutputResolution] = useState('1080p');
  const [includeAudio, setIncludeAudio] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState<string | null>(null);

  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const images = currentProject?.images || [];
  const videos = currentProject?.videos || [];

  // 初始化视频数据
  useEffect(() => {
    if (!currentProject) return;
    if (!currentProject.videos && currentProject.images) {
      // 如果没有视频，根据已完成图片创建初始视频记录
      const completedImages = images.filter((img) => img.status === 'completed');
      const initialVideos: VideoClip[] = completedImages.map((img, index) => ({
        id: generateId(),
        imagePanelId: img.id,
        status: 'pending',
        model: 'seedance',
        duration: 3,
        order: index,
      }));

      updateProject(currentProject.id, {
        videos: initialVideos,
      });
    }
  }, [currentProject, images, updateProject]);

  // 清理预览定时器
  useEffect(() => {
    return () => {
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
      }
    };
  }, []);

  // 获取对应图片信息
  const getImagePanel = (imageId: string): ImagePanel | undefined => {
    return images.find((p) => p.id === imageId);
  };

  // 获取有序的视频列表
  const getOrderedVideos = (): VideoClip[] => {
    return [...videos].sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  // 生成单个视频
  const generateVideo = async (videoClip: VideoClip) => {
    if (!currentProject) return;

    const imagePanel = getImagePanel(videoClip.imagePanelId);
    if (!imagePanel?.imageUrl) {
      messageApi.warning('图片尚未生成');
      return;
    }

    setIsGenerating((prev) => [...prev, videoClip.id]);

    try {
      const response = await api.generateVideo(
        currentProject.id,
        videoClip.imagePanelId,
        videoClip.model,
        videoClip.duration
      );

      if (response.success) {
        messageApi.success('视频生成任务已提交');

        // 更新状态为生成中
        updateVideoClip(videoClip.id, { status: 'generating' });
      } else {
        throw new Error(response.error || '生成视频失败');
      }
    } catch (error: any) {
      setError(error.message);
      updateVideoClip(videoClip.id, { status: 'failed' });
    } finally {
      setIsGenerating((prev) => prev.filter((id) => id !== videoClip.id));
    }
  };

  // 批量生成所有视频
  const generateAllVideos = async () => {
    if (!currentProject || !videos) return;

    const pendingVideos = videos.filter((v) => v.status === 'pending' || v.status === 'failed');

    if (pendingVideos.length === 0) {
      messageApi.info('没有待生成的视频');
      return;
    }

    messageApi.loading({
      content: '正在提交生成任务...',
      duration: 2,
    });

    for (const video of pendingVideos) {
      await generateVideo(video);
    }
  };

  // 更新视频片段
  const updateVideoClip = (id: string, updates: Partial<VideoClip>) => {
    if (!currentProject || !currentProject.videos) return;

    const newVideos = currentProject.videos.map((v) =>
      v.id === id ? { ...v, ...updates } : v
    );

    updateProject(currentProject.id, {
      videos: newVideos,
    });
  };

  // 重新生成视频
  const regenerateVideo = async (videoClip: VideoClip) => {
    await generateVideo(videoClip);
  };

  // 下载视频
  const downloadVideo = async (videoClip: VideoClip) => {
    if (!videoClip.videoUrl) {
      messageApi.warning('视频尚未生成');
      return;
    }

    try {
      await api.downloadFile(videoClip.videoUrl, `video-${videoClip.id}.mp4`);
      messageApi.success('下载已开始');
    } catch (error) {
      messageApi.error('下载失败');
    }
  };

  // 查看视频
  const viewVideo = (videoClip: VideoClip) => {
    if (!videoClip.videoUrl) {
      messageApi.warning('视频尚未生成');
      return;
    }
    setSelectedVideo(videoClip);
    setPreviewModalVisible(true);
  };

  // 编辑视频
  const handleEditVideo = (videoClip: VideoClip) => {
    setEditingVideo({ ...videoClip });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingVideo) return;
    updateVideoClip(editingVideo.id, editingVideo);
    setEditModalVisible(false);
    setEditingVideo(null);
    messageApi.success('视频设置已更新');
  };

  // 移动视频顺序
  const moveVideo = (fromIndex: number, toIndex: number) => {
    if (!currentProject || !videos) return;
    const orderedVideos = getOrderedVideos();
    if (toIndex < 0 || toIndex >= orderedVideos.length) return;

    const newVideos = [...orderedVideos];
    const [moved] = newVideos.splice(fromIndex, 1);
    newVideos.splice(toIndex, 0, moved);

    // 更新 order 字段
    const updatedVideos = newVideos.map((v, i) => ({ ...v, order: i }));

    updateProject(currentProject.id, {
      videos: updatedVideos,
    });
  };

  // 开始/停止顺序预览
  const toggleSequencePreview = () => {
    if (previewingIndex !== null) {
      // 停止预览
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
        previewIntervalRef.current = null;
      }
      setPreviewingIndex(null);
    } else {
      // 开始预览
      const completedVideos = getOrderedVideos().filter(
        (v) => v.status === 'completed' && v.videoUrl
      );
      if (completedVideos.length === 0) {
        messageApi.info('请先生成至少一个视频片段');
        return;
      }

      let index = 0;
      setPreviewingIndex(0);

      previewIntervalRef.current = setInterval(() => {
        index = (index + 1) % completedVideos.length;
        setPreviewingIndex(index);
      }, 3000);
    }
  };

  // 拼接视频
  const concatenateVideos = async () => {
    if (!currentProject || !currentProject.videos) return;

    const completedVideos = getOrderedVideos().filter(
      (v) => v.status === 'completed' && v.videoUrl
    );

    if (completedVideos.length === 0) {
      Modal.info({
        title: '提示',
        content: '请先生成至少一个视频片段后再进行拼接',
        centered: true,
        okButtonProps: {
          style: {
            background: gradientStyles.primary,
            border: 'none',
          },
        },
      });
      return;
    }

    setIsConcatenating(true);

    try {
      const videoIds = completedVideos.map((v) => v.id);
      const response = await api.concatVideos(currentProject.id, videoIds);

      if (response.success) {
        messageApi.success('视频拼接任务已提交');
        // 保存拼接设置
        updateProject(currentProject.id, {
          status: 'completed',
          concatSettings: {
            transitionType,
            transitionDuration,
            outputFormat,
            outputResolution,
            includeAudio,
            backgroundMusic,
          },
        });
        window.location.href = '#/publish';
      } else {
        throw new Error(response.error || '拼接失败');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsConcatenating(false);
    }
  };

  // 计算生成进度
  const completedCount = videos.filter((v) => v.status === 'completed').length;
  const progress = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;
  const totalDuration = getOrderedVideos().reduce((sum, v) => sum + v.duration, 0);

  const orderedVideos = getOrderedVideos();

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {contextHolder}
      <ContextHelp topic="video" type="inline" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* 左侧：视频编辑器 */}
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
                <span style={{ fontSize: '32px' }}>🎥</span>
                视频编辑器
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
            extra={
              <Space size="middle">
                <Progress
                  percent={progress}
                  size="small"
                  style={{
                    width: 120,
                    color: colors.textSecondary,
                  }}
                  strokeColor={colors.primary}
                />
                <Button
                  type="primary"
                  onClick={generateAllVideos}
                  disabled={isGenerating.length > 0}
                  style={{
                    background: gradientStyles.primary,
                    border: 'none',
                  }}
                >
                  生成全部
                </Button>
              </Space>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'grid',
                  label: (
                    <span>
                      📱 网格视图
                    </span>
                  ),
                },
                {
                  key: 'timeline',
                  label: (
                    <span>
                      ⏱️ 时间轴视图
                    </span>
                  ),
                },
              ]}
              style={{ marginBottom: '20px' }}
            />

            {videos.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📹</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无视频需要生成</div>
                <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                  请先在图片编辑器中生成图片
                </div>
              </div>
            ) : activeTab === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
              }}>
                {orderedVideos.map((video, index) => {
                  const isGeneratingThis = isGenerating.includes(video.id);
                  const imagePanel = getImagePanel(video.imagePanelId);
                  const isPreviewing = previewingIndex === index;

                  return (
                    <Card
                      key={video.id}
                      style={{
                        borderRadius: '16px',
                        border: `2px solid ${isPreviewing ? colors.primary : colors.border}`,
                        transition: 'all 0.2s ease',
                        background: isPreviewing ? 'rgba(107, 63, 160, 0.1)' : colors.bgTertiary,
                        boxShadow: isPreviewing ? shadowStyles.purple : 'none',
                      }}
                      hoverable
                      actions={[
                        <Tooltip title="编辑">
                          <EditOutlined
                            key="edit"
                            onClick={() => handleEditVideo(video)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
                        <Tooltip title="重新生成">
                          <ReloadOutlined
                            key="regenerate"
                            onClick={() => regenerateVideo(video)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
                        <Tooltip title="下载">
                          <DownloadOutlined
                            key="download"
                            onClick={() => downloadVideo(video)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
                      ]}
                      onMouseEnter={(e) => {
                        if (!isPreviewing) {
                          e.currentTarget.style.borderColor = colors.primary;
                          e.currentTarget.style.boxShadow = shadowStyles.purple;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPreviewing) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <Space size="small" wrap>
                          <Tag
                            color={colors.primary}
                            style={{ background: 'rgba(107, 63, 160, 0.2)' }}
                          >
                            #{index + 1}
                          </Tag>
                          {video.status === 'pending' && (
                            <Tag style={{ background: 'rgba(250, 173, 20, 0.2)', color: colors.warning }}>
                              待生成
                            </Tag>
                          )}
                          {video.status === 'generating' && (
                            <Tag style={{ background: 'rgba(24, 144, 255, 0.2)', color: colors.info }}>
                              <Spin size="small" style={{ marginRight: '4px' }} />
                              生成中
                            </Tag>
                          )}
                          {video.status === 'completed' && (
                            <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success }}>
                              已完成
                            </Tag>
                          )}
                          {video.status === 'failed' && (
                            <Tag style={{ background: 'rgba(255, 77, 79, 0.2)', color: colors.error }}>
                              生成失败
                            </Tag>
                          )}
                          {index > 0 && (
                            <Tooltip title="上移">
                              <Button
                                type="text"
                                size="small"
                                icon={<ArrowUpOutlined />}
                                onClick={() => moveVideo(index, index - 1)}
                                style={{ padding: '4px 8px' }}
                              />
                            </Tooltip>
                          )}
                          {index < orderedVideos.length - 1 && (
                            <Tooltip title="下移">
                              <Button
                                type="text"
                                size="small"
                                icon={<ArrowDownOutlined />}
                                onClick={() => moveVideo(index, index + 1)}
                                style={{ padding: '4px 8px' }}
                              />
                            </Tooltip>
                          )}
                        </Space>
                      </div>

                      <div style={{
                        height: '200px',
                        backgroundColor: colors.bgSecondary,
                        borderRadius: '12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                      }} onClick={() => video.videoUrl && viewVideo(video)}>
                        {video.status === 'generating' || isGeneratingThis ? (
                          <div style={{ textAlign: 'center' }}>
                            <Spin size="large" style={{ marginBottom: '8px', color: colors.primary }} />
                            <div style={{ color: colors.textSecondary }}>正在生成中...</div>
                          </div>
                        ) : video.videoUrl ? (
                          <>
                            <video
                              ref={isPreviewing ? videoPlayerRef : null}
                              src={video.videoUrl}
                              autoPlay={isPreviewing}
                              loop={isPreviewing}
                              muted={isMuted}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            {!isPreviewing && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(0, 0, 0, 0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <PlayCircleOutlined style={{ fontSize: '32px', color: '#fff' }} />
                              </div>
                            )}
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', color: colors.textMuted }}>
                            {imagePanel?.imageUrl ? (
                              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                <img
                                  src={imagePanel.imageUrl}
                                  alt="源图片"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
                                />
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎥</div>
                                  <div style={{ fontSize: '12px', marginBottom: '12px' }}>待生成</div>
                                  <Button
                                    type="primary"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateVideo(video);
                                    }}
                                    disabled={isGeneratingThis}
                                    style={{
                                      background: gradientStyles.primary,
                                      border: 'none',
                                    }}
                                  >
                                    生成视频
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎥</div>
                                <div style={{ fontSize: '12px', marginBottom: '8px' }}>待生成</div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>
                        <Space wrap>
                          <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success }}>
                            ⏱ {video.duration}s
                          </Tag>
                          <Tag style={{ background: 'rgba(0, 212, 255, 0.2)', color: colors.cyan }}>
                            🎬 Seedance
                          </Tag>
                        </Space>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              // 时间轴视图
              <div style={{ padding: '20px 0' }}>
                {/* 时间轴控制 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  padding: '12px 16px',
                  background: colors.bgTertiary,
                  borderRadius: '12px',
                }}>
                  <Space>
                    <Button
                      icon={previewingIndex ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                      onClick={toggleSequencePreview}
                      type={previewingIndex ? 'primary' : 'default'}
                      style={previewingIndex ? { background: gradientStyles.primary, border: 'none' } : {}}
                    >
                      {previewingIndex ? '停止预览' : '顺序预览'}
                    </Button>
                    <Button
                      icon={isMuted ? <SoundOutlined /> : <MutedOutlined />}
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? '开启声音' : '静音'}
                    </Button>
                  </Space>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ClockCircleOutlined style={{ color: colors.primary }} />
                    <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                      总时长: {totalDuration} 秒
                    </span>
                  </div>
                </div>

                {/* 时间轴轨道 */}
                <List
                  dataSource={orderedVideos}
                  renderItem={(video, index) => {
                    const imagePanel = getImagePanel(video.imagePanelId);
                    const isGeneratingThis = isGenerating.includes(video.id);
                    const isPreviewing = previewingIndex === index;

                    return (
                      <List.Item
                        style={{
                          padding: '16px',
                          background: isPreviewing ? 'rgba(107, 63, 160, 0.1)' : colors.bgTertiary,
                          borderRadius: '12px',
                          marginBottom: '12px',
                          border: `2px solid ${isPreviewing ? colors.primary : colors.border}`,
                        }}
                        actions={[
                          index > 0 && (
                            <Button
                              type="text"
                              size="small"
                              icon={<ArrowUpOutlined />}
                              onClick={() => moveVideo(index, index - 1)}
                            />
                          ),
                          index < orderedVideos.length - 1 && (
                            <Button
                              type="text"
                              size="small"
                              icon={<ArrowDownOutlined />}
                              onClick={() => moveVideo(index, index + 1)}
                            />
                          ),
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditVideo(video)}
                          />,
                          video.status !== 'generating' && (
                            <Button
                              type="text"
                              size="small"
                              icon={<ReloadOutlined />}
                              onClick={() => regenerateVideo(video)}
                            />
                          ),
                        ].filter(Boolean)}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{
                              width: '100px',
                              height: '60px',
                              borderRadius: '8px',
                              background: colors.bgSecondary,
                              overflow: 'hidden',
                              position: 'relative',
                            }}>
                              {video.videoUrl ? (
                                <video
                                  src={video.videoUrl}
                                  autoPlay={isPreviewing}
                                  loop={isPreviewing}
                                  muted
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                              ) : imagePanel?.imageUrl ? (
                                <img
                                  src={imagePanel.imageUrl}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                                />
                              ) : null}
                              <div style={{
                                position: 'absolute',
                                bottom: '4px',
                                right: '4px',
                                background: 'rgba(0, 0, 0, 0.7)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                color: '#fff',
                              }}>
                                {video.duration}s
                              </div>
                            </div>
                          }
                          title={
                            <Space>
                              <Tag style={{ background: 'rgba(107, 63, 160, 0.3)', color: colors.primary, border: 'none' }}>
                                #{index + 1}
                              </Tag>
                              {video.status === 'completed' ? (
                                <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success, border: 'none' }}>
                                  <CheckCircleOutlined style={{ marginRight: '4px' }} />
                                  已完成
                                </Tag>
                              ) : video.status === 'generating' ? (
                                <Tag style={{ background: 'rgba(24, 144, 255, 0.2)', color: colors.info, border: 'none' }}>
                                  <Spin size="small" style={{ marginRight: '4px' }} />
                                  生成中
                                </Tag>
                              ) : (
                                <Tag style={{ background: 'rgba(250, 173, 20, 0.2)', color: colors.warning, border: 'none' }}>
                                  待生成
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div style={{
                              width: '100%',
                              height: '12px',
                              background: colors.bgSecondary,
                              borderRadius: '6px',
                              marginTop: '8px',
                              overflow: 'hidden',
                              position: 'relative',
                            }}>
                              <div style={{
                                width: `${(video.duration / Math.max(totalDuration, 1)) * 100}%`,
                                height: '100%',
                                background: video.status === 'completed'
                                  ? gradientStyles.success
                                  : video.status === 'generating'
                                  ? gradientStyles.primary
                                  : colors.bgTertiary,
                                borderRadius: '6px',
                              }} />
                            </div>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
          </Card>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              icon={<LeftOutlined />}
              size="large"
              href="#/image"
              style={{
                background: 'transparent',
                borderColor: colors.border,
                color: colors.textSecondary,
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
              }}
            >
              回到图片
            </Button>
            <Button
              type="primary"
              icon={<ScissorOutlined />}
              size="large"
              onClick={concatenateVideos}
              disabled={isConcatenating || completedCount === 0}
              style={{
                background: gradientStyles.success,
                border: 'none',
                height: '48px',
                padding: '0 28px',
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              {isConcatenating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spin size="small" />
                  拼接中...
                </span>
              ) : (
                <span>拼接成完整视频</span>
              )}
            </Button>
          </div>
        </div>

        {/* 右侧：设置面板 */}
        <div>
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>🎬 视频模型</span>}
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
            <div style={{
              padding: '16px',
              border: `2px solid ${colors.primary}`,
              borderRadius: '12px',
              backgroundColor: 'rgba(107, 63, 160, 0.1)',
            }}>
              <Space size="middle">
                <span style={{ fontSize: '28px' }}>🎬</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: colors.textPrimary }}>Seedance</div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>视频生成模型</div>
                </div>
              </Space>
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: colors.textSecondary }}>
              <p>当前使用 Seedance 视频生成模型</p>
              <p>可以在设置中切换其他模型</p>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>⚙️ 拼接设置</span>}
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
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>
                过渡效果
              </div>
              <Select
                value={transitionType}
                onChange={setTransitionType}
                style={{ width: '100%' }}
                options={TRANSITION_OPTIONS.map((opt) => ({
                  label: `${opt.icon} ${opt.label}`,
                  value: opt.value,
                }))}
              />
            </div>

            {transitionType !== 'none' && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                    过渡时长
                  </span>
                  <span style={{ fontSize: '13px', color: colors.primary, fontWeight: 600 }}>
                    {transitionDuration}s
                  </span>
                </div>
                <Slider
                  min={0.1}
                  max={2}
                  step={0.1}
                  value={transitionDuration}
                  onChange={setTransitionDuration}
                  trackStyle={{ background: colors.primary }}
                  handleStyle={{ borderColor: colors.primary }}
                />
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>
                输出格式
              </div>
              <Select
                value={outputFormat}
                onChange={setOutputFormat}
                style={{ width: '100%' }}
                options={FORMAT_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '8px' }}>
                输出分辨率
              </div>
              <Select
                value={outputResolution}
                onChange={setOutputResolution}
                style={{ width: '100%' }}
                options={RESOLUTION_OPTIONS.map((opt) => ({
                  label: opt.label,
                  value: opt.value,
                }))}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: colors.textSecondary }}>
                  包含音频
                </span>
                <Switch
                  checked={includeAudio}
                  onChange={setIncludeAudio}
                />
              </div>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>📊 视频状态</span>}
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>总片段数：</span>
              <span style={{ fontWeight: 'bold' }}>{videos.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span><CheckCircleOutlined style={{ color: colors.success, marginRight: '6px' }} />已完成：</span>
              <span style={{ fontWeight: 'bold' }}>{completedCount}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>待生成：</span>
              <span style={{ fontWeight: 'bold' }}>{videos.filter((v) => v.status === 'pending').length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>失败：</span>
              <span style={{ fontWeight: 'bold' }}>{videos.filter((v) => v.status === 'failed').length}</span>
            </div>
            <Divider style={{ borderColor: colors.borderLight, margin: '16px 0' }} />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>总时长：</span>
              <span style={{ fontWeight: 'bold' }}>{totalDuration} 秒</span>
            </div>
            {transitionType !== 'none' && videos.length > 1 && (
              <div style={{
                fontSize: '12px',
                color: colors.textTertiary,
                marginTop: '4px',
              }}>
                含 {videos.length - 1} 个过渡 (共 +{(transitionDuration * (videos.length - 1)).toFixed(1)}s)
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* 视频预览弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <span style={{ fontSize: '24px' }}>🎥</span>
            视频预览
          </div>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => selectedVideo && downloadVideo(selectedVideo)}
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          >
            下载
          </Button>,
          <Button
            key="close"
            onClick={() => setPreviewModalVisible(false)}
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          >
            关闭
          </Button>,
        ]}
        width={900}
        centered={true}
      >
        {selectedVideo?.videoUrl && (
          <div style={{ textAlign: 'center' }}>
            <video
              src={selectedVideo.videoUrl}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '600px',
                borderRadius: '12px',
              }}
            />
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h4 style={{ color: colors.textPrimary, marginBottom: '10px' }}>视频信息</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.8' }}>
                时长：{selectedVideo.duration} 秒<br />
                模型：Seedance
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑视频弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <EditOutlined style={{ fontSize: '20px' }} />
            编辑视频设置
          </div>
        }
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingVideo(null);
        }}
        width={500}
        okText="保存"
        cancelText="取消"
        centered={true}
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
        {editingVideo && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                视频时长 (秒)
              </label>
              <Slider
                min={1}
                max={15}
                step={1}
                value={editingVideo.duration}
                onChange={(value) => setEditingVideo({ ...editingVideo, duration: value })}
                trackStyle={{ background: colors.primary }}
                handleStyle={{ borderColor: colors.primary }}
              />
              <div style={{ textAlign: 'center', color: colors.primary, fontWeight: 600, marginTop: '8px' }}>
                {editingVideo.duration} 秒
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                模型
              </label>
              <Select
                value={editingVideo.model}
                onChange={(value) => setEditingVideo({ ...editingVideo, model: value })}
                style={{ width: '100%' }}
                options={[
                  { label: '🎬 Seedance', value: 'seedance' },
                ]}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoEditorPage;

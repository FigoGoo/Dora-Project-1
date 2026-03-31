import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Divider,
  message,
  Typography,
  Tag,
  Modal,
  Select,
  Spin,
  Progress,
  Slider,
} from 'antd';
import {
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { ImagePanel, VideoClip } from '../types';
import { generateId } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const VideoEditorPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState<string[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [isConcatenating, setIsConcatenating] = useState(false);

  const images = currentProject?.images || [];
  const videos = currentProject?.videos || [];

  // 初始化视频数据
  useEffect(() => {
    if (!currentProject || currentProject.videos) return;

    // 如果没有视频，根据已完成图片创建初始视频记录
    const completedImages = images.filter((img) => img.status === 'completed');
    const initialVideos: VideoClip[] = completedImages.map((img) => ({
      id: generateId(),
      imagePanelId: img.id,
      status: 'pending',
      model: 'seedance',
      duration: 3, // 默认3秒
    }));

    updateProject(currentProject.id, {
      videos: initialVideos,
    });
  }, [currentProject, images, updateProject]);

  // 获取对应图片信息
  const getImagePanel = (imageId: string): ImagePanel | undefined => {
    return images.find((p) => p.id === imageId);
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

  // 更新视频时长
  const handleEditDuration = (videoClip: VideoClip) => {
    Modal.confirm({
      title: '调整视频时长',
      content: (
        <div>
          <div style={{ marginBottom: '16px', color: colors.textPrimary }}>
            当前时长：
            <span style={{ fontWeight: 'bold', color: colors.primary }}>
              {videoClip.duration}秒
            </span>
          </div>
          <Slider
            min={1}
            max={10}
            defaultValue={videoClip.duration}
            onChange={(value) => {
              updateVideoClip(videoClip.id, { duration: value });
            }}
            marks={{
              1: '1s',
              2: '2s',
              5: '5s',
              10: '10s',
            }}
            tooltip={{
              formatter: (value) => `${value}秒`,
            }}
            trackStyle={{
              background: colors.primary,
            }}
            handleStyle={{
              borderColor: colors.primary,
              background: colors.primary,
            }}
          />
        </div>
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: () => {
        messageApi.success('时长已更新');
      },
      centered: true,
      okButtonProps: {
        style: {
          background: gradientStyles.primary,
          border: 'none',
        },
      },
      cancelButtonProps: {
        style: {
          background: colors.bgTertiary,
          borderColor: colors.border,
          color: colors.textPrimary,
        },
      },
    });
  };

  // 拼接视频
  const concatenateVideos = async () => {
    if (!currentProject || !currentProject.videos) return;

    const completedVideos = currentProject.videos.filter(
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

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {contextHolder}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
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
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}>
                {videos.map((video, index) => {
                  const isGeneratingThis = isGenerating.includes(video.id);

                  return (
                    <Card
                      key={video.id}
                      style={{
                        borderRadius: '16px',
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.2s ease',
                        background: colors.bgTertiary,
                      }}
                      hoverable
                      actions={[
                        <EditOutlined
                          key="duration"
                          onClick={() => handleEditDuration(video)}
                          style={{ color: colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textSecondary;
                          }}
                        />,
                        <ReloadOutlined
                          key="regenerate"
                          onClick={() => regenerateVideo(video)}
                          style={{ color: colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textSecondary;
                          }}
                        />,
                        <DownloadOutlined
                          key="download"
                          onClick={() => downloadVideo(video)}
                          style={{ color: colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textSecondary;
                          }}
                        />,
                      ]}
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
                    >
                      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                        <Space size="small">
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
                      }} onClick={() => viewVideo(video)}>
                        {video.status === 'generating' || isGeneratingThis ? (
                          <div style={{ textAlign: 'center' }}>
                            <Spin size="large" style={{ marginBottom: '8px', color: colors.primary }} />
                            <div style={{ color: colors.textSecondary }}>正在生成中...</div>
                          </div>
                        ) : video.videoUrl ? (
                          <video
                            src={video.videoUrl}
                            controls
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', color: colors.textMuted }}>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎥</div>
                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>待生成</div>
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
              icon={<RightOutlined />}
              size="large"
              onClick={concatenateVideos}
              disabled={isConcatenating}
              style={{
                background: gradientStyles.success,
                border: 'none',
                height: '48px',
                padding: '0 28px',
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              拼接成视频
            </Button>
          </div>
        </div>

        {/* 右侧：设置面板 */}
        <div>
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>AI模型选择</span>}
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
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>
              <p>当前使用 Seedance 视频生成模型</p>
              <p>可以在设置中切换其他模型</p>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>视频状态</span>}
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>总视频片段：</span>
              <span>{videos.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>已完成：</span>
              <span>{completedCount}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>待生成：</span>
              <span>{videos.filter((v) => v.status === 'pending').length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>失败：</span>
              <span>{videos.filter((v) => v.status === 'failed').length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>总时长：</span>
              <span>{videos.reduce((sum, v) => sum + v.duration, 0)} 秒</span>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>拼接设置</span>}
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
              <p style={{ fontSize: '14px', color: colors.textPrimary, marginBottom: '8px' }}>
                所有视频片段将按照顺序拼接成一个完整的视频
              </p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
                默认过渡效果
              </div>
              <Select defaultValue="fade" style={{ width: '100%' }}>
                <Option value="fade">淡入淡出</Option>
                <Option value="slide">滑动</Option>
                <Option value="zoom">缩放</Option>
                <Option value="none">无</Option>
              </Select>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '4px' }}>
                视频格式
              </div>
              <Select defaultValue="mp4">
                <Option value="mp4">MP4 (H.264)</Option>
                <Option value="webm">WebM (VP9)</Option>
              </Select>
            </div>
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
        width={800}
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
              }}
            />
            <div style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4 style={{ color: colors.textPrimary, marginBottom: '8px' }}>视频信息</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                时长：{selectedVideo.duration} 秒 | 模型：Seedance
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VideoEditorPage;

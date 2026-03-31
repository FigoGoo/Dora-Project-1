import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Divider,
  message,
  Typography,
  Tag,
  Modal,
  Spin,
  Progress,
} from 'antd';
import {
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  DownloadOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { StoryboardPanel, ImagePanel } from '../types';
import { generateId } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const ImageEditorPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagePanel | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);

  const storyboardPanels = currentProject?.storyboard || [];
  const images = currentProject?.images || [];

  // 初始化图片数据
  useEffect(() => {
    if (!currentProject || currentProject.images) return;

    // 如果没有图片，根据分镜创建初始图片记录
    const initialImages: ImagePanel[] = (currentProject.storyboard || []).map((panel) => ({
      id: generateId(),
      storyboardPanelId: panel.id,
      prompt: panel.description,
      status: 'pending' as const,
      model: 'banana',
    }));

    updateProject(currentProject.id, {
      images: initialImages,
    });
  }, [currentProject, updateProject]);

  // 获取对应分镜信息
  const getStoryboardPanel = (panelId: string): StoryboardPanel | undefined => {
    return storyboardPanels.find((p) => p.id === panelId);
  };

  // 生成单张图片
  const generateImage = async (imagePanel: ImagePanel) => {
    if (!currentProject) return;

    setIsGenerating((prev) => [...prev, imagePanel.id]);

    try {
      const response = await api.generateImage(
        currentProject.id,
        imagePanel.storyboardPanelId,
        imagePanel.prompt,
        imagePanel.model
      );

      if (response.success) {
        messageApi.success('图片生成任务已提交');

        // 更新状态为生成中
        updateImagePanel(imagePanel.id, { status: 'generating' });
      } else {
        throw new Error(response.error || '生成图片失败');
      }
    } catch (error: any) {
      setError(error.message);
      updateImagePanel(imagePanel.id, { status: 'failed' });
    } finally {
      setIsGenerating((prev) => prev.filter((id) => id !== imagePanel.id));
    }
  };

  // 批量生成所有图片
  const generateAllImages = async () => {
    if (!currentProject || !images) return;

    const pendingImages = images.filter((img) => img.status === 'pending' || img.status === 'failed');

    if (pendingImages.length === 0) {
      messageApi.info('没有待生成的图片');
      return;
    }

    messageApi.loading({
      content: '正在提交生成任务...',
      duration: 2,
    });

    for (const img of pendingImages) {
      await generateImage(img);
    }
  };

  // 更新图片面板
  const updateImagePanel = (id: string, updates: Partial<ImagePanel>) => {
    if (!currentProject || !currentProject.images) return;

    const newImages = currentProject.images.map((img) =>
      img.id === id ? { ...img, ...updates } : img
    );

    updateProject(currentProject.id, {
      images: newImages,
    });
  };

  // 重新生成图片
  const regenerateImage = async (imagePanel: ImagePanel) => {
    await generateImage(imagePanel);
  };

  // 下载图片
  const downloadImage = async (imagePanel: ImagePanel) => {
    if (!imagePanel.imageUrl) {
      messageApi.warning('图片尚未生成');
      return;
    }

    try {
      await api.downloadFile(imagePanel.imageUrl, `image-${imagePanel.id}.png`);
      messageApi.success('下载已开始');
    } catch (error) {
      messageApi.error('下载失败');
    }
  };

  // 查看大图
  const viewImage = (imagePanel: ImagePanel) => {
    if (!imagePanel.imageUrl) {
      messageApi.warning('图片尚未生成');
      return;
    }
    setSelectedImage(imagePanel);
    setPreviewModalVisible(true);
  };

  // 更新提示词
  const handleEditPrompt = (imagePanel: ImagePanel) => {
    Modal.confirm({
      title: '编辑提示词',
      content: (
        <TextArea
          rows={6}
          defaultValue={imagePanel.prompt}
          onChange={(e) => {
            updateImagePanel(imagePanel.id, { prompt: e.target.value });
          }}
          style={{
            background: colors.bgTertiary,
            borderColor: colors.border,
            color: colors.textPrimary,
          }}
        />
      ),
      okText: '保存',
      cancelText: '取消',
      onOk: () => {
        messageApi.success('提示词已更新');
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

  // 前往下一步
  const goToVideoEditor = () => {
    if (!currentProject) return;

    // 检查是否有完成的图片
    const hasCompletedImages = currentProject.images?.some(
      (img) => img.status === 'completed'
    );

    if (!hasCompletedImages) {
      Modal.info({
        title: '提示',
        content: '请先生成至少一张图片后再进行视频生成',
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

    window.location.href = '#/video';
  };

  // 计算生成进度
  const completedCount = images.filter((img) => img.status === 'completed').length;
  const progress = images.length > 0 ? Math.round((completedCount / images.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {contextHolder}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* 左侧：图片编辑器 */}
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
                <span style={{ fontSize: '32px' }}>🎨</span>
                画面绘制
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
                  onClick={generateAllImages}
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
            {images.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无图片需要生成</div>
                <div style={{ fontSize: '13px', color: colors.textMuted }}>
                  请先在分镜编辑器中创建分镜
                </div>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}>
                {images.map((image, index) => {
                  const panel = getStoryboardPanel(image.storyboardPanelId);
                  const isGeneratingThis = isGenerating.includes(image.id);

                  return (
                    <Card
                      key={image.id}
                      style={{
                        borderRadius: '16px',
                        border: `1px solid ${colors.border}`,
                        transition: 'all 0.2s ease',
                        background: colors.bgTertiary,
                      }}
                      hoverable
                      actions={[
                        <EditOutlined
                          key="edit"
                          onClick={() => handleEditPrompt(image)}
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
                          onClick={() => regenerateImage(image)}
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
                          onClick={() => downloadImage(image)}
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
                            #{panel?.panelNumber || index + 1}
                          </Tag>
                          {image.status === 'pending' && (
                            <Tag style={{ background: 'rgba(250, 173, 20, 0.2)', color: colors.warning }}>
                              待生成
                            </Tag>
                          )}
                          {image.status === 'generating' && (
                            <Tag style={{ background: 'rgba(24, 144, 255, 0.2)', color: colors.info }}>
                              <Spin size="small" style={{ marginRight: '4px' }} />
                              生成中
                            </Tag>
                          )}
                          {image.status === 'completed' && (
                            <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success }}>
                              已完成
                            </Tag>
                          )}
                          {image.status === 'failed' && (
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
                      }} onClick={() => viewImage(image)}>
                        {image.status === 'generating' || isGeneratingThis ? (
                          <div style={{ textAlign: 'center' }}>
                            <Spin size="large" style={{ marginBottom: '8px', color: colors.primary }} />
                            <div style={{ color: colors.textSecondary }}>正在生成中...</div>
                          </div>
                        ) : image.imageUrl ? (
                          <img
                            src={image.imageUrl}
                            alt={`画面 ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div style={{ textAlign: 'center', color: colors.textMuted }}>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎨</div>
                            <div style={{ fontSize: '12px', marginBottom: '8px' }}>待绘制</div>
                            <Button
                              type="primary"
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                generateImage(image);
                              }}
                              disabled={isGeneratingThis}
                              style={{
                                background: gradientStyles.primary,
                                border: 'none',
                              }}
                            >
                              生成图片
                            </Button>
                          </div>
                        )}
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: colors.textSecondary,
                        marginBottom: '8px',
                      }}>
                        {image.prompt.slice(0, 60) + (image.prompt.length > 60 ? '...' : '')}
                      </div>

                      <Space wrap style={{ fontSize: '12px' }}>
                        <Tag style={{ background: 'rgba(233, 30, 140, 0.2)', color: colors.pink }}>
                          {image.model === 'banana' ? '🍌 Banana 2' : '其他'}
                        </Tag>
                      </Space>
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
              href="#/storyboard"
              style={{
                background: 'transparent',
                borderColor: colors.border,
                color: colors.textSecondary,
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
              }}
            >
              回到分镜
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              size="large"
              onClick={goToVideoEditor}
              disabled={completedCount === 0}
              style={{
                background: gradientStyles.success,
                border: 'none',
                height: '48px',
                padding: '0 28px',
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              下一步：视频生成 →
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
                  <span style={{ fontSize: '28px' }}>🍌</span>
                  <div>
                    <div style={{ fontWeight: 'bold', color: colors.textPrimary }}>Banana 2</div>
                    <div style={{ fontSize: '12px', color: colors.textSecondary }}>图像生成模型</div>
                  </div>
                </Space>
              </div>
            </div>
            <div style={{ fontSize: '13px', color: colors.textSecondary }}>
              <p>当前使用 Banana 2 图像生成模型</p>
              <p>可以在设置中切换其他模型</p>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>图片状态</span>}
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
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>总图片数：</span>
              <span>{images.length}</span>
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
              <span>{images.filter((img) => img.status === 'pending').length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>失败：</span>
              <span>{images.filter((img) => img.status === 'failed').length}</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 图片预览弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <span style={{ fontSize: '24px' }}>🖼️</span>
            图片预览
          </div>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() => selectedImage && downloadImage(selectedImage)}
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
        {selectedImage?.imageUrl && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedImage.imageUrl}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '600px',
                objectFit: 'contain',
              }}
            />
            <div style={{ marginTop: '16px', textAlign: 'left' }}>
              <h4 style={{ color: colors.textPrimary, marginBottom: '8px' }}>提示词</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.6' }}>
                {selectedImage.prompt}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImageEditorPage;

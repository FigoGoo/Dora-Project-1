import React, { useState, useEffect } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Divider,
  message,
  Tag,
  Modal,
  Spin,
  Progress,
  Select,
  Tabs,
  Tooltip,
  Upload,
  Badge,
  Image,
} from 'antd';
import {
  EditOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  DownloadOutlined,
  UploadOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PictureOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';

import { useAppStore } from '../store';
import { StoryboardPanel, ImagePanel } from '../types';
import { generateId, formatFileSize } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 图片模型选项
const IMAGE_MODELS = [
  { id: 'banana', name: 'Banana 2', icon: '🍌', description: '高质量图像生成' },
  { id: 'midjourney', name: 'Midjourney', icon: '🎨', description: '艺术风格创作' },
  { id: 'dalle', name: 'DALL-E', icon: '🖼️', description: 'OpenAI 图像模型' },
];

// 风格预设
const STYLE_PRESETS = [
  { id: 'cinematic', name: '电影质感', prompt: 'cinematic lighting, film grain, depth of field' },
  { id: 'anime', name: '动漫风格', prompt: 'anime style, vibrant colors, detailed' },
  { id: 'realistic', name: '写实风格', prompt: 'photorealistic, high detail, 8k' },
  { id: 'watercolor', name: '水彩风格', prompt: 'watercolor painting, artistic, soft colors' },
  { id: 'oil', name: '油画风格', prompt: 'oil painting, thick brushstrokes, classic art' },
];

// 质量预设
const QUALITY_PRESETS = [
  { id: 'standard', name: '标准', resolution: '1024x1024' },
  { id: 'high', name: '高清', resolution: '1536x1536' },
  { id: 'ultra', name: '超清', resolution: '2048x2048' },
];

const ImageEditorPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImagePanel | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingImage, setEditingImage] = useState<ImagePanel | null>(null);
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedQuality, setSelectedQuality] = useState('standard');

  const storyboardPanels = currentProject?.storyboard || [];
  const images = currentProject?.images || [];

  // 初始化图片数据
  useEffect(() => {
    if (!currentProject) return;
    if (!currentProject.images && currentProject.storyboard) {
      // 如果没有图片，根据分镜创建初始图片记录
      const initialImages: ImagePanel[] = currentProject.storyboard.map((panel) => ({
        id: generateId(),
        storyboardPanelId: panel.id,
        prompt: panel.description,
        status: 'pending' as const,
        model: 'banana',
        alternatives: [],
      }));

      updateProject(currentProject.id, {
        images: initialImages,
      });
    }
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

  // 编辑图片
  const handleEditImage = (imagePanel: ImagePanel) => {
    setEditingImage({ ...imagePanel });
    setEditModalVisible(true);
  };

  // 保存编辑
  const handleSaveEdit = () => {
    if (!editingImage) return;
    updateImagePanel(editingImage.id, editingImage);
    setEditModalVisible(false);
    setEditingImage(null);
    messageApi.success('图片设置已更新');
  };

  // 添加风格预设到提示词
  const addStylePreset = (style: typeof STYLE_PRESETS[0]) => {
    if (!editingImage) return;
    const newPrompt = editingImage.prompt
      ? `${editingImage.prompt}, ${style.prompt}`
      : style.prompt;
    setEditingImage({ ...editingImage, prompt: newPrompt });
  };

  // 选择备选图片
  const selectAlternative = (imagePanel: ImagePanel, altUrl: string) => {
    const currentUrl = imagePanel.imageUrl;
    const alternatives = [...(imagePanel.alternatives || [])];

    // 如果当前有图片，将其加入备选
    if (currentUrl && !alternatives.includes(currentUrl)) {
      alternatives.push(currentUrl);
    }

    // 从备选列表中移除选中的图片
    const newAlternatives = alternatives.filter((url) => url !== altUrl);

    updateImagePanel(imagePanel.id, {
      imageUrl: altUrl,
      alternatives: newAlternatives,
    });
    messageApi.success('已切换图片');
  };

  // 上传自定义图片
  const uploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: async (file) => {
      if (!editingImage) return false;

      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        messageApi.error('请上传图片文件');
        return false;
      }

      const isLt10MB = file.size / 1024 / 1024 < 10;
      if (!isLt10MB) {
        messageApi.error('图片大小不能超过 10MB');
        return false;
      }

      // 模拟上传
      const url = URL.createObjectURL(file);

      // 如果当前有图片，将其加入备选
      const currentUrl = editingImage.imageUrl;
      const alternatives = [...(editingImage.alternatives || [])];
      if (currentUrl) {
        alternatives.push(currentUrl);
      }

      setEditingImage({
        ...editingImage,
        imageUrl: url,
        status: 'completed',
        alternatives,
      });

      messageApi.success('图片已上传');
      return false;
    },
  };

  // 前往下一步
  const goToVideoEditor = () => {
    if (!currentProject) return;

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
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {contextHolder}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
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
                  key: 'list',
                  label: (
                    <span>
                      📋 列表视图
                    </span>
                  ),
                },
              ]}
              style={{ marginBottom: '20px' }}
            />

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
            ) : activeTab === 'grid' ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px',
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
                        <Tooltip title="编辑">
                          <EditOutlined
                            key="edit"
                            onClick={() => handleEditImage(image)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
                        <Tooltip title="重新生成">
                          <ReloadOutlined
                            key="regenerate"
                            onClick={() => regenerateImage(image)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
                        <Tooltip title="下载">
                          <DownloadOutlined
                            key="download"
                            onClick={() => downloadImage(image)}
                            style={{ color: colors.textSecondary }}
                          />
                        </Tooltip>,
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
                        <Space size="small" wrap>
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
                          {image.alternatives && image.alternatives.length > 0 && (
                            <Tag style={{ background: 'rgba(107, 63, 160, 0.2)', color: colors.primary }}>
                              +{image.alternatives.length} 备选
                            </Tag>
                          )}
                        </Space>
                      </div>

                      <div style={{
                        height: '220px',
                        backgroundColor: colors.bgSecondary,
                        borderRadius: '12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative',
                      }} onClick={() => image.imageUrl && viewImage(image)}>
                        {image.status === 'generating' || isGeneratingThis ? (
                          <div style={{ textAlign: 'center' }}>
                            <Spin size="large" style={{ marginBottom: '8px', color: colors.primary }} />
                            <div style={{ color: colors.textSecondary }}>正在生成中...</div>
                          </div>
                        ) : image.imageUrl ? (
                          <>
                            <img
                              src={image.imageUrl}
                              alt={`画面 ${index + 1}`}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            {/* 备选图片选择器 */}
                            {image.alternatives && image.alternatives.length > 0 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                left: '8px',
                                right: '8px',
                                display: 'flex',
                                gap: '8px',
                                overflowX: 'auto',
                                padding: '4px',
                                background: 'rgba(0, 0, 0, 0.5)',
                                borderRadius: '8px',
                              }} onClick={(e) => e.stopPropagation()}>
                                <div
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '8px',
                                    border: `2px solid ${colors.primary}`,
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                  }}
                                >
                                  <img
                                    src={image.imageUrl}
                                    alt="当前"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  />
                                </div>
                                {image.alternatives.map((alt, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      width: '48px',
                                      height: '48px',
                                      borderRadius: '8px',
                                      border: `2px solid ${colors.border}`,
                                      overflow: 'hidden',
                                      cursor: 'pointer',
                                      flexShrink: 0,
                                    }}
                                    onClick={() => selectAlternative(image, alt)}
                                  >
                                    <img
                                      src={alt}
                                      alt={`备选 ${i + 1}`}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            {/* 查看大图按钮 */}
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              opacity: 0,
                              transition: 'opacity 0.2s',
                            }} className="hover-opacity-100">
                              <Button
                                type="text"
                                icon={<EyeOutlined />}
                                style={{
                                  background: 'rgba(0, 0, 0, 0.5)',
                                  color: '#fff',
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <div style={{ textAlign: 'center', color: colors.textMuted }}>
                            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎨</div>
                            <div style={{ fontSize: '12px', marginBottom: '12px' }}>待绘制</div>
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
                        lineHeight: '1.5',
                      }}>
                        {image.prompt.slice(0, 80) + (image.prompt.length > 80 ? '...' : '')}
                      </div>

                      <Space wrap style={{ fontSize: '12px' }}>
                        <Tag style={{ background: 'rgba(233, 30, 140, 0.2)', color: colors.pink }}>
                          {image.model === 'banana' ? '🍌 Banana 2' :
                           image.model === 'midjourney' ? '🎨 Midjourney' :
                           image.model === 'dalle' ? '🖼️ DALL-E' : image.model}
                        </Tag>
                      </Space>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <List
                dataSource={images}
                renderItem={(image, index) => {
                  const panel = getStoryboardPanel(image.storyboardPanelId);
                  const isGeneratingThis = isGenerating.includes(image.id);

                  return (
                    <List.Item
                      style={{
                        padding: '16px',
                        background: colors.bgTertiary,
                        borderRadius: '12px',
                        marginBottom: '12px',
                        border: `1px solid ${colors.border}`,
                      }}
                      actions={[
                        image.status === 'pending' || image.status === 'failed' ? (
                          <Button
                            type="text"
                            size="small"
                            onClick={() => generateImage(image)}
                            disabled={isGeneratingThis}
                          >
                            生成
                          </Button>
                        ) : null,
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditImage(image)}
                        />,
                        <Button
                          type="text"
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => regenerateImage(image)}
                        />,
                        image.status === 'completed' && (
                          <Button
                            type="text"
                            size="small"
                            icon={<DownloadOutlined />}
                            onClick={() => downloadImage(image)}
                          />
                        ),
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        avatar={
                          <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            background: colors.bgSecondary,
                            overflow: 'hidden',
                          }}>
                            {image.imageUrl ? (
                              <img
                                src={image.imageUrl}
                                alt="缩略图"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '32px',
                              }}>
                                🎨
                              </div>
                            )}
                          </div>
                        }
                        title={
                          <Space>
                            <Tag style={{ background: 'rgba(107, 63, 160, 0.3)', color: colors.primary, border: 'none' }}>
                              #{panel?.panelNumber || index + 1}
                            </Tag>
                            {image.status === 'pending' && <span style={{ color: colors.warning }}>待生成</span>}
                            {image.status === 'generating' && <span style={{ color: colors.info }}><Spin size="small" /> 生成中</span>}
                            {image.status === 'completed' && <span style={{ color: colors.success }}>已完成</span>}
                            {image.status === 'failed' && <span style={{ color: colors.error }}>生成失败</span>}
                          </Space>
                        }
                        description={
                          <div>
                            <div style={{ color: colors.textSecondary, fontSize: '13px', marginBottom: '8px' }}>
                              {image.prompt.slice(0, 100)}
                              {image.prompt.length > 100 ? '...' : ''}
                            </div>
                            <Space size="small">
                              <Tag size="small" style={{ background: 'rgba(233, 30, 140, 0.2)', color: colors.pink, border: 'none' }}>
                                {image.model}
                              </Tag>
                              {image.alternatives && image.alternatives.length > 0 && (
                                <Tag size="small" style={{ background: 'rgba(107, 63, 160, 0.2)', color: colors.primary, border: 'none' }}>
                                  +{image.alternatives.length} 备选
                                </Tag>
                              )}
                            </Space>
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
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
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {IMAGE_MODELS.map((model) => (
                <div
                  key={model.id}
                  style={{
                    padding: '16px',
                    border: `2px solid ${model.id === 'banana' ? colors.primary : colors.border}`,
                    borderRadius: '12px',
                    backgroundColor: model.id === 'banana' ? 'rgba(107, 63, 160, 0.1)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Space size="middle">
                    <span style={{ fontSize: '28px' }}>{model.icon}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: colors.textPrimary }}>{model.name}</div>
                      <div style={{ fontSize: '12px', color: colors.textSecondary }}>{model.description}</div>
                    </div>
                    {model.id === 'banana' && (
                      <CheckCircleOutlined style={{ color: colors.primary, fontSize: '18px', marginLeft: 'auto' }} />
                    )}
                  </Space>
                </div>
              ))}
            </Space>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>生成质量</span>}
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
            <Select
              value={selectedQuality}
              onChange={setSelectedQuality}
              style={{ width: '100%' }}
              options={QUALITY_PRESETS.map((q) => ({
                label: `${q.name} (${q.resolution})`,
                value: q.id,
              }))}
            />
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
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>总图片数：</span>
              <span>{images.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span><CheckCircleOutlined style={{ color: colors.success, marginRight: '6px' }} />已完成：</span>
              <span>{completedCount}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span><ClockCircleOutlined style={{ color: colors.warning, marginRight: '6px' }} />待生成：</span>
              <span>{images.filter((img) => img.status === 'pending').length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span><CloseCircleOutlined style={{ color: colors.error, marginRight: '6px' }} />失败：</span>
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
        width={900}
        centered={true}
      >
        {selectedImage?.imageUrl && (
          <div style={{ textAlign: 'center' }}>
            <img
              src={selectedImage.imageUrl}
              alt="预览"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
            <div style={{ marginTop: '20px', textAlign: 'left' }}>
              <h4 style={{ color: colors.textPrimary, marginBottom: '10px' }}>提示词</h4>
              <p style={{ color: colors.textSecondary, fontSize: '14px', lineHeight: '1.8' }}>
                {selectedImage.prompt}
              </p>
              {selectedImage.alternatives && selectedImage.alternatives.length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ color: colors.textPrimary, marginBottom: '12px' }}>
                    备选图片 ({selectedImage.alternatives.length})
                  </h4>
                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '8px 0' }}>
                    {selectedImage.alternatives.map((alt, i) => (
                      <div
                        key={i}
                        style={{
                          width: '120px',
                          height: '120px',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          border: `2px solid ${colors.border}`,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                        onClick={() => selectAlternative(selectedImage, alt)}
                      >
                        <img
                          src={alt}
                          alt={`备选 ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑图片弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <EditOutlined style={{ fontSize: '20px' }} />
            编辑图片设置
          </div>
        }
        open={editModalVisible}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingImage(null);
        }}
        width={700}
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
        {editingImage && (
          <div>
            {/* 当前图片预览 */}
            {editingImage.imageUrl && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  height: '200px',
                  background: colors.bgSecondary,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <img
                    src={editingImage.imageUrl}
                    alt="当前图片"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}

            {/* 提示词编辑 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                提示词
              </label>
              <TextArea
                value={editingImage.prompt}
                onChange={(e) => setEditingImage({ ...editingImage, prompt: e.target.value })}
                rows={4}
                placeholder="描述你想要的图片..."
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>

            {/* 风格预设 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '10px' }}>
                风格预设
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {STYLE_PRESETS.map((style) => (
                  <Tag
                    key={style.id}
                    style={{
                      padding: '8px 16px',
                      cursor: 'pointer',
                      background: colors.bgTertiary,
                      border: `1px solid ${colors.border}`,
                      color: colors.textPrimary,
                    }}
                    onClick={() => addStylePreset(style)}
                  >
                    {style.name}
                  </Tag>
                ))}
              </div>
            </div>

            {/* 模型选择 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                模型
              </label>
              <Select
                value={editingImage.model}
                onChange={(value) => setEditingImage({ ...editingImage, model: value })}
                style={{ width: '100%' }}
              >
                {IMAGE_MODELS.map((model) => (
                  <Option key={model.id} value={model.id}>
                    <Space>
                      <span>{model.icon}</span>
                      <span>{model.name}</span>
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>

            {/* 上传自定义图片 */}
            <div>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                上传自定义图片
              </label>
              <Upload {...uploadProps}>
                <Button
                  icon={<UploadOutlined />}
                  style={{
                    width: '100%',
                    height: '48px',
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    borderStyle: 'dashed',
                  }}
                >
                  点击或拖拽上传图片
                </Button>
              </Upload>
              <p style={{ color: colors.textTertiary, fontSize: '12px', marginTop: '8px' }}>
                支持 JPG、PNG、WebP 格式，最大 10MB
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ImageEditorPage;

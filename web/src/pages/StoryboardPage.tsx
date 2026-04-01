import React, { useState, useEffect, useRef } from 'react';
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
  Tooltip,
  Badge,
  Popconfirm,
  Tabs,
} from 'antd';
import ContextHelp from '../components/ContextHelp';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ClockCircleOutlined,
  CameraOutlined,
  SwapOutlined,
  BgColorsOutlined,
  VideoCameraOutlined,
  EyeOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { StoryboardPanel, Scene } from '../types';
import { generateId, formatDate } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 相机角度预设
const CAMERA_ANGLES = [
  '正面平视',
  '侧面视角',
  '斜侧面(45度)',
  '低角度仰拍',
  '高角度俯拍',
  '鸟瞰视角',
  '特写镜头',
  '中景镜头',
  '全景镜头',
  '远景镜头',
];

// 镜头运动预设
const CAMERA_MOVEMENTS = [
  '固定镜头',
  '推镜头',
  '拉镜头',
  '摇镜头(左/右)',
  '移镜头(上/下)',
  '跟镜头',
  '环绕镜头',
  '缩放镜头',
];

// 时间轴组件
const Timeline: React.FC<{
  panels: StoryboardPanel[];
  scenes: Scene[];
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}> = ({ panels, scenes, selectedPanelId, onSelectPanel, onReorder }) => {
  const [draggingPanel, setDraggingPanel] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggingPanel(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggingPanel !== null && draggingPanel !== dropIndex) {
      onReorder(draggingPanel, dropIndex);
    }
    setDraggingPanel(null);
  };

  const getSceneForPanel = (panel: StoryboardPanel): Scene | undefined => {
    return scenes.find((s) => s.id === panel.sceneId);
  };

  // 计算总时长
  const totalDuration = panels.reduce((total, panel) => {
    const match = panel.duration?.match(/(\d+)/);
    return total + (match ? parseInt(match[1]) : 3);
  }, 0);

  return (
    <div
      style={{
        background: colors.bgTertiary,
        borderRadius: '16px',
        padding: '20px',
        border: `1px solid ${colors.border}`,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <VideoCameraOutlined style={{ color: colors.primary, fontSize: '20px' }} />
          <span style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '16px' }}>
            时间轴
          </span>
        </div>
        <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success, border: 'none' }}>
          ⏱ 总时长: {totalDuration}秒
        </Tag>
      </div>

      {/* 时间刻度 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '12px',
        paddingLeft: '60px',
        position: 'relative',
      }}>
        {Array.from({ length: Math.min(Math.max(10, totalDuration), 60) }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: 'center',
              fontSize: '11px',
              color: colors.textTertiary,
              borderLeft: i === 0 ? `1px solid ${colors.borderLight}` : 'none',
            }}
          >
            {i}s
          </div>
        ))}
      </div>

      {/* 分镜条 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {panels.map((panel, index) => {
          const scene = getSceneForPanel(panel);
          const duration = (() => {
            const match = panel.duration?.match(/(\d+)/);
            return match ? parseInt(match[1]) : 3;
          })();
          const isSelected = selectedPanelId === panel.id;

          return (
            <div
              key={panel.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index)}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'move',
                opacity: draggingPanel === index ? 0.5 : 1,
              }}
            >
              {/* 分镜序号 */}
              <div style={{
                width: '50px',
                textAlign: 'right',
                paddingRight: '10px',
                fontSize: '13px',
                color: colors.textSecondary,
                fontWeight: 'bold',
              }}>
                #{panel.panelNumber}
              </div>

              {/* 分镜卡片 */}
              <div
                onClick={() => onSelectPanel(panel.id)}
                style={{
                  flex: '0 0 auto',
                  width: `${Math.min(Math.max(duration * 20, 100), 400)}px`,
                  padding: '12px',
                  background: isSelected
                    ? 'rgba(107, 63, 160, 0.3)'
                    : colors.bgSecondary,
                  borderRadius: '12px',
                  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.background = 'rgba(107, 63, 160, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.background = colors.bgSecondary;
                  }
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: gradientStyles.glow,
                    pointerEvents: 'none',
                    zIndex: 0,
                  }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: colors.textPrimary,
                    }}>
                      {scene?.title || `镜头 ${panel.panelNumber}`}
                    </span>
                    <Tag
                      size="small"
                      style={{
                        background: 'rgba(82, 196, 26, 0.2)',
                        color: colors.success,
                        border: 'none',
                      }}
                    >
                      ⏱ {panel.duration || '3秒'}
                    </Tag>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    lineHeight: '1.4',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {panel.description}
                  </div>
                  {panel.cameraAngle && (
                    <div style={{ marginTop: '6px' }}>
                      <Tag
                        size="small"
                        style={{
                          background: 'rgba(0, 212, 255, 0.15)',
                          color: colors.cyan,
                          border: 'none',
                          marginRight: '4px',
                        }}
                      >
                        🎥 {panel.cameraAngle}
                      </Tag>
                      {panel.movement && (
                        <Tag
                          size="small"
                          style={{
                            background: 'rgba(233, 30, 140, 0.15)',
                            color: colors.pink,
                            border: 'none',
                          }}
                        >
                          📽️ {panel.movement}
                        </Tag>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StoryboardPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPanel, setEditingPanel] = useState<StoryboardPanel | null>(null);
  const [panelModalVisible, setPanelModalVisible] = useState(false);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('grid');

  const storyboardPanels = currentProject?.storyboard || [];
  const scenes = currentProject?.script?.scenes || [];

  // 重新排序分镜
  const reorderPanels = (fromIndex: number, toIndex: number) => {
    if (!currentProject) return;

    const panels = [...storyboardPanels];
    const [movedPanel] = panels.splice(fromIndex, 1);
    panels.splice(toIndex, 0, movedPanel);

    // 重新编号
    const reorderedPanels = panels.map((p, i) => ({ ...p, panelNumber: i + 1 }));

    updateProject(currentProject.id, {
      storyboard: reorderedPanels,
    });
  };

  // 创建分镜
  const handleNewPanel = () => {
    setEditingPanel({
      id: generateId(),
      sceneId: scenes[0]?.id || '',
      panelNumber: storyboardPanels.length + 1,
      description: '',
      cameraAngle: '正面平视',
      movement: '固定镜头',
      duration: '3秒',
      notes: '',
      sketch: '',
    });
    setPanelModalVisible(true);
  };

  // 编辑分镜
  const handleEditPanel = (panel: StoryboardPanel) => {
    setEditingPanel({ ...panel });
    setSelectedPanelId(panel.id);
    setPanelModalVisible(true);
  };

  // 删除分镜
  const handleDeletePanel = (panelId: string) => {
    if (!currentProject) return;
    const newPanels = (currentProject.storyboard || [])
      .filter((p) => p.id !== panelId)
      .sort((a, b) => a.panelNumber - b.panelNumber)
      .map((p, i) => ({ ...p, panelNumber: i + 1 }));

    updateProject(currentProject.id, {
      storyboard: newPanels,
    });
    if (selectedPanelId === panelId) {
      setSelectedPanelId(null);
    }
    messageApi.success('分镜已删除');
  };

  // 移动分镜
  const handleMovePanel = (panelId: string, direction: 'up' | 'down') => {
    const index = storyboardPanels.findIndex((p) => p.id === panelId);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= storyboardPanels.length) return;
    reorderPanels(index, newIndex);
  };

  // 保存分镜
  const handleSavePanel = () => {
    if (!currentProject || !editingPanel) return;

    const isNewPanel = !storyboardPanels.some((p) => p.id === editingPanel.id);
    let newPanels: StoryboardPanel[];

    if (isNewPanel) {
      newPanels = [...storyboardPanels, editingPanel];
    } else {
      newPanels = storyboardPanels.map((p) =>
        p.id === editingPanel.id ? editingPanel : p
      );
    }

    // 重新排序号
    newPanels = newPanels
      .sort((a, b) => a.panelNumber - b.panelNumber)
      .map((p, i) => ({ ...p, panelNumber: i + 1 }));

    updateProject(currentProject.id, {
      storyboard: newPanels,
    });

    setPanelModalVisible(false);
    setEditingPanel(null);
    messageApi.success('分镜已保存');
  };

  // 自动生成分镜
  const generateStoryboard = async () => {
    if (!currentProject) return;

    setIsGenerating(true);

    try {
      const response = await api.generateStoryboard(
        currentProject.id,
        currentProject.script?.content || ''
      );

      if (response.success) {
        messageApi.success('分镜生成任务已提交');
      } else {
        throw new Error(response.error || '生成分镜失败');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 从场景生成分镜
  const generatePanelsFromScenes = () => {
    if (!currentProject || scenes.length === 0) {
      messageApi.warning('请先创建场景');
      return;
    }

    const newPanels: StoryboardPanel[] = scenes.map((scene, index) => ({
      id: generateId(),
      sceneId: scene.id,
      panelNumber: storyboardPanels.length + index + 1,
      description: scene.content,
      cameraAngle: '正面平视',
      movement: '固定镜头',
      duration: scene.duration || '3秒',
      notes: '',
      sketch: '',
    }));

    updateProject(currentProject.id, {
      storyboard: [...storyboardPanels, ...newPanels],
    });

    messageApi.success(`已从场景生成 ${newPanels.length} 个分镜`);
  };

  // 前往下一步
  const goToImageEditor = () => {
    if (!currentProject) return;

    if (!currentProject.storyboard || currentProject.storyboard.length === 0) {
      Modal.confirm({
        title: '警告',
        content: '当前没有分镜面板，是否需要自动生成？',
        okText: '从场景生成',
        cancelText: '稍后再说',
        onOk: generatePanelsFromScenes,
        centered: true,
      });
      return;
    }

    window.location.href = '#/image';
  };

  // 获取选中的分镜
  const selectedPanel = storyboardPanels.find((p) => p.id === selectedPanelId);

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {contextHolder}
      <ContextHelp topic="storyboard" type="inline" />

      {/* 时间轴 - 始终显示在顶部 */}
      {storyboardPanels.length > 0 && (
        <Card
          style={{
            marginBottom: '24px',
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '20px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <Timeline
            panels={[...storyboardPanels].sort((a, b) => a.panelNumber - b.panelNumber)}
            scenes={scenes}
            selectedPanelId={selectedPanelId}
            onSelectPanel={(id) => {
              setSelectedPanelId(id);
              const panel = storyboardPanels.find((p) => p.id === id);
              if (panel) {
                setEditingPanel({ ...panel });
                setPanelModalVisible(true);
              }
            }}
            onReorder={reorderPanels}
          />
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
        {/* 左侧：分镜编辑器 */}
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
                <span style={{ fontSize: '32px' }}>🎬</span>
                分镜编辑器
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
                {scenes.length > 0 && storyboardPanels.length === 0 && (
                  <Button
                    icon={<BgColorsOutlined />}
                    onClick={generatePanelsFromScenes}
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  >
                    从场景生成
                  </Button>
                )}
                <Button
                  icon={<PlusOutlined />}
                  onClick={handleNewPanel}
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  新建分镜
                </Button>
                <Button
                  type="primary"
                  onClick={generateStoryboard}
                  loading={isGenerating}
                  style={{
                    background: gradientStyles.primary,
                    border: 'none',
                  }}
                >
                  自动生成
                </Button>
              </Space>
            }
          >
            <Form layout="vertical">
              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>剧本概述</span>}
              >
                <TextArea
                  value={currentProject?.script?.content?.slice(0, 1000) || ''}
                  rows={3}
                  disabled
                  placeholder="剧本内容将显示在此处"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                />
              </Form.Item>

              <Divider style={{ borderColor: colors.borderLight, margin: '24px 0' }} />

              {/* 视图切换 */}
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

              {storyboardPanels.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: colors.textMuted,
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无分镜</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginBottom: '20px' }}>
                    点击"自动生成"根据剧本生成，或"新建分镜"手动创建
                  </div>
                  {scenes.length > 0 && (
                    <Button
                      type="primary"
                      icon={<BgColorsOutlined />}
                      onClick={generatePanelsFromScenes}
                      style={{
                        background: gradientStyles.primary,
                        border: 'none',
                      }}
                    >
                      从场景生成分镜
                    </Button>
                  )}
                </div>
              ) : activeTab === 'grid' ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}>
                  {[...storyboardPanels]
                    .sort((a, b) => a.panelNumber - b.panelNumber)
                    .map((panel) => {
                      const isSelected = selectedPanelId === panel.id;
                      const scene = scenes.find((s) => s.id === panel.sceneId);

                      return (
                        <Card
                          key={panel.id}
                          style={{
                            borderRadius: '16px',
                            border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                            transition: 'all 0.2s ease',
                            background: isSelected ? 'rgba(107, 63, 160, 0.1)' : colors.bgTertiary,
                            boxShadow: isSelected ? shadowStyles.purple : 'none',
                          }}
                          hoverable
                          onClick={() => setSelectedPanelId(panel.id)}
                          actions={[
                            <Tooltip title="上移">
                              <ArrowUpOutlined
                                style={{
                                  cursor: panel.panelNumber === 1 ? 'not-allowed' : 'pointer',
                                  color: panel.panelNumber === 1 ? colors.textMuted : colors.textSecondary,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (panel.panelNumber > 1) {
                                    handleMovePanel(panel.id, 'up');
                                  }
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="下移">
                              <ArrowDownOutlined
                                style={{
                                  cursor: panel.panelNumber === storyboardPanels.length ? 'not-allowed' : 'pointer',
                                  color: panel.panelNumber === storyboardPanels.length ? colors.textMuted : colors.textSecondary,
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (panel.panelNumber < storyboardPanels.length) {
                                    handleMovePanel(panel.id, 'down');
                                  }
                                }}
                              />
                            </Tooltip>,
                            <Tooltip title="编辑">
                              <EditOutlined
                                key="edit"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditPanel(panel);
                                }}
                                style={{ color: colors.textSecondary }}
                              />
                            </Tooltip>,
                            <Popconfirm
                              title="确认删除"
                              description="确定要删除这个分镜吗？"
                              onConfirm={() => handleDeletePanel(panel.id)}
                              okText="删除"
                              cancelText="取消"
                              okButtonProps={{ danger: true }}
                            >
                              <DeleteOutlined
                                key="delete"
                                style={{ color: colors.textMuted }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </Popconfirm>,
                          ]}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = colors.primary;
                              e.currentTarget.style.boxShadow = shadowStyles.purple;
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = colors.border;
                              e.currentTarget.style.boxShadow = 'none';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }
                          }}
                        >
                          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                            <Space size="small">
                              <Tag
                                color={colors.primary}
                                style={{
                                  background: 'rgba(107, 63, 160, 0.3)',
                                  fontSize: '14px',
                                  padding: '4px 12px',
                                }}
                              >
                                第 {panel.panelNumber} 镜
                              </Tag>
                              {scene && (
                                <Tag
                                  style={{
                                    background: 'rgba(0, 212, 255, 0.2)',
                                    color: colors.cyan,
                                    border: 'none',
                                  }}
                                >
                                  📍 {scene.title}
                                </Tag>
                              )}
                            </Space>
                          </div>

                          <div style={{
                            height: '180px',
                            backgroundColor: colors.bgSecondary,
                            borderRadius: '12px',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                          }}>
                            {panel.sketch ? (
                              <img
                                src={panel.sketch}
                                alt="分镜草图"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: '12px',
                                }}
                              />
                            ) : (
                              <div style={{ textAlign: 'center', color: colors.textMuted }}>
                                <div style={{ fontSize: '48px', marginBottom: '8px' }}>✏️</div>
                                <div style={{ fontSize: '12px' }}>未生成草图</div>
                              </div>
                            )}
                          </div>

                          <div style={{ fontSize: '14px', marginBottom: '8px', color: colors.textPrimary }}>
                            {panel.description.slice(0, 60) + (panel.description.length > 60 ? '...' : '')}
                          </div>

                          <Space wrap style={{ fontSize: '12px' }}>
                            {panel.cameraAngle && (
                              <Tag
                                color={colors.primary}
                                style={{ background: 'rgba(107, 63, 160, 0.2)' }}
                              >
                                🎥 {panel.cameraAngle}
                              </Tag>
                            )}
                            {panel.movement && (
                              <Tag
                                color={colors.pink}
                                style={{ background: 'rgba(233, 30, 140, 0.2)' }}
                              >
                                📽️ {panel.movement}
                              </Tag>
                            )}
                            {panel.duration && (
                              <Tag
                                color={colors.success}
                                style={{ background: 'rgba(82, 196, 26, 0.2)' }}
                              >
                                ⏱ {panel.duration}
                              </Tag>
                            )}
                          </Space>
                        </Card>
                      );
                    })}
                </div>
              ) : (
                <List
                  dataSource={[...storyboardPanels].sort((a, b) => a.panelNumber - b.panelNumber)}
                  renderItem={(panel) => {
                    const isSelected = selectedPanelId === panel.id;
                    const scene = scenes.find((s) => s.id === panel.sceneId);

                    return (
                      <List.Item
                        style={{
                          padding: '16px',
                          background: isSelected ? 'rgba(107, 63, 160, 0.1)' : colors.bgTertiary,
                          borderRadius: '12px',
                          marginBottom: '8px',
                          border: `2px solid ${isSelected ? colors.primary : colors.border}`,
                        }}
                        actions={[
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setSelectedPanelId(panel.id)}
                          />,
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditPanel(panel)}
                          />,
                          <Popconfirm
                            title="确认删除"
                            description="确定要删除这个分镜吗？"
                            onConfirm={() => handleDeletePanel(panel.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '12px',
                              background: 'rgba(107, 63, 160, 0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '24px',
                              fontWeight: 'bold',
                              color: colors.primary,
                            }}>
                              #{panel.panelNumber}
                            </div>
                          }
                          title={
                            <Space>
                              <span style={{ color: colors.textPrimary, fontWeight: 600 }}>
                                {scene?.title || `分镜 ${panel.panelNumber}`}
                              </span>
                              {panel.duration && (
                                <Tag
                                  style={{
                                    background: 'rgba(82, 196, 26, 0.2)',
                                    color: colors.success,
                                    border: 'none',
                                  }}
                                >
                                  ⏱ {panel.duration}
                                </Tag>
                              )}
                            </Space>
                          }
                          description={
                            <div>
                              <div style={{ color: colors.textSecondary, fontSize: '13px', lineHeight: '1.6' }}>
                                {panel.description}
                              </div>
                              <Space size="small" style={{ marginTop: '8px' }}>
                                {panel.cameraAngle && (
                                  <Tag size="small" style={{ background: 'rgba(0, 212, 255, 0.2)', color: colors.cyan, border: 'none' }}>
                                    🎥 {panel.cameraAngle}
                                  </Tag>
                                )}
                                {panel.movement && (
                                  <Tag size="small" style={{ background: 'rgba(233, 30, 140, 0.2)', color: colors.pink, border: 'none' }}>
                                    📽️ {panel.movement}
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
            </Form>
          </Card>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              icon={<LeftOutlined />}
              size="large"
              href="#/script"
              style={{
                background: 'transparent',
                borderColor: colors.border,
                color: colors.textSecondary,
                height: '48px',
                padding: '0 24px',
                borderRadius: '12px',
              }}
            >
              回到剧本
            </Button>
            <Button
              type="primary"
              icon={<RightOutlined />}
              size="large"
              onClick={goToImageEditor}
              disabled={storyboardPanels.length === 0}
              style={{
                background: gradientStyles.success,
                border: 'none',
                height: '48px',
                padding: '0 28px',
                borderRadius: '12px',
                fontWeight: 500,
              }}
            >
              下一步：画面绘制 →
            </Button>
          </div>
        </div>

        {/* 右侧：详细面板 */}
        <div>
          {selectedPanel ? (
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CameraOutlined />
                  <span>分镜详情 # {selectedPanel.panelNumber}</span>
                </div>
              }
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
              extra={
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEditPanel(selectedPanel)}
                />
              }
            >
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                  分镜描述
                </div>
                <div style={{ color: colors.textPrimary, lineHeight: '1.6' }}>
                  {selectedPanel.description}
                </div>
              </div>

              <Divider style={{ borderColor: colors.borderLight, margin: '16px 0' }} />

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '12px' }}>相机角度</span>
                  <Tag style={{ background: 'rgba(0, 212, 255, 0.2)', color: colors.cyan, border: 'none' }}>
                    {selectedPanel.cameraAngle || '未设置'}
                  </Tag>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '12px' }}>镜头运动</span>
                  <Tag style={{ background: 'rgba(233, 30, 140, 0.2)', color: colors.pink, border: 'none' }}>
                    {selectedPanel.movement || '未设置'}
                  </Tag>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '12px' }}>镜头时长</span>
                  <Tag style={{ background: 'rgba(82, 196, 26, 0.2)', color: colors.success, border: 'none' }}>
                    {selectedPanel.duration || '3秒'}
                  </Tag>
                </div>
              </div>

              {selectedPanel.notes && (
                <>
                  <Divider style={{ borderColor: colors.borderLight, margin: '16px 0' }} />
                  <div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '4px' }}>
                      备注
                    </div>
                    <div style={{ color: colors.textTertiary, fontSize: '13px', lineHeight: '1.6' }}>
                      {selectedPanel.notes}
                    </div>
                  </div>
                </>
              )}
            </Card>
          ) : (
            <Card
              title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>场景列表</span>}
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
              {scenes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: colors.textMuted }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
                  <div>暂无场景</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    请先在剧本编辑器中创建场景
                  </div>
                </div>
              ) : (
                <List
                  dataSource={scenes}
                  renderItem={(scene) => (
                    <List.Item
                      style={{
                        padding: '12px',
                        background: colors.bgTertiary,
                        borderRadius: '12px',
                        marginBottom: '8px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.bgSecondary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.bgTertiary;
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Tag style={{ background: 'rgba(107, 63, 160, 0.3)', color: colors.primary, border: 'none' }}>
                              #{scene.number}
                            </Tag>
                            <span style={{ color: colors.textPrimary }}>
                              {scene.title || '未命名场景'}
                            </span>
                          </Space>
                        }
                        description={
                          <div>
                            <div style={{
                              fontSize: '12px',
                              color: colors.textSecondary,
                            }}>
                              {scene.content?.slice(0, 40) || '无描述'}
                              {scene.content?.length > 40 ? '...' : ''}
                            </div>
                            {scene.duration && (
                              <Tag
                                style={{
                                  marginTop: '4px',
                                  background: 'rgba(82, 196, 26, 0.2)',
                                  color: colors.success,
                                  border: 'none',
                                }}
                              >
                                ⏱ {scene.duration}
                              </Tag>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          )}

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>分镜统计</span>}
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
              <span>总分镜数：</span>
              <span style={{ fontWeight: 'bold' }}>{storyboardPanels.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>有草图：</span>
              <span style={{ fontWeight: 'bold' }}>
                {storyboardPanels.filter((p) => p.sketch).length}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              color: colors.textPrimary,
            }}>
              <span>预估总时长：</span>
              <span style={{ fontWeight: 'bold' }}>
                {storyboardPanels.reduce((total, panel) => {
                  const match = panel.duration?.match(/(\d+)/);
                  return total + (match ? parseInt(match[1]) : 3);
                }, 0)} 秒
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* 编辑分镜弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <span style={{ fontSize: '24px' }}>🎬</span>
            {editingPanel?.panelNumber ? `编辑分镜 #${editingPanel.panelNumber}` : '新建分镜'}
          </div>
        }
        open={panelModalVisible}
        onOk={handleSavePanel}
        onCancel={() => {
          setPanelModalVisible(false);
          setEditingPanel(null);
        }}
        width={700}
        okText="保存"
        cancelText="取消"
        centered={true}
        style={{ top: '20px' }}
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
        {editingPanel && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                所属场景
              </label>
              <Select
                size="large"
                value={editingPanel.sceneId}
                style={{
                  width: '100%',
                  background: colors.bgTertiary,
                }}
                onChange={(value) =>
                  setEditingPanel({ ...editingPanel, sceneId: value })
                }
              >
                {scenes.map((scene) => (
                  <Option key={scene.id} value={scene.id}>
                    #{scene.number} {scene.title || '未命名场景'}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                分镜描述
              </label>
              <TextArea
                value={editingPanel.description}
                onChange={(e) =>
                  setEditingPanel({ ...editingPanel, description: e.target.value })
                }
                rows={4}
                placeholder="详细描述这个镜头的内容"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  镜头视角
                </label>
                <Select
                  size="large"
                  value={editingPanel.cameraAngle}
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    setEditingPanel({ ...editingPanel, cameraAngle: value })
                  }
                  showSearch
                  placeholder="选择或输入"
                  allowClear
                >
                  {CAMERA_ANGLES.map((angle) => (
                    <Option key={angle} value={angle}>{angle}</Option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  镜头运动
                </label>
                <Select
                  size="large"
                  value={editingPanel.movement}
                  style={{ width: '100%' }}
                  onChange={(value) =>
                    setEditingPanel({ ...editingPanel, movement: value })
                  }
                  showSearch
                  placeholder="选择或输入"
                  allowClear
                >
                  {CAMERA_MOVEMENTS.map((movement) => (
                    <Option key={movement} value={movement}>{movement}</Option>
                  ))}
                </Select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  镜头时长
                </label>
                <Input
                  value={editingPanel.duration}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, duration: e.target.value })
                  }
                  placeholder="例如：3秒"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  备注
                </label>
                <Input
                  value={editingPanel.notes || ''}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, notes: e.target.value })
                  }
                  placeholder="其他备注信息"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StoryboardPage;

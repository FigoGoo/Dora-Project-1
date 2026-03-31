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
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { StoryboardPanel } from '../types';
import { generateId } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;

const StoryboardPage: React.FC = () => {
  const { currentProject, updateProject, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingPanel, setEditingPanel] = useState<StoryboardPanel | null>(null);
  const [panelModalVisible, setPanelModalVisible] = useState(false);

  const storyboardPanels = currentProject?.storyboard || [];

  // 创建分镜
  const handleNewPanel = () => {
    setEditingPanel({
      id: generateId(),
      sceneId: currentProject?.script?.scenes[0]?.id || '',
      panelNumber: storyboardPanels.length + 1,
      description: '',
      cameraAngle: '',
      movement: '',
      duration: '',
      notes: '',
      sketch: '',
    });
    setPanelModalVisible(true);
  };

  // 编辑分镜
  const handleEditPanel = (panel: StoryboardPanel) => {
    setEditingPanel({ ...panel });
    setPanelModalVisible(true);
  };

  // 删除分镜
  const handleDeletePanel = (panelId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个分镜吗？',
      onOk: () => {
        if (!currentProject) return;
        const newPanels = (currentProject.storyboard || []).filter(
          (p) => p.id !== panelId
        );
        updateProject(currentProject.id, {
          storyboard: newPanels,
        });
      },
      centered: true,
    });
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

  // 前往下一步
  const goToImageEditor = () => {
    if (!currentProject) return;

    // 如果没有分镜，提示用户生成
    if (!currentProject.storyboard || currentProject.storyboard.length === 0) {
      Modal.confirm({
        title: '警告',
        content: '当前没有分镜面板，是否需要自动生成？',
        okText: '生成分镜',
        cancelText: '稍后再说',
        onOk: generateStoryboard,
        centered: true,
      });
      return;
    }

    // 保存并前往下一步
    window.location.href = '#/image';
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {contextHolder}
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

              <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

              {storyboardPanels.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: colors.textMuted,
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无分镜</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted }}>
                    点击"自动生成"按钮根据剧本生成，或"新建分镜"手动创建
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px',
                }}>
                  {storyboardPanels.map((panel) => (
                    <Card
                      key={panel.id}
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
                          onClick={() => handleEditPanel(panel)}
                          style={{ color: colors.textSecondary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textSecondary;
                          }}
                        />,
                        <DeleteOutlined
                          key="delete"
                          onClick={() => handleDeletePanel(panel.id)}
                          style={{ color: colors.textMuted }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = colors.error;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = colors.textMuted;
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
                        <Tag
                          color={colors.primary}
                          style={{
                            background: 'rgba(107, 63, 160, 0.2)',
                            fontSize: '14px',
                            padding: '4px 12px',
                          }}
                        >
                          第 {panel.panelNumber} 镜
                        </Tag>
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
                  ))}
                </div>
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

        {/* 右侧：场景列表 */}
        <div>
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>场景列表</span>}
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
              dataSource={currentProject?.script?.scenes || []}
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
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>分镜状态</span>}
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
              <span>总面板数：</span>
              <span>{storyboardPanels.length}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>已完成：</span>
              <span>0</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>平均镜头时长：</span>
              <span>0秒</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              color: colors.textPrimary,
            }}>
              <span>预估总时长：</span>
              <span>0秒</span>
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
          <Form layout="vertical">
            <Form.Item
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>所属场景</span>}
            >
              <Select
                size="large"
                value={editingPanel.sceneId}
                style={{
                  width: '100%',
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
                onChange={(value) =>
                  setEditingPanel({ ...editingPanel, sceneId: value })
                }
              >
                {currentProject?.script?.scenes.map((scene) => (
                  <Select.Option key={scene.id} value={scene.id}>
                    #{scene.number} {scene.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>分镜描述</span>}
            >
              <TextArea
                value={editingPanel.description}
                onChange={(e) =>
                  setEditingPanel({ ...editingPanel, description: e.target.value })
                }
                rows={3}
                placeholder="详细描述这个镜头的内容"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>镜头视角</span>}
              >
                <Input
                  value={editingPanel.cameraAngle}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, cameraAngle: e.target.value })
                  }
                  placeholder="例如：低角度仰拍"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>镜头运动</span>}
              >
                <Input
                  value={editingPanel.movement}
                  onChange={(e) =>
                    setEditingPanel({ ...editingPanel, movement: e.target.value })
                  }
                  placeholder="例如：推镜头"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>镜头时长</span>}
              >
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
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>备注</span>}
              >
                <Input
                  value={editingPanel.notes}
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
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default StoryboardPage;

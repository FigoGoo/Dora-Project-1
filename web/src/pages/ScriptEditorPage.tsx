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
  Typography,
  Tag,
  Modal,
} from 'antd';
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { Scene } from '../types';
import { generateId } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;

const ScriptEditorPage: React.FC = () => {
  const { currentProject, updateProject, setLoading, setError } = useAppStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [sceneModalVisible, setSceneModalVisible] = useState(false);

  const scenes = currentProject?.script?.scenes || [];

  // 初始化表单数据
  useEffect(() => {
    if (currentProject && currentProject.script) {
      form.setFieldsValue({
        title: currentProject.script.title,
        content: currentProject.script.content,
      });
    }
  }, [currentProject, form]);

  // 保存剧本
  const saveScript = (values: any) => {
    if (!currentProject) return;

    try {
      setLoading(true);
      updateProject(currentProject.id, {
        status: 'script',
        script: {
          title: values.title || '未命名剧本',
          content: values.content || '',
          scenes: currentProject.script?.scenes || [],
        },
      });
      messageApi.success('剧本已保存');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 重新生成剧本
  const regenerateScript = async () => {
    if (!currentProject) return;

    setIsGenerating(true);

    try {
      const response = await api.generateScript(
        currentProject.id,
        currentProject.inspiration?.description || '',
        currentProject.inspiration?.model || 'deepseek'
      );

      if (response.success) {
        messageApi.success('剧本重新生成中，请稍后...');
      } else {
        throw new Error(response.error || '生成剧本失败');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 新建场景
  const handleNewScene = () => {
    setEditingScene({
      id: generateId(),
      number: scenes.length + 1,
      title: '',
      content: '',
      duration: '5秒',
      location: '',
      characters: [],
    });
    setSceneModalVisible(true);
  };

  // 编辑场景
  const handleEditScene = (scene: Scene) => {
    setEditingScene({ ...scene });
    setSceneModalVisible(true);
  };

  // 删除场景
  const handleDeleteScene = (sceneId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个场景吗？',
      onOk: () => {
        if (!currentProject) return;
        const newScenes = (currentProject.script?.scenes || []).filter(
          (s) => s.id !== sceneId
        );
        updateProject(currentProject.id, {
          script: {
            ...currentProject.script!,
            scenes: newScenes,
          },
        });
      },
      centered: true,
    });
  };

  // 保存场景
  const handleSaveScene = () => {
    if (!currentProject || !editingScene) return;

    const isNewScene = !scenes.some((s) => s.id === editingScene.id);
    let newScenes: Scene[];

    if (isNewScene) {
      newScenes = [...scenes, editingScene];
    } else {
      newScenes = scenes.map((s) =>
        s.id === editingScene.id ? editingScene : s
      );
    }

    // 重新排序号
    newScenes = newScenes
      .sort((a, b) => a.number - b.number)
      .map((s, i) => ({ ...s, number: i + 1 }));

    updateProject(currentProject.id, {
      script: {
        ...currentProject.script!,
        scenes: newScenes,
      },
    });

    setSceneModalVisible(false);
    setEditingScene(null);
    messageApi.success('场景已保存');
  };

  // 前往下一步
  const goToStoryboard = async () => {
    if (!currentProject) return;

    // 先保存
    const values = form.getFieldsValue();
    saveScript(values);

    // 如果没有场景，自动根据内容生成分镜
    if (!currentProject.script?.scenes || currentProject.script.scenes.length === 0) {
      setIsGenerating(true);
      try {
        const response = await api.generateStoryboard(
          currentProject.id,
          currentProject.script?.content || ''
        );
        if (response.success) {
          messageApi.success('生成分镜任务已提交');
        } else {
          throw new Error(response.error || '生成分镜失败');
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {contextHolder}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* 左侧：剧本编辑器 */}
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
                <span style={{ fontSize: '32px' }}>📝</span>
                剧本编辑器
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
              <Space>
                <Button
                  onClick={regenerateScript}
                  loading={isGenerating}
                  icon={<ReloadOutlined />}
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                >
                  🔄 重新生成
                </Button>
              </Space>
            }
          >
            <Form form={form} layout="vertical" onFinish={saveScript}>
              <Form.Item
                name="title"
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>剧本标题</span>}
              >
                <Input
                  placeholder="输入剧本标题"
                  size="large"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="content"
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>剧本内容</span>}
              >
                <TextArea
                  rows={20}
                  placeholder="在此编写你的剧本..."
                  style={{
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '14px',
                    lineHeight: '1.8',
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>

              <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

              <Form.Item>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button
                    icon={<LeftOutlined />}
                    size="large"
                    href="#/inspiration"
                    style={{
                      background: 'transparent',
                      borderColor: colors.border,
                      color: colors.textSecondary,
                      height: '48px',
                      padding: '0 24px',
                      borderRadius: '12px',
                    }}
                  >
                    返回灵感
                  </Button>
                  <Space size="middle">
                    <Button
                      icon={<SaveOutlined />}
                      size="large"
                      type="primary"
                      htmlType="submit"
                      style={{
                        background: colors.bgTertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        height: '48px',
                        padding: '0 24px',
                        borderRadius: '12px',
                      }}
                    >
                      保存剧本
                    </Button>
                    <Button
                      icon={<RightOutlined />}
                      size="large"
                      type="primary"
                      href="#/storyboard"
                      onClick={goToStoryboard}
                      style={{
                        background: gradientStyles.success,
                        border: 'none',
                        height: '48px',
                        padding: '0 28px',
                        borderRadius: '12px',
                        fontWeight: 500,
                      }}
                    >
                      前往分镜 →
                    </Button>
                  </Space>
                </div>
              </Form.Item>
            </Form>
          </Card>
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            bodyStyle={{
              padding: '24px',
            }}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleNewScene}
                style={{
                  background: gradientStyles.primary,
                  border: 'none',
                  borderRadius: '8px',
                }}
              >
                新增
              </Button>
            }
          >
            {scenes.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                color: colors.textMuted,
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无场景</div>
                <div style={{ fontSize: '13px', color: colors.textMuted }}>
                  点击"新增"按钮添加场景，或前往下一步自动生成
                </div>
              </div>
            ) : (
              <List
                dataSource={scenes}
                renderItem={(scene) => (
                  <List.Item
                    actions={[
                      <EditOutlined
                        key="edit"
                        style={{ cursor: 'pointer', color: colors.textSecondary }}
                        onClick={() => handleEditScene(scene)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.textSecondary;
                        }}
                      />,
                      <DeleteOutlined
                        key="delete"
                        style={{ cursor: 'pointer', color: colors.textMuted }}
                        onClick={() => handleDeleteScene(scene.id)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = colors.error;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = colors.textMuted;
                        }}
                      />,
                    ]}
                    style={{
                      padding: '16px',
                      borderBottom: `1px solid ${colors.borderLight}`,
                      borderRadius: '12px',
                      marginBottom: '8px',
                      background: colors.bgTertiary,
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
                          <Tag
                            color={colors.primary}
                            style={{ background: 'rgba(107, 63, 160, 0.2)' }}
                          >
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
                            fontSize: '13px',
                            color: colors.textSecondary,
                            marginTop: '4px',
                            lineHeight: '1.6',
                          }}>
                            {scene.content?.slice(0, 60) || '无描述'}
                            {scene.content?.length > 60 ? '...' : ''}
                          </div>
                          {scene.duration && (
                            <Tag
                              style={{
                                marginTop: '8px',
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
            )}
          </Card>
        </div>
      </div>

      {/* 编辑场景弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <span style={{ fontSize: '24px' }}>📝</span>
            {editingScene?.number ? `编辑场景 #${editingScene.number}` : '新建场景'}
          </div>
        }
        open={sceneModalVisible}
        onOk={handleSaveScene}
        onCancel={() => {
          setSceneModalVisible(false);
          setEditingScene(null);
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
        {editingScene && (
          <Form layout="vertical">
            <Form.Item
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>场景标题</span>}
            >
              <Input
                value={editingScene.title}
                onChange={(e) =>
                  setEditingScene({ ...editingScene, title: e.target.value })
                }
                placeholder="输入场景标题"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>场景内容</span>}
            >
              <TextArea
                value={editingScene.content}
                onChange={(e) =>
                  setEditingScene({ ...editingScene, content: e.target.value })
                }
                rows={6}
                placeholder="输入场景内容描述"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>时长</span>}
              >
                <Input
                  value={editingScene.duration}
                  onChange={(e) =>
                    setEditingScene({ ...editingScene, duration: e.target.value })
                  }
                  placeholder="例如：5秒"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>地点</span>}
              >
                <Input
                  value={editingScene.location || ''}
                  onChange={(e) =>
                    setEditingScene({ ...editingScene, location: e.target.value })
                  }
                  placeholder="场景地点"
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                  }}
                />
              </Form.Item>
            </div>

            <Form.Item
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>角色</span>}
            >
              <Input
                value={editingScene.characters?.join(', ') || ''}
                onChange={(e) =>
                  setEditingScene({
                    ...editingScene,
                    characters: e.target.value.split(',').map((s) => s.trim()),
                  })
                }
                placeholder="多个角色用逗号分隔"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ScriptEditorPage;

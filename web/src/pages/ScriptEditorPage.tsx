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
  Tabs,
  Tooltip,
  Popconfirm,
  Badge,
} from 'antd';
import ContextHelp from '../components/ContextHelp';
import {
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
  ReloadOutlined,
  HistoryOutlined,
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  OrderedListOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  RollbackOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { Scene, ScriptVersion } from '../types';
import { generateId, formatDate, debounce } from '../utils';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { TextArea } = Input;
const { TabPane } = Tabs;

// 富文本工具栏按钮
const RichTextToolbar: React.FC<{
  onAction: (action: string) => void;
}> = ({ onAction }) => {
  const toolbarButtons = [
    { key: 'bold', icon: <BoldOutlined />, label: '加粗' },
    { key: 'italic', icon: <ItalicOutlined />, label: '斜体' },
    { key: 'underline', icon: <UnderlineOutlined />, label: '下划线' },
    { key: 'bullet', icon: <UnorderedListOutlined />, label: '无序列表' },
    { key: 'number', icon: <OrderedListOutlined />, label: '有序列表' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '8px 12px',
        background: colors.bgTertiary,
        borderRadius: '12px 12px 0 0',
        border: `1px solid ${colors.border}`,
        borderBottom: 'none',
      }}
    >
      {toolbarButtons.map((btn) => (
        <Tooltip key={btn.key} title={btn.label}>
          <Button
            type="text"
            size="small"
            icon={btn.icon}
            onClick={() => onAction(btn.key)}
            style={{
              color: colors.textSecondary,
              width: '32px',
              height: '32px',
              borderRadius: '8px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.bgSecondary;
              e.currentTarget.style.color = colors.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.textSecondary;
            }}
          />
        </Tooltip>
      ))}
    </div>
  );
};

const ScriptEditorPage: React.FC = () => {
  const {
    currentProject,
    updateProject,
    setLoading,
    setError,
    saveScriptVersion,
    restoreScriptVersion,
    deleteScriptVersion,
    getScriptVersions,
    addScene,
    updateScene,
    deleteScene,
    reorderScenes,
  } = useAppStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [sceneModalVisible, setSceneModalVisible] = useState(false);
  const [versionModalVisible, setVersionModalVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('script');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const scenes = currentProject?.script?.scenes || [];
  const versions = getScriptVersions();

  // 初始化表单数据
  useEffect(() => {
    if (currentProject && currentProject.script) {
      form.setFieldsValue({
        title: currentProject.script.title,
        content: currentProject.script.content,
      });
    }
  }, [currentProject, form]);

  // 自动保存函数 - 防抖
  const autoSave = debounce(async (values: any) => {
    if (!currentProject) return;
    try {
      setIsAutoSaving(true);
      saveScriptInternal(values);
      setLastSavedAt(Date.now());
    } catch (error) {
      console.error('自动保存失败:', error);
    } finally {
      setTimeout(() => setIsAutoSaving(false), 500);
    }
  }, 2000);

  // 保存剧本内部方法
  const saveScriptInternal = (values: any) => {
    if (!currentProject) return;

    updateProject(currentProject.id, {
      status: 'script',
      script: {
        title: values.title || '未命名剧本',
        content: values.content || '',
        scenes: currentProject.script?.scenes || [],
        versions: currentProject.script?.versions || [],
        currentVersion: currentProject.script?.currentVersion,
      },
    });
  };

  // 保存剧本
  const saveScript = (values: any) => {
    if (!currentProject) return;

    try {
      setLoading(true);
      saveScriptInternal(values);
      messageApi.success('剧本已保存');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 保存为新版本
  const saveAsNewVersion = () => {
    Modal.confirm({
      title: '保存为新版本',
      content: (
        <div>
          <p style={{ color: colors.textSecondary, marginBottom: '16px' }}>
            请描述这次修改的内容：
          </p>
          <Input.TextArea
            id="version-description"
            rows={3}
            placeholder="例如：调整第二场对话、修改结局..."
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          />
        </div>
      ),
      okText: '保存版本',
      cancelText: '取消',
      onOk: () => {
        const description = (document.getElementById('version-description') as HTMLTextAreaElement)?.value;
        saveScriptVersion(description || '未备注');
        messageApi.success('版本已保存');
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

  // 恢复版本
  const handleRestoreVersion = (version: ScriptVersion) => {
    Modal.confirm({
      title: '确认恢复',
      content: (
        <div>
          <p style={{ color: colors.textPrimary }}>
            确定要恢复到版本 <strong>v{version.versionNumber}</strong> 吗？
          </p>
          <p style={{ color: colors.textSecondary, fontSize: '13px', marginTop: '8px' }}>
            提示：当前内容会自动保存为新版本
          </p>
        </div>
      ),
      okText: '恢复',
      cancelText: '取消',
      onOk: () => {
        // 先保存当前版本
        saveScriptVersion('自动保存：恢复前版本');
        // 再恢复目标版本
        restoreScriptVersion(version.id);
        messageApi.success('已恢复到该版本');
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

  // 查看版本
  const viewVersion = (version: ScriptVersion) => {
    setSelectedVersion(version);
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
    deleteScene(sceneId);
    messageApi.success('场景已删除');
  };

  // 移动场景
  const handleMoveScene = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= scenes.length) return;
    reorderScenes(index, newIndex);
  };

  // 保存场景
  const handleSaveScene = () => {
    if (!currentProject || !editingScene) return;

    const isNewScene = !scenes.some((s) => s.id === editingScene.id);

    if (isNewScene) {
      addScene(editingScene);
    } else {
      updateScene(editingScene.id, editingScene);
    }

    setSceneModalVisible(false);
    setEditingScene(null);
    messageApi.success('场景已保存');
  };

  // 富文本操作
  const handleRichTextAction = (action: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let replacement = '';
    switch (action) {
      case 'bold':
        replacement = `**${selectedText || '加粗文字'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || '斜体文字'}*`;
        break;
      case 'underline':
        replacement = `__${selectedText || '下划线文字'}__`;
        break;
      case 'bullet':
        replacement = `\n- ${selectedText || '列表项'}`;
        break;
      case 'number':
        replacement = `\n1. ${selectedText || '列表项'}`;
        break;
    }

    const newValue =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    form.setFieldValue('content', newValue);

    // 更新选择位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + replacement.length,
        start + replacement.length
      );
    }, 0);
  };

  // 表单变化处理
  const handleValuesChange = (_changedValues: any, allValues: any) => {
    if (currentProject) {
      autoSave(allValues);
    }
  };

  // 前往下一步
  const goToStoryboard = async () => {
    if (!currentProject) return;

    // 先保存
    const values = form.getFieldsValue();
    saveScript(values);
    window.location.href = '#/storyboard';
  };

  return (
    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
      {contextHolder}
      <ContextHelp topic="script" type="inline" />
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
              <Space size="middle">
                <Badge dot={versions.length > 0}>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setVersionModalVisible(true)}
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                    }}
                  >
                    版本历史 ({versions.length})
                  </Button>
                </Badge>
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
                  重新生成
                </Button>
              </Space>
            }
          >
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'script',
                  label: (
                    <span>
                      📖 剧本编辑
                    </span>
                  ),
                },
                {
                  key: 'scenes',
                  label: (
                    <span>
                      🎬 场景列表
                      {scenes.length > 0 && (
                        <Tag
                          size="small"
                          style={{
                            marginLeft: '8px',
                            background: 'rgba(107, 63, 160, 0.3)',
                            color: colors.primary,
                            border: 'none',
                          }}
                        >
                          {scenes.length}
                        </Tag>
                      )}
                    </span>
                  ),
                },
              ]}
              style={{ marginBottom: '24px' }}
            />

            {activeTab === 'script' ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={saveScript}
                onValuesChange={handleValuesChange}
              >
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
                  <>
                    <RichTextToolbar onAction={handleRichTextAction} />
                    <TextArea
                      ref={textAreaRef}
                      rows={20}
                      placeholder="在此编写你的剧本...&#10;&#10;支持富文本格式：&#10;**加粗** *斜体* __下划线__&#10;- 无序列表&#10;1. 有序列表"
                      style={{
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        fontSize: '14px',
                        lineHeight: '1.8',
                        background: colors.bgTertiary,
                        borderColor: colors.border,
                        color: colors.textPrimary,
                        borderRadius: '0 0 12px 12px',
                        marginTop: '-1px',
                      }}
                    />
                  </>
                </Form.Item>

                {/* 自动保存状态 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '8px',
                  marginBottom: '16px',
                }}>
                  {isAutoSaving ? (
                    <>
                      <ClockCircleOutlined spin style={{ color: colors.primary }} />
                      <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                        自动保存中...
                      </span>
                    </>
                  ) : lastSavedAt ? (
                    <>
                      <span style={{ color: colors.success, fontSize: '12px' }}>✓</span>
                      <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                        已保存 {formatDate(lastSavedAt)}
                      </span>
                    </>
                  ) : null}
                </div>

                <Divider style={{ borderColor: colors.borderLight, margin: '24px 0' }} />

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
                        onClick={saveAsNewVersion}
                        style={{
                          background: colors.bgTertiary,
                          borderColor: colors.border,
                          color: colors.textPrimary,
                          height: '48px',
                          padding: '0 24px',
                          borderRadius: '12px',
                        }}
                      >
                        保存版本
                      </Button>
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
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleNewScene}
                    style={{
                      background: gradientStyles.primary,
                      border: 'none',
                    }}
                  >
                    添加场景
                  </Button>
                </div>

                {scenes.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 40px',
                    color: colors.textMuted,
                  }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>暂无场景</div>
                    <div style={{ fontSize: '13px', color: colors.textMuted }}>
                      点击"添加场景"按钮手动创建
                    </div>
                  </div>
                ) : (
                  <List
                    dataSource={[...scenes].sort((a, b) => a.number - b.number)}
                    renderItem={(scene, index) => (
                      <Card
                        key={scene.id}
                        size="small"
                        style={{
                          marginBottom: '12px',
                          background: colors.bgTertiary,
                          border: `1px solid ${colors.border}`,
                          borderRadius: '12px',
                        }}
                        actions={[
                          <Tooltip title="上移">
                            <ArrowUpOutlined
                              style={{
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                color: index === 0 ? colors.textMuted : colors.textSecondary,
                              }}
                              onClick={() => index > 0 && handleMoveScene(index, 'up')}
                            />
                          </Tooltip>,
                          <Tooltip title="下移">
                            <ArrowDownOutlined
                              style={{
                                cursor: index === scenes.length - 1 ? 'not-allowed' : 'pointer',
                                color: index === scenes.length - 1 ? colors.textMuted : colors.textSecondary,
                              }}
                              onClick={() => index < scenes.length - 1 && handleMoveScene(index, 'down')}
                            />
                          </Tooltip>,
                          <Tooltip title="编辑">
                            <EditOutlined
                              style={{ cursor: 'pointer', color: colors.textSecondary }}
                              onClick={() => handleEditScene(scene)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            title="确认删除"
                            description="确定要删除这个场景吗？"
                            onConfirm={() => handleDeleteScene(scene.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <DeleteOutlined
                              style={{ cursor: 'pointer', color: colors.textMuted }}
                            />
                          </Popconfirm>,
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: 'rgba(107, 63, 160, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '20px',
                                color: colors.primary,
                                fontWeight: 'bold',
                              }}
                            >
                              #{scene.number}
                            </div>
                          }
                          title={
                            <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                              {scene.title || '未命名场景'}
                            </span>
                          }
                          description={
                            <div>
                              <div style={{
                                fontSize: '13px',
                                color: colors.textSecondary,
                                marginTop: '4px',
                                lineHeight: '1.6',
                              }}>
                                {scene.content?.slice(0, 80) || '无描述'}
                                {scene.content?.length > 80 ? '...' : ''}
                              </div>
                              <Space size="small" style={{ marginTop: '8px' }}>
                                {scene.duration && (
                                  <Tag
                                    size="small"
                                    style={{
                                      background: 'rgba(82, 196, 26, 0.2)',
                                      color: colors.success,
                                      border: 'none',
                                    }}
                                  >
                                    ⏱ {scene.duration}
                                  </Tag>
                                )}
                                {scene.location && (
                                  <Tag
                                    size="small"
                                    style={{
                                      background: 'rgba(0, 212, 255, 0.2)',
                                      color: colors.cyan,
                                      border: 'none',
                                    }}
                                  >
                                    📍 {scene.location}
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          }
                        />
                      </Card>
                    )}
                  />
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 右侧：统计和快捷操作 */}
        <div>
          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>剧本统计</span>}
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
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: colors.textSecondary }}>场景数量</span>
                <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{scenes.length}</span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: colors.textSecondary }}>文字数</span>
                <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>
                  {currentProject?.script?.content?.length || 0} 字
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: colors.textSecondary }}>保存版本</span>
                <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>{versions.length}</span>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: colors.textSecondary }}>预估时长</span>
                <span style={{ color: colors.textPrimary, fontWeight: 'bold' }}>
                  {scenes.reduce((sum, s) => {
                    const match = s.duration?.match(/(\d+)/);
                    return sum + (match ? parseInt(match[1]) : 0);
                  }, 0)} 秒
                </span>
              </div>
            </div>
          </Card>

          <Card
            title={<span style={{ color: colors.textPrimary, fontWeight: 600 }}>快捷操作</span>}
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
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                icon={<SaveOutlined />}
                onClick={saveAsNewVersion}
                style={{
                  background: gradientStyles.primary,
                  border: 'none',
                  height: '44px',
                }}
              >
                保存当前为新版本
              </Button>
              <Button
                block
                icon={<HistoryOutlined />}
                onClick={() => setVersionModalVisible(true)}
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  height: '44px',
                }}
              >
                查看版本历史
              </Button>
              <Button
                block
                icon={<PlusOutlined />}
                onClick={handleNewScene}
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  height: '44px',
                }}
              >
                添加新场景
              </Button>
            </Space>
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
            <span style={{ fontSize: '24px' }}>🎬</span>
            {editingScene?.number ? `编辑场景 #${editingScene.number}` : '新建场景'}
          </div>
        }
        open={sceneModalVisible}
        onOk={handleSaveScene}
        onCancel={() => {
          setSceneModalVisible(false);
          setEditingScene(null);
        }}
        width={600}
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
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                场景标题
              </label>
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
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                场景内容
              </label>
              <TextArea
                value={editingScene.content}
                onChange={(e) =>
                  setEditingScene({ ...editingScene, content: e.target.value })
                }
                rows={5}
                placeholder="输入场景内容描述"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  时长
                </label>
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
              </div>

              <div>
                <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                  地点
                </label>
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
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ color: colors.textPrimary, fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                角色
              </label>
              <Input
                value={editingScene.characters?.join(', ') || ''}
                onChange={(e) =>
                  setEditingScene({
                    ...editingScene,
                    characters: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="多个角色用逗号分隔"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* 版本历史弹窗 */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textPrimary,
          }}>
            <HistoryOutlined style={{ fontSize: '24px' }} />
            版本历史
          </div>
        }
        open={versionModalVisible}
        onCancel={() => {
          setVersionModalVisible(false);
          setSelectedVersion(null);
        }}
        width={800}
        footer={null}
        centered={true}
      >
        {selectedVersion ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => setSelectedVersion(null)}
                style={{ color: colors.textSecondary }}
              >
                返回列表
              </Button>
              <Space>
                <Button
                  icon={<RollbackOutlined />}
                  onClick={() => handleRestoreVersion(selectedVersion)}
                  style={{
                    background: gradientStyles.primary,
                    border: 'none',
                    color: '#fff',
                  }}
                >
                  恢复此版本
                </Button>
              </Space>
            </div>
            <Card
              style={{
                background: colors.bgTertiary,
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <Space size="middle">
                  <Tag style={{ background: 'rgba(107, 63, 160, 0.3)', color: colors.primary, border: 'none' }}>
                    v{selectedVersion.versionNumber}
                  </Tag>
                  <span style={{ color: colors.textSecondary }}>
                    {new Date(selectedVersion.createdAt).toLocaleString('zh-CN')}
                  </span>
                </Space>
              </div>
              {selectedVersion.changeDescription && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ color: colors.textSecondary, fontSize: '13px' }}>修改备注：</span>
                  <p style={{ color: colors.textPrimary, marginTop: '4px' }}>
                    {selectedVersion.changeDescription}
                  </p>
                </div>
              )}
              <Divider style={{ borderColor: colors.borderLight }} />
              <div>
                <h4 style={{ color: colors.textPrimary, marginBottom: '12px' }}>标题：{selectedVersion.title}</h4>
                <TextArea
                  value={selectedVersion.content}
                  rows={15}
                  readOnly
                  style={{
                    background: colors.bgSecondary,
                    borderColor: colors.border,
                    color: colors.textSecondary,
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '13px',
                    lineHeight: '1.8',
                  }}
                />
              </div>
            </Card>
          </div>
        ) : (
          <div>
            {versions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>📜</div>
                <div style={{ color: colors.textSecondary }}>暂无历史版本</div>
                <div style={{ color: colors.textMuted, fontSize: '13px', marginTop: '8px' }}>
                  点击"保存版本"按钮保存当前内容
                </div>
              </div>
            ) : (
              <List
                dataSource={[...versions].sort((a, b) => b.createdAt - a.createdAt)}
                renderItem={(version) => (
                  <List.Item
                    actions={[
                      <EyeOutlined
                        key="view"
                        style={{ cursor: 'pointer', color: colors.textSecondary }}
                        onClick={() => viewVersion(version)}
                      />,
                      <RollbackOutlined
                        key="restore"
                        style={{ cursor: 'pointer', color: colors.primary }}
                        onClick={() => handleRestoreVersion(version)}
                      />,
                      <Popconfirm
                        key="delete"
                        title="确认删除"
                        description="确定要删除这个版本吗？"
                        onConfirm={() => {
                          deleteScriptVersion(version.id);
                          messageApi.success('版本已删除');
                        }}
                        okText="删除"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <DeleteOutlined style={{ cursor: 'pointer', color: colors.textMuted }} />
                      </Popconfirm>,
                    ]}
                    style={{
                      padding: '16px',
                      background: colors.bgTertiary,
                      borderRadius: '12px',
                      marginBottom: '12px',
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Tag
                            style={{
                              background: 'rgba(107, 63, 160, 0.3)',
                              color: colors.primary,
                              border: 'none',
                              fontWeight: 'bold',
                            }}
                          >
                            v{version.versionNumber}
                          </Tag>
                          <span style={{ color: colors.textPrimary, fontWeight: 500 }}>
                            {version.title}
                          </span>
                        </Space>
                      }
                      description={
                        <div>
                          <div style={{
                            fontSize: '13px',
                            color: colors.textSecondary,
                            marginTop: '4px',
                          }}>
                            <ClockCircleOutlined style={{ marginRight: '6px' }} />
                            {new Date(version.createdAt).toLocaleString('zh-CN')}
                          </div>
                          {version.changeDescription && (
                            <div style={{
                              fontSize: '12px',
                              color: colors.textTertiary,
                              marginTop: '6px',
                            }}>
                              💬 {version.changeDescription}
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScriptEditorPage;

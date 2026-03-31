import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Select, Button, Space, Divider, message, Spin, Progress, Modal } from 'antd';
import { UploadOutlined, SaveOutlined, ThunderboltOutlined, CheckCircleOutlined, ArrowLeftOutlined, ArrowRightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useAppStore } from '../store';
import { InspirationSuggestion } from '../types';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';
import { debounce } from '../utils';

const { TextArea } = Input;
const { Option } = Select;

const InspirationPage: React.FC = () => {
  const {
    currentProject,
    suggestions,
    updateInspiration,
    setLoading,
    setError,
    createProject,
    saveDraft,
    deleteDraft,
    getDrafts,
  } = useAppStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [descriptionQuality, setDescriptionQuality] = useState<string>('');
  const navigate = useNavigate();

  // 保存当前状态为草稿
  const saveAsDraft = async () => {
    try {
      const values = await form.validateFields();

      saveDraft({
        name: values.projectName || '未命名项目',
        description: values.description || '',
        videoType: values.videoType || '剧情短片',
        duration: values.duration || '15-30秒',
        style: values.style || '梦幻童话',
        aspectRatio: values.aspectRatio || '16:9 (横屏)',
        model: values.model || 'deepseek',
      });

      messageApi.success('草稿已保存');
    } catch (error) {
      messageApi.error('请完善表单信息后再保存草稿');
    }
  };

  // 自动保存函数
  const autoSave = debounce(async (values: any) => {
    if (!currentProject) return;
    try {
      setIsAutoSaving(true);
      setAutoSaveProgress(30);
      // 保存数据
      updateInspiration({
        name: values.projectName,
        description: values.description || '',
        videoType: values.videoType || '剧情短片',
        duration: values.duration || '15-30秒',
        style: values.style || '梦幻童话',
        aspectRatio: values.aspectRatio || '16:9 (横屏)',
        model: values.model || 'deepseek',
      });
      setAutoSaveProgress(70);
      // 模拟保存进度
      await new Promise(resolve => setTimeout(resolve, 100));
      setAutoSaveProgress(100);
    } catch (error) {
      console.error('自动保存失败:', error);
    } finally {
      setTimeout(() => {
        setIsAutoSaving(false);
        setAutoSaveProgress(0);
      }, 500);
    }
  }, 1500);

  // 监听表单变化，触发自动保存
  const handleValuesChange = useCallback((_changedValues: any, allValues: any) => {
    if (currentProject) {
      autoSave(allValues);
    }

    // 更新描述长度和质量评估
    if (_changedValues.description !== undefined) {
      const length = _changedValues.description.length;
      setDescriptionLength(length);

      if (length < 10) {
        setDescriptionQuality('描述太短，建议至少10个字');
      } else if (length < 50) {
        setDescriptionQuality('描述较短，建议添加更多细节');
      } else if (length < 200) {
        setDescriptionQuality('描述长度适中，继续完善');
      } else if (length < 400) {
        setDescriptionQuality('描述非常详细，质量很高');
      } else {
        setDescriptionQuality('描述过长，建议精简到500字以内');
      }
    }
  }, [currentProject, autoSave]);

  // 初始化表单数据
  useEffect(() => {
    if (currentProject && currentProject.inspiration) {
      const { name, inspiration } = currentProject;
      form.setFieldsValue({
        projectName: name,
        description: inspiration.description,
        videoType: inspiration.videoType,
        duration: inspiration.duration,
        style: inspiration.style,
        aspectRatio: inspiration.aspectRatio,
        model: inspiration.model,
      });
      // 初始化描述长度和质量
      const length = inspiration.description.length;
      setDescriptionLength(length);
      if (length < 10) {
        setDescriptionQuality('描述太短，建议至少10个字');
      } else if (length < 50) {
        setDescriptionQuality('描述较短，建议添加更多细节');
      } else if (length < 200) {
        setDescriptionQuality('描述长度适中，继续完善');
      } else if (length < 400) {
        setDescriptionQuality('描述非常详细，质量很高');
      } else {
        setDescriptionQuality('描述过长，建议精简到500字以内');
      }
    } else if (!currentProject) {
      // 没有项目时，创建一个新项目
      createProject();
      form.setFieldsValue({
        videoType: '剧情短片',
        duration: '15-30秒',
        style: '梦幻童话',
        aspectRatio: '16:9 (横屏)',
        model: 'deepseek',
      });
      setDescriptionLength(0);
      setDescriptionQuality('');
    }
  }, [currentProject, form, createProject]);

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      updateInspiration({
        name: values.projectName,
        description: values.description,
        videoType: values.videoType,
        duration: values.duration,
        style: values.style,
        aspectRatio: values.aspectRatio,
        model: values.model,
      });
      messageApi.success('项目信息已保存');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 使用推荐灵感
  const useSuggestion = (suggestion: InspirationSuggestion) => {
    form.setFieldValue('description', suggestion.inspiration);
  };

  // 生成剧本
  const generateScript = async () => {
    if (!currentProject) return;

    const values = await form.validateFields();
    setIsGenerating(true);

    try {
      // 保存当前项目信息
      handleSubmit(values);

      // 调用 API 生成剧本
      const response = await api.generateScript(
        currentProject.id,
        values.description,
        values.model
      );

      if (response.success) {
        messageApi.success('剧本生成任务已提交');
      } else {
        throw new Error(response.error || '生成剧本失败');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // 返回Dashboard
  const handleBack = () => {
    navigate('/');
  };

  // 下一步：剧本编辑器
  const handleNext = async () => {
    try {
      // 先验证并保存表单
      const values = await form.validateFields();
      await handleSubmit(values);
      // 导航到剧本编辑器
      navigate('/script');
    } catch (error: any) {
      messageApi.error('请填写完整信息');
    }
  };

  // 从草稿导入
  const importFromDraft = () => {
    const drafts = getDrafts();

    if (drafts.length === 0) {
      messageApi.info('暂无保存的草稿');
      return;
    }

    // 创建草稿选择菜单
    Modal.confirm({
      title: '选择草稿',
      content: (
        <div style={{ maxHeight: 300, overflow: 'auto' }}>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              style={{
                padding: '12px',
                margin: '8px 0',
                background: colors.bgTertiary,
                borderRadius: '8px',
                cursor: 'pointer',
                border: `1px solid ${colors.border}`,
              }}
              onClick={() => {
                // 加载草稿到表单
                form.setFieldsValue({
                  projectName: draft.name,
                  description: draft.description,
                  videoType: draft.videoType,
                  duration: draft.duration,
                  style: draft.style,
                  aspectRatio: draft.aspectRatio,
                  model: draft.model,
                });
                Modal.destroyAll();
                messageApi.success('草稿加载成功');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.bgSecondary;
                e.currentTarget.style.borderColor = colors.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.bgTertiary;
                e.currentTarget.style.borderColor = colors.border;
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{
                    fontWeight: 600,
                    color: colors.textPrimary,
                    marginBottom: '4px',
                  }}>
                    {draft.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textSecondary,
                    marginBottom: '4px',
                  }}>
                    保存于: {new Date(draft.savedAt).toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: colors.textTertiary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {draft.description}
                  </div>
                </div>
                <Button
                  type="text"
                  danger
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteDraft(draft.id);
                    messageApi.success('草稿已删除');
                  }}
                >
                  删除
                </Button>
              </div>
            </div>
          ))}
        </div>
      ),
      okText: '取消',
      cancelText: null,
      onOk: () => {},
    });
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {contextHolder}
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
            <span style={{ fontSize: '32px' }}>✨</span>
            输入你的灵感
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
          style={{ maxWidth: 900 }}
        >
          <Form.Item
            name="projectName"
            label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>项目名称</span>}
            tooltip="给你的视频项目起个名字"
          >
            <Input
              placeholder="给你的视频起个名字..."
              size="large"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
                color: colors.textPrimary,
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>描述你的灵感</span>}
            rules={[
              { required: true, message: '请描述你的灵感' },
              { min: 10, message: '描述长度不能少于10个字符' },
              { max: 500, message: '描述长度不能超过500个字符' },
            ]}
            tooltip="用几句话描述你想要的视频"
          >
            <TextArea
              rows={5}
              placeholder="例如：一个关于太空探险的故事，宇航员在遥远的星系发现了神秘的外星文明..."
              size="large"
              showCount
              maxLength={500}
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontSize: '16px',
                lineHeight: '1.8',
              }}
            />
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: descriptionLength < 10 ? colors.error :
                descriptionLength < 50 ? colors.warning :
                colors.success,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              💡 {descriptionQuality}
            </div>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Form.Item
              name="videoType"
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视频类型</span>}
              rules={[{ required: true, message: '请选择视频类型' }]}
            >
              <Select
                size="large"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                }}
              >
                <Option value="剧情短片">剧情短片</Option>
                <Option value="科普教育">科普教育</Option>
                <Option value="产品宣传">产品宣传</Option>
                <Option value="动画故事">动画故事</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="duration"
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视频时长</span>}
              rules={[{ required: true, message: '请选择视频时长' }]}
            >
              <Select
                size="large"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                }}
              >
                <Option value="15-30秒">15-30秒</Option>
                <Option value="1-2分钟">1-2分钟</Option>
                <Option value="3-5分钟">3-5分钟</Option>
                <Option value="5分钟以上">5分钟以上</Option>
              </Select>
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <Form.Item
              name="style"
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>视觉风格</span>}
              rules={[{ required: true, message: '请选择视觉风格' }]}
            >
              <Select
                size="large"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                }}
              >
                <Option value="赛博朋克">赛博朋克</Option>
                <Option value="宫崎骏风格">宫崎骏风格</Option>
                <Option value="写实3D">写实3D</Option>
                <Option value="像素艺术">像素艺术</Option>
                <Option value="水墨国风">水墨国风</Option>
                <Option value="梦幻童话">梦幻童话</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="aspectRatio"
              label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>画面比例</span>}
              rules={[{ required: true, message: '请选择画面比例' }]}
            >
              <Select
                size="large"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                }}
              >
                <Option value="16:9 (横屏)">16:9 (横屏)</Option>
                <Option value="9:16 (竖屏)">9:16 (竖屏)</Option>
                <Option value="1:1 (正方形)">1:1 (正方形)</Option>
                <Option value="4:3 (传统)">4:3 (传统)</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="model"
            label={<span style={{ color: colors.textPrimary, fontWeight: 500 }}>选择文本生成模型</span>}
            rules={[{ required: true, message: '请选择文本生成模型' }]}
            tooltip="不同的模型有不同的特点和价格，根据你的需求选择合适的模型"
          >
            <Select
              size="large"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
              }}
            >
              <Option value="deepseek">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧠</span>
                    <span style={{ fontWeight: 500 }}>DeepSeek</span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    专业文本生成模型，擅长创意写作和剧本创作
                  </div>
                  <div style={{ fontSize: '11px', color: colors.success }}>
                    价格实惠，响应速度快
                  </div>
                </div>
              </Option>
              <Option value="gemini">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>💎</span>
                    <span style={{ fontWeight: 500 }}>Gemini 3.1 Pro</span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                    Google 最新多模态大模型，支持文本、图像、视频
                  </div>
                  <div style={{ fontSize: '11px', color: colors.warning }}>
                    功能强大，但价格较高
                  </div>
                </div>
              </Option>
            </Select>
          </Form.Item>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          <div>
            <h3 style={{
              marginBottom: '20px',
              color: colors.textPrimary,
              fontSize: '18px',
              fontWeight: 600,
            }}>
              💡 灵感推荐
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  style={{
                    padding: '20px',
                    border: `1px solid ${activeSuggestion === suggestion.id ? colors.primary : colors.border}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: activeSuggestion === suggestion.id ? colors.bgSecondary : colors.bgTertiary,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onClick={() => {
                    setActiveSuggestion(suggestion.id);
                    useSuggestion(suggestion);
                    setTimeout(() => setActiveSuggestion(null), 200);
                  }}
                  onMouseEnter={(e) => {
                    if (activeSuggestion !== suggestion.id) {
                      e.currentTarget.style.backgroundColor = colors.bgSecondary;
                      e.currentTarget.style.borderColor = colors.primary;
                      e.currentTarget.style.boxShadow = shadowStyles.purple;
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSuggestion !== suggestion.id) {
                      e.currentTarget.style.backgroundColor = colors.bgTertiary;
                      e.currentTarget.style.borderColor = colors.border;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      marginBottom: '12px',
                      transition: 'transform 0.2s ease',
                    }}
                  >
                    {suggestion.emoji}
                  </div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '6px',
                      color: colors.textPrimary,
                    }}
                  >
                    {suggestion.title}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: colors.textSecondary,
                    lineHeight: '1.6',
                  }}>
                    {suggestion.text}
                  </div>
                  {activeSuggestion === suggestion.id && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: gradientStyles.glow,
                      zIndex: 1,
                      pointerEvents: 'none',
                      borderRadius: '16px',
                      animation: 'pulse 0.6s ease',
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          {/* 自动保存状态 */}
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
            {isAutoSaving && (
              <>
                <ClockCircleOutlined spin style={{ color: colors.primary }} />
                <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                  自动保存中...
                </span>
                <Progress percent={autoSaveProgress} size="small" style={{ width: 80 }} />
              </>
            )}
            {!isAutoSaving && currentProject && currentProject.updatedAt && (
              <>
                <CheckCircleOutlined style={{ color: colors.success }} />
                <span style={{ color: colors.textSecondary, fontSize: '12px' }}>
                  已保存
                </span>
              </>
            )}
          </div>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space>
                <Button
                  icon={<ArrowLeftOutlined />}
                  size="large"
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    borderColor: colors.border,
                    color: colors.textSecondary,
                    height: '48px',
                    padding: '0 24px',
                    borderRadius: '12px',
                  }}
                >
                  返回
                </Button>
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  onClick={importFromDraft}
                  style={{
                    background: 'transparent',
                    borderColor: colors.border,
                    color: colors.textSecondary,
                    height: '48px',
                    padding: '0 24px',
                    borderRadius: '12px',
                  }}
                >
                  从草稿导入
                </Button>
              </Space>
              <Space size="middle">
                <Button
                  icon={<SaveOutlined />}
                  size="large"
                  onClick={saveAsDraft}
                  style={{
                    background: colors.bgTertiary,
                    borderColor: colors.border,
                    color: colors.textPrimary,
                    height: '48px',
                    padding: '0 24px',
                    borderRadius: '12px',
                  }}
                >
                  保存草稿
                </Button>
                <Button
                  size="large"
                  onClick={handleNext}
                  style={{
                    background: colors.bgCard,
                    borderColor: colors.primary,
                    color: colors.primary,
                    height: '48px',
                    padding: '0 24px',
                    borderRadius: '12px',
                  }}
                >
                  下一步
                  <ArrowRightOutlined />
                </Button>
                <Button
                  type="primary"
                  size="large"
                  onClick={generateScript}
                  disabled={isGenerating}
                  icon={<ThunderboltOutlined />}
                  style={{
                    background: gradientStyles.primary,
                    border: 'none',
                    height: '48px',
                    padding: '0 32px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isGenerating) {
                      e.currentTarget.style.boxShadow = shadowStyles.purple;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {isGenerating ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Spin size="small" />
                      正在生成...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      生成剧本 →
                    </span>
                  )}
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default InspirationPage;

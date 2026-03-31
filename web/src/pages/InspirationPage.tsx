import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, Button, Space, Divider, message, Spin } from 'antd';
import { UploadOutlined, SaveOutlined, ThunderboltOutlined } from '@ant-design/icons';

import { useAppStore } from '../store';
import { InspirationSuggestion } from '../types';
import { api } from '../api';
import { colors, gradientStyles, shadowStyles } from '../theme';

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
  } = useAppStore();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [isGenerating, setIsGenerating] = useState(false);

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

  // 从草稿导入
  const importFromDraft = () => {
    messageApi.info('从草稿导入功能开发中...');
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
            ]}
            tooltip="用几句话描述你想要的视频"
          >
            <TextArea
              rows={5}
              placeholder="例如：一个关于太空探险的故事，宇航员在遥远的星系发现了神秘的外星文明..."
              size="large"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
                color: colors.textPrimary,
                fontSize: '16px',
                lineHeight: '1.8',
              }}
            />
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
          >
            <Select
              size="large"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
              }}
            >
              <Option value="deepseek">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🧠</span>
                  <span>DeepSeek (文本生成)</span>
                </div>
              </Option>
              <Option value="gemini">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>💎</span>
                  <span>Gemini 3.1 Pro (多模态)</span>
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
                    border: `1px solid ${colors.border}`,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: colors.bgTertiary,
                  }}
                  onClick={() => useSuggestion(suggestion)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgSecondary;
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.boxShadow = shadowStyles.purple;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.bgTertiary;
                    e.currentTarget.style.borderColor = colors.border;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      fontSize: '32px',
                      marginBottom: '12px',
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
                </div>
              ))}
            </div>
          </div>

          <Divider style={{ borderColor: colors.borderLight, margin: '32px 0' }} />

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <Space size="middle">
                <Button
                  icon={<SaveOutlined />}
                  size="large"
                  onClick={() => form.submit()}
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

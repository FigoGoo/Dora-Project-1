import React, { useState, useEffect } from 'react';
import { Modal, Button, Steps, Typography, Card, Space, Tag } from 'antd';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  ThunderboltOutlined,
  PlayCircleOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// 新手引导步骤配置
export const TOUR_STEPS = [
  {
    title: '欢迎来到 Dora 魔盒',
    icon: '🎁',
    content: (
      <>
        <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
          很高兴认识你！Dora 魔盒可以帮你将一个简单的灵感转化为精美的视频作品。
        </Paragraph>
        <Paragraph style={{ color: colors.textSecondary }}>
          接下来的 3 个步骤，我们将带你快速了解整个创作流程。
        </Paragraph>
      </>
    ),
  },
  {
    title: '第一步：输入灵感',
    icon: '✨',
    content: (
      <>
        <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
          用几句话描述你想要的视频内容。
        </Paragraph>
        <Card
          size="small"
          style={{
            background: colors.bgTertiary,
            borderColor: colors.border,
            marginBottom: '16px',
          }}
        >
          <Text style={{ color: colors.textSecondary }}>示例：</Text>
          <Paragraph style={{ color: colors.textPrimary, marginTop: '8px' }}>
            "一只勇敢的小猫踏上了寻找失落宝藏的冒险旅程..."
          </Paragraph>
        </Card>
        <Paragraph style={{ color: colors.textSecondary, fontSize: '14px' }}>
          越详细的描述，生成的效果越好哦！
        </Paragraph>
      </>
    ),
  },
  {
    title: '第二步：AI 自动生成',
    icon: '⚡',
    content: (
      <>
        <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
          点击「生成剧本」后，AI 将自动为你完成以下工作：
        </Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          {[
            { icon: '📝', text: '根据灵感生成完整剧本' },
            { icon: '🎬', text: '拆解成分镜脚本' },
            { icon: '🎨', text: '绘制每一张画面' },
            { icon: '🎥', text: '生成动态视频' },
          ].map((item, index) => (
            <Card
              key={index}
              size="small"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>{item.icon}</span>
              <Text style={{ color: colors.textPrimary }}>{item.text}</Text>
            </Card>
          ))}
        </Space>
      </>
    ),
  },
  {
    title: '第三步：导出和分享',
    icon: '🚀',
    content: (
      <>
        <Paragraph style={{ fontSize: '16px', marginBottom: '16px' }}>
          生成完成后，你可以：
        </Paragraph>
        <Space direction="vertical" style={{ width: '100%' }}>
          {[
            { icon: '💾', text: '下载视频文件' },
            { icon: '📱', text: '分享到社交媒体' },
            { icon: '✏️', text: '继续编辑调整' },
          ].map((item, index) => (
            <Card
              key={index}
              size="small"
              style={{
                background: colors.bgTertiary,
                borderColor: colors.border,
              }}
            >
              <span style={{ fontSize: '20px', marginRight: '12px' }}>{item.icon}</span>
              <Text style={{ color: colors.textPrimary }}>{item.text}</Text>
            </Card>
          ))}
        </Space>
      </>
    ),
  },
];

const NewUserTour: React.FC = () => {
  const {
    tourStep,
    tourVisible,
    setTourStep,
    setTourVisible,
    completeTour,
  } = useAppStore();

  const handleNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      completeTour();
    }
  };

  const handlePrev = () => {
    if (tourStep > 0) {
      setTourStep(tourStep - 1);
    }
  };

  const handleSkip = () => {
    setTourVisible(false);
  };

  const currentStep = TOUR_STEPS[tourStep];

  return (
    <Modal
      open={tourVisible}
      onCancel={handleSkip}
      footer={null}
      closable={false}
      width={700}
      centered
      maskClosable={false}
      styles={{
        content: {
          background: colors.bgCard,
          borderRadius: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: shadowStyles.modal,
        },
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 10,
        }}
      >
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleSkip}
          style={{
            color: colors.textTertiary,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
          }}
        />
      </div>

      <div style={{ padding: '32px' }}>
        {/* 步骤指示器 */}
        <div style={{ marginBottom: '40px' }}>
          <Steps
            current={tourStep}
            direction="horizontal"
            size="small"
            items={TOUR_STEPS.map((step, index) => ({
              icon: index < tourStep ? (
                <CheckCircleOutlined style={{ color: colors.success }} />
              ) : (
                <span style={{ fontSize: '18px' }}>{step.icon}</span>
              ),
            }))}
          />
        </div>

        {/* 内容区域 */}
        <div
          key={tourStep}
          style={{
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              marginBottom: '24px',
              animation: 'bounceIn 0.5s ease',
            }}
          >
            {currentStep.icon}
          </div>

          <Title
            level={2}
            style={{
              color: colors.textPrimary,
              marginBottom: '16px',
              fontSize: '28px',
            }}
          >
            {currentStep.title}
          </Title>

          <div style={{ textAlign: 'left', marginTop: '32px' }}>
            {currentStep.content}
          </div>
        </div>

        {/* 按钮区域 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: `1px solid ${colors.borderLight}`,
          }}
        >
          <Button
            onClick={handleSkip}
            style={{
              color: colors.textTertiary,
              border: 'none',
              background: 'transparent',
            }}
          >
            稍后再说
          </Button>

          <Space>
            {tourStep > 0 && (
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={handlePrev}
                style={{
                  height: '48px',
                  padding: '0 24px',
                  borderRadius: '12px',
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                }}
              >
                上一步
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              icon={tourStep === TOUR_STEPS.length - 1 ? <RocketOutlined /> : <ArrowRightOutlined />}
              onClick={handleNext}
              style={{
                height: '48px',
                padding: '0 32px',
                borderRadius: '12px',
                background: gradientStyles.primary,
                border: 'none',
                fontSize: '16px',
                fontWeight: 500,
              }}
            >
              {tourStep === TOUR_STEPS.length - 1 ? '开始使用' : '下一步'}
            </Button>
          </Space>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Modal>
  );
};

export default NewUserTour;

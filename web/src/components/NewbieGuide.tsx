import React, { useState, useEffect } from 'react';
import {
  Steps,
  Button,
  Modal,
  Typography,
  Space,
  Card,
  Divider,
} from 'antd';
import {
  RightOutlined,
  LeftOutlined,
  CloseOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

// 新手引导数据
const guideSteps = [
  {
    title: '欢迎使用 Dora 魔盒',
    icon: '🎁',
    description: '这是一个神奇的 AI 视频创作工具，让你的创意轻松变成视频！',
    content: (
      <div>
        <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>✨</div>
        <Title level={3} style={{ textAlign: 'center', color: colors.textPrimary }}>
          开启你的创作之旅
        </Title>
        <Paragraph style={{ textAlign: 'center', color: colors.textSecondary, fontSize: '16px' }}>
          在接下来的几分钟里，我们将带你快速了解 Dora 魔盒的核心功能
        </Paragraph>
      </div>
    ),
  },
  {
    title: '项目管理',
    icon: '📂',
    description: '创建和管理你的创作项目',
    content: (
      <div>
        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>🎬</div>
            <div>
              <Title level={4} style={{ margin: 0, color: colors.textPrimary }}>
                我的旅行视频
              </Title>
              <Paragraph style={{ margin: '8px 0', color: colors.textSecondary }}>
                状态：进行中 75%
              </Paragraph>
            </div>
          </div>
        </Card>
        <Paragraph style={{ color: colors.textSecondary }}>
          • 每个项目代表一个视频创作任务
          <br />• 项目会自动保存，随时可以继续编辑
          <br />• 可以创建多个项目并行创作
        </Paragraph>
      </div>
    ),
  },
  {
    title: '5 步创作流程',
    icon: '🚀',
    description: '简单五步，从灵感到视频',
    content: (
      <div>
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          style={{ marginBottom: '16px' }}
        >
          <Step
            title={
              <Text style={{ color: colors.primary }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>✨</span>
                灵感输入
              </Text>
            }
            description="描述你想要的视频内容"
          />
          <Step
            title={
              <Text style={{ color: colors.primary }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>📝</span>
                剧本生成
              </Text>
            }
            description="AI 自动生成专业剧本"
          />
          <Step
            title={
              <Text style={{ color: colors.cyan }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>🎬</span>
                分镜设计
              </Text>
            }
            description="智能分镜拆解"
          />
          <Step
            title={
              <Text style={{ color: colors.amber }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>🎨</span>
                画面绘制
              </Text>
            }
            description="AI 绘制精美画面"
          />
          <Step
            title={
              <Text style={{ color: colors.pink }}>
                <span style={{ fontSize: '18px', marginRight: '8px' }}>🎥</span>
                视频生成
              </Text>
            }
            description="自动合成视频"
          />
        </Steps>
        <Paragraph style={{ color: colors.textSecondary }}>
          每个步骤都有智能提示和帮助，让创作变得简单有趣！
        </Paragraph>
      </div>
    ),
  },
  {
    title: '一键自动模式',
    icon: '🌟',
    description: '最简单的创作方式',
    content: (
      <div>
        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
            marginBottom: '16px',
          }}
          bodyStyle={{ padding: '24px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
            <Title level={4} style={{ margin: 0, color: colors.textPrimary }}>
              一键自动创作
            </Title>
            <Paragraph style={{ margin: '8px 0', color: colors.textSecondary }}>
              输入灵感，剩下的交给 AI
            </Paragraph>
            <Button
              type="primary"
              size="large"
              style={{
                background: gradientStyles.primary,
                border: 'none',
                borderRadius: '12px',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px',
              }}
            >
              立即体验
            </Button>
          </div>
        </Card>
        <Paragraph style={{ color: colors.textSecondary }}>
          • 适合新手用户，最快 10 分钟生成视频
          • AI 会自动优化每个环节的参数
          • 也可以选择手动模式，获得更多控制权
        </Paragraph>
      </div>
    ),
  },
  {
    title: '开始创作',
    icon: '🎉',
    description: '现在，开始你的第一个创作',
    content: (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎁</div>
          <Title level={3} style={{ margin: 0, color: colors.textPrimary }}>
            准备好开始了吗？
          </Title>
          <Paragraph style={{ margin: '8px 0', color: colors.textSecondary }}>
            创建你的第一个项目，体验 Dora 魔盒的神奇！
          </Paragraph>
        </div>
        <Divider style={{ borderColor: colors.borderLight }} />
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph style={{ color: colors.textSecondary }}>
            💡 <strong>提示：</strong>如果在创作过程中遇到任何问题，点击页面右下角的问号图标获取帮助
          </Paragraph>
          <Paragraph style={{ color: colors.textSecondary }}>
            📚 <strong>教程：</strong>我们提供了详细的视频教程和文字说明
          </Paragraph>
        </Space>
      </div>
    ),
  },
];

interface NewbieGuideProps {
  visible: boolean;
  onClose: () => void;
}

const NewbieGuide: React.FC<NewbieGuideProps> = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { createProject, setCurrentProject } = useAppStore();

  // 重置状态
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    // 创建第一个项目
    const newProject = createProject();
    setCurrentProject(newProject);
    onClose();
    navigate('/inspiration');
  };

  const handleSkip = () => {
    onClose();
  };

  const currentGuide = guideSteps[currentStep];

  return (
    <Modal
      open={visible}
      onCancel={handleSkip}
      footer={null}
      width={800}
      centered
      closable
      closeIcon={<CloseOutlined style={{ color: colors.textSecondary }} />}
      style={{ top: 20 }}
    >
      <div style={{ padding: '24px' }}>
        {/* 步骤指示器 */}
        <Steps
          current={currentStep}
          style={{ marginBottom: '24px' }}
        >
          {guideSteps.map((step, index) => (
            <Step
              key={index}
              title={
                <span style={{ color: currentStep === index ? colors.primary : colors.textSecondary }}>
                  {step.title}
                </span>
              }
              icon={
                <span style={{ fontSize: '18px' }}>
                  {step.icon}
                </span>
              }
            />
          ))}
        </Steps>

        {/* 内容区域 */}
        <Card
          style={{
            background: colors.bgCard,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${colors.border}`,
            borderRadius: '16px',
            boxShadow: shadowStyles.card,
          }}
          bodyStyle={{ padding: '32px' }}
        >
          {currentGuide.content}
        </Card>

        {/* 操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
          <Button
            onClick={handleSkip}
            style={{
              background: colors.bgTertiary,
              borderColor: colors.border,
              color: colors.textSecondary,
              borderRadius: '12px',
            }}
          >
            <CloseOutlined style={{ marginRight: '8px' }} />
            跳过引导
          </Button>

          <Space>
            {currentStep > 0 && (
              <Button
                onClick={handlePrev}
                icon={<LeftOutlined />}
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                  color: colors.textPrimary,
                  borderRadius: '12px',
                }}
              >
                上一步
              </Button>
            )}
            {currentStep < guideSteps.length - 1 ? (
              <Button
                type="primary"
                onClick={handleNext}
                iconPosition="end"
                icon={<RightOutlined />}
                style={{
                  background: gradientStyles.primary,
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                }}
              >
                下一步
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={handleFinish}
                icon={<CheckOutlined />}
                style={{
                  background: gradientStyles.primary,
                  border: 'none',
                  borderRadius: '12px',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px',
                }}
              >
                开始创作
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default NewbieGuide;

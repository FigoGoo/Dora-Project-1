import React from 'react';
import { colors, gradientStyles, shadowStyles, animationStyles } from '../theme';

interface ProgressStep {
  id: number;
  label: string;
  completed?: boolean;
  active?: boolean;
  icon: string;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 6 }) => {
  const steps: ProgressStep[] = [
    { id: 1, label: '灵感输入', icon: '✨' },
    { id: 2, label: '剧本生成', icon: '📝' },
    { id: 3, label: '分镜拆解', icon: '🎬' },
    { id: 4, label: '画面绘制', icon: '🎨' },
    { id: 5, label: '视频生成', icon: '🎥' },
    { id: 6, label: '视频发布', icon: '🚀' },
  ];

  // 过滤显示的步骤
  const visibleSteps = steps.slice(0, totalSteps);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      marginBottom: '48px',
      position: 'relative',
      padding: '40px 0',
    }}>
      {/* 装饰背景 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        height: '60px',
        background: 'rgba(107, 63, 160, 0.05)',
        borderRadius: '30px',
        border: `1px solid ${colors.borderLight}`,
        zIndex: 0,
      }} />

      {/* Background line */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '75%',
        height: '2px',
        background: colors.bgTertiary,
        zIndex: 1,
        borderRadius: '1px',
      }} />

      {/* 进度填充线 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '12.5%',
        transform: 'translateY(-50%)',
        width: `${((currentStep - 1) / (totalSteps - 1)) * 75}%`,
        height: '3px',
        background: gradientStyles.primary,
        backgroundSize: '200% 200%',
        zIndex: 2,
        borderRadius: '2px',
        transition: `width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        boxShadow: shadowStyles.purpleSoft,
        animation: 'gradientMove 4s ease infinite',
      }} />

      {visibleSteps.map((step) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div
            key={step.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              position: 'relative',
              zIndex: 3,
              flex: 1,
              maxWidth: '150px',
            }}
          >
            {/* 步骤图标容器 */}
            <div style={{
              width: isActive ? '42px' : '38px',
              height: isActive ? '42px' : '38px',
              borderRadius: '50%',
              background: isActive
                ? gradientStyles.primary
                : isCompleted
                ? colors.primary
                : colors.bgTertiary,
              border: `2px solid ${isActive || isCompleted ? 'transparent' : colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: isActive ? '20px' : '16px',
              color: isActive || isCompleted ? colors.textPrimary : colors.textMuted,
              transition: `all ${animationStyles.normal} cubic-bezier(0.34, 1.56, 0.64, 1)`,
              boxShadow: isActive ? shadowStyles.buttonHover : isCompleted ? shadowStyles.purpleSoft : 'none',
              position: 'relative',
            }}>
              {/* 内层发光效果 */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: gradientStyles.glow,
                  animation: 'pulseGlow 2s ease-in-out infinite',
                  filter: 'blur(4px)',
                  zIndex: -1,
                }} />
              )}

              {/* 图标 */}
              <span style={{
                position: 'relative',
                zIndex: 1,
                animation: isActive ? 'floatSlow 3s ease-in-out infinite' : 'none',
              }}>
                {step.icon}
              </span>
            </div>

            {/* 步骤文字 */}
            <div style={{
              fontSize: isActive ? '14px' : '13px',
              color: isActive ? colors.textPrimary : isCompleted ? colors.textSecondary : colors.textMuted,
              textAlign: 'center',
              transition: `all ${animationStyles.fast}`,
              fontWeight: isActive ? 600 : isCompleted ? 500 : 400,
              background: isActive ? `rgba(107, 63, 160, 0.1)` : 'transparent',
              padding: '4px 8px',
              borderRadius: '8px',
              border: isActive ? `1px solid ${colors.borderLight}` : 'none',
              lineHeight: '1.4',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
            }}>
              {step.label}
            </div>

            {/* 步骤编号（隐藏在图标后） */}
            {!isActive && !isCompleted && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                fontSize: '10px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: colors.bgTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.textMuted,
                border: `1px solid ${colors.borderLight}`,
              }}>
                {step.id}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressBar;

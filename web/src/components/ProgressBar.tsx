import React from 'react';
import { colors, gradientStyles, shadowStyles } from '../theme';

interface ProgressStep {
  id: number;
  label: string;
  completed?: boolean;
  active?: boolean;
}

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps = 6 }) => {
  const steps: ProgressStep[] = [
    { id: 1, label: '灵感输入' },
    { id: 2, label: '剧本生成' },
    { id: 3, label: '分镜拆解' },
    { id: 4, label: '画面绘制' },
    { id: 5, label: '视频生成' },
    { id: 6, label: '视频发布' },
  ];

  // 过滤显示的步骤
  const visibleSteps = steps.slice(0, totalSteps);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
      marginBottom: '40px',
      position: 'relative',
    }}>
      {/* Background line */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '70%',
        height: '2px',
        background: colors.bgTertiary,
        zIndex: 0,
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
              zIndex: 1,
              flex: 1,
              maxWidth: '140px',
            }}
          >
            {step.id > 1 && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                width: '100%',
                height: '2px',
                background: colors.primary,
                zIndex: 0,
                transform: isCompleted ? 'scaleX(1)' : 'scaleX(0)',
                transformOrigin: 'left',
                transition: 'transform 0.5s ease',
              }} />
            )}

            <div style={{
              width: '36px',
              height: '36px',
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
              fontSize: '14px',
              color: isActive || isCompleted ? colors.textPrimary : colors.textMuted,
              transition: 'all 0.3s ease',
              boxShadow: isActive ? shadowStyles.purple : 'none',
            }}>
              {step.id}
            </div>

            <div style={{
              fontSize: '12px',
              color: isActive ? colors.textPrimary : colors.textMuted,
              textAlign: 'center',
              transition: 'color 0.2s ease',
              fontWeight: isActive ? 500 : 400,
            }}>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressBar;

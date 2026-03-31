import React from 'react';
import { Typography } from 'antd';
import { colors, gradientStyles, shadowStyles, animationStyles } from '../theme';

const { Text, Paragraph } = Typography;

interface LoadingStateProps {
  tip?: string;
  subTip?: string;
  showProgress?: boolean;
  progress?: number;
  size?: 'small' | 'default' | 'large';
}

const LoadingState: React.FC<LoadingStateProps> = ({
  tip = '正在施展魔法...',
  subTip,
  showProgress = false,
  progress = 0,
  size = 'large',
}) => {
  const iconSize = size === 'large' ? '64px' : size === 'default' ? '48px' : '32px';
  const tipSize = size === 'large' ? '18px' : '16px';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 32px',
      textAlign: 'center',
      animation: 'fadeInUp 0.5s ease-out',
    }}>
      {/* 魔法图标容器 */}
      <div style={{
        position: 'relative',
        marginBottom: '28px',
      }}>
        {/* 外层光晕 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          background: gradientStyles.glow,
          borderRadius: '50%',
          animation: 'pulseGlow 3s ease-in-out infinite',
          filter: 'blur(20px)',
        }} />

        {/* 内层旋转图标 */}
        <div style={{
          position: 'relative',
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: iconSize,
          animation: 'float 3s ease-in-out infinite',
          zIndex: 1,
        }}>
          {/* 旋转的星星背景 */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            animation: 'rotate 8s linear infinite',
          }}>
            <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '16px', opacity: 0.6 }}>✨</span>
            <span style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '16px', opacity: 0.6 }}>✨</span>
            <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>✨</span>
            <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.6 }}>✨</span>
          </div>

          {/* 主图标 */}
          <span style={{
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }}>
            🎁
          </span>
        </div>
      </div>

      <Paragraph
        style={{
          fontSize: tipSize,
          fontWeight: 600,
          color: colors.textPrimary,
          marginBottom: '8px',
          background: gradientStyles.primary,
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'gradientMove 4s ease infinite',
        }}
      >
        {tip}
      </Paragraph>

      {subTip && (
        <Text
          type="secondary"
          style={{
            fontSize: '14px',
            color: colors.textSecondary,
            marginBottom: showProgress ? '32px' : '0',
            maxWidth: '400px',
            lineHeight: '1.6',
          }}
        >
          {subTip}
        </Text>
      )}

      {showProgress && (
        <div style={{
          width: '100%',
          maxWidth: '360px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: '13px',
              color: colors.textSecondary,
              fontWeight: 500,
            }}>
              正在生成中
            </Text>
            <Text style={{
              fontSize: '15px',
              color: colors.primaryLight,
              fontWeight: 600,
            }}>
              {progress}%
            </Text>
          </div>

          {/* 进度条容器 */}
          <div style={{
            height: '8px',
            backgroundColor: colors.bgTertiary,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.3)',
          }}>
            {/* 进度条 */}
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: gradientStyles.primary,
              backgroundSize: '200% 200%',
              borderRadius: '4px',
              transition: `width ${animationStyles.normal}`,
              animation: 'gradientMove 3s ease infinite',
              position: 'relative',
              boxShadow: shadowStyles.purpleSoft,
            }}>
              {/* 进度条高光 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '50%',
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                borderRadius: '4px 4px 0 0',
              }} />
            </div>

            {/* 闪光效果 */}
            {progress > 0 && progress < 100 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: `${progress}%`,
                width: '40px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                animation: 'shimmer 2s infinite',
                transform: 'translateX(-50%)',
              }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoadingState;

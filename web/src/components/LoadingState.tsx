import React from 'react';
import { Spin, Typography } from 'antd';
import { colors, gradientStyles } from '../theme';

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
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
    }}>
      <Spin
        size={size}
        indicator={
          <div style={{
            fontSize: size === 'large' ? '48px' : size === 'default' ? '32px' : '24px',
            animation: 'spin 1s linear infinite',
          }}>
            ✨
          </div>
        }
        style={{
          marginBottom: '24px',
        }}
      />
      <Paragraph
        style={{
          fontSize: size === 'large' ? '18px' : '16px',
          fontWeight: 500,
          color: colors.textPrimary,
          marginBottom: '8px',
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
            marginBottom: showProgress ? '24px' : '0',
          }}
        >
          {subTip}
        </Text>
      )}
      {showProgress && (
        <div style={{
          width: '100%',
          maxWidth: '300px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <Text style={{ fontSize: '13px', color: colors.textSecondary }}>
              进度
            </Text>
            <Text style={{ fontSize: '13px', color: colors.primary, fontWeight: 500 }}>
              {progress}%
            </Text>
          </div>
          <div style={{
            height: '6px',
            backgroundColor: colors.bgTertiary,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: gradientStyles.primary,
              borderRadius: '3px',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;

import React from 'react';
import { Button, Typography, Space } from 'antd';
import { ReloadOutlined, LeftOutlined } from '@ant-design/icons';
import { colors as themeColors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph } = Typography;

interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: 'retry' | 'back' | 'custom';
  customAction?: React.ReactNode;
  onRetry?: () => void;
  onBack?: () => void;
  size?: 'small' | 'large';
  type?: 'warning' | 'error' | 'info';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = '哎呀，出错了！',
  description = '我们的魔法似乎遇到了一些问题，请稍后再试。',
  action = 'retry',
  customAction,
  onRetry,
  onBack,
  size = 'large',
  type = 'error',
}) => {
  // 根据错误类型选择颜色
  const getTypeColors = () => {
    switch (type) {
      case 'warning':
        return {
          icon: '⚠️',
          text: themeColors.warning,
          bg: 'rgba(250, 173, 20, 0.1)',
        };
      case 'info':
        return {
          icon: 'ℹ️',
          text: themeColors.info,
          bg: 'rgba(24, 144, 255, 0.1)',
        };
      default: // error
        return {
          icon: '🚫',
          text: themeColors.error,
          bg: 'rgba(255, 77, 79, 0.1)',
        };
    }
  };

  const typeColors = getTypeColors();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: size === 'large' ? '80px 32px' : '48px 32px',
      textAlign: 'center',
      borderRadius: '16px',
      background: typeColors.bg,
      border: `1px solid ${typeColors.text}20`,
    }}>
      <div style={{
        fontSize: size === 'large' ? '64px' : '32px',
        marginBottom: size === 'large' ? '32px' : '24px',
        color: typeColors.text,
      }}>
        {typeColors.icon}
      </div>

      <Title level={size === 'large' ? 2 : 4} style={{
        marginBottom: '12px',
        color: typeColors.text,
      }}>
        {title}
      </Title>

      <Paragraph style={{
        fontSize: size === 'large' ? '16px' : '14px',
        color: themeColors.textSecondary,
        marginBottom: size === 'large' ? '32px' : '24px',
        lineHeight: '1.6',
      }}>
        {description}
      </Paragraph>

      <Space size="middle">
        {action === 'retry' && (
          <Button
            type="primary"
            size={size === 'large' ? 'large' : 'middle'}
            icon={<ReloadOutlined />}
            onClick={onRetry}
            style={{
              background: gradientStyles.primary,
              border: 'none',
              height: size === 'large' ? '56px' : '48px',
              padding: size === 'large' ? '0 32px' : '0 28px',
              borderRadius: '12px',
              fontWeight: 500,
              boxShadow: shadowStyles.purple,
              transition: 'all 0.2s ease',
              fontSize: size === 'large' ? '16px' : '14px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 40px rgba(107, 63, 160, 0.6)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = shadowStyles.purple;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            再试一次
          </Button>
        )}

        {action === 'back' && onBack && (
          <Button
            type="default"
            size={size === 'large' ? 'large' : 'middle'}
            icon={<LeftOutlined />}
            onClick={onBack}
            style={{
              background: themeColors.bgTertiary,
              borderColor: themeColors.border,
              color: themeColors.textPrimary,
              height: size === 'large' ? '56px' : '48px',
              padding: size === 'large' ? '0 32px' : '0 28px',
              borderRadius: '12px',
              fontSize: size === 'large' ? '16px' : '14px',
            }}
          >
            返回上一页
          </Button>
        )}

        {action === 'custom' && customAction}
      </Space>
    </div>
  );
};

export default ErrorState;

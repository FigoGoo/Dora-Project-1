import React from 'react';
import { Button, Tooltip, FloatButton } from 'antd';
import {
  QuestionCircleOutlined,
  PlayCircleOutlined,
  BookOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

interface HelpButtonProps {
  type?: 'floating' | 'button';
  topic?: string;
  label?: string;
}

const HelpButton: React.FC<HelpButtonProps> = ({
  type = 'floating',
  topic,
  label,
}) => {
  const { setHelpVisible, setCurrentHelpTopic } = useAppStore();

  const handleClick = () => {
    if (topic) {
      setCurrentHelpTopic(topic);
    }
    setHelpVisible(true);
  };

  if (type === 'button') {
    return (
      <Button
        icon={<QuestionCircleOutlined />}
        onClick={handleClick}
        style={{
          background: colors.bgTertiary,
          borderColor: colors.border,
          color: colors.textSecondary,
          borderRadius: '12px',
        }}
      >
        {label || '帮助'}
      </Button>
    );
  }

  return (
    <Tooltip title="获取帮助">
      <FloatButton
        icon={<QuestionCircleOutlined />}
        onClick={handleClick}
        style={{
          background: gradientStyles.primary,
          boxShadow: shadowStyles.purple,
        }}
      />
    </Tooltip>
  );
};

export default HelpButton;

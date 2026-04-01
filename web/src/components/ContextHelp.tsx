import React, { useState, useEffect } from 'react';
import { Tooltip, Popover, Typography, Tag, Button, Space } from 'antd';
import {
  QuestionCircleOutlined,
  LightbulbOutlined,
  BulbOutlined,
} from '@ant-design/icons';
import { colors, shadowStyles } from '../theme';

const { Text, Paragraph } = Typography;

interface ContextHelpProps {
  topic: 'inspiration' | 'script' | 'storyboard' | 'image' | 'video' | 'publish';
  children?: React.ReactNode;
  type?: 'tooltip' | 'popover' | 'inline';
}

// 上下文帮助内容
const HELP_CONTENTS = {
  inspiration: {
    title: '灵感输入技巧',
    tips: [
      {
        icon: '💡',
        title: '描述具体场景',
        content: '比如："在一个雨天的黄昏，主角站在咖啡馆的窗边..."',
      },
      {
        icon: '🎭',
        title: '加入角色设定',
        content: '描述角色的性格、外貌、背景，让故事更生动',
      },
      {
        icon: '🎨',
        title: '说明视觉风格',
        content: '你想要的是卡通风格、写实风格、还是水墨风格？',
      },
      {
        icon: '📝',
        title: '控制故事节奏',
        content: '提及时长，比如15秒、1分钟，AI会相应调整情节密度',
      },
    ],
  },
  script: {
    title: '剧本编辑技巧',
    tips: [
      {
        icon: '📖',
        title: '保持结构清晰',
        content: '每个场景都应该有明确的开端、发展、高潮',
      },
      {
        icon: '💬',
        title: '对话要自然',
        content: '让角色的对话符合他们的性格和背景',
      },
      {
        icon: '⏱️',
        title: '控制时长',
        content: '一般每分钟约150-200字，根据需要调整剧本长度',
      },
    ],
  },
  storyboard: {
    title: '分镜设计技巧',
    tips: [
      {
        icon: '🎬',
        title: '选择合适的景别',
        content: '全景展示环境，中景展示动作，近景展示情感',
      },
      {
        icon: '📐',
        title: '注意镜头运动',
        content: '推、拉、摇、移，不同的运动带来不同的情绪',
      },
      {
        icon: '🌈',
        title: '考虑光影',
        content: '光影可以营造氛围，增强情绪表达',
      },
    ],
  },
  image: {
    title: '画面生成技巧',
    tips: [
      {
        icon: '🎨',
        title: '详细描述画面',
        content: '越具体的描述，生成的画面越符合预期',
      },
      {
        icon: '🔧',
        title: '添加技术描述',
        content: '如"4K、HDR、电影级光影"可以提高画面质量',
      },
      {
        icon: '🎭',
        title: '说明艺术风格',
        content: '可以参考具体的艺术家、电影或艺术流派',
      },
    ],
  },
  video: {
    title: '视频生成技巧',
    tips: [
      {
        icon: '🎬',
        title: '保持镜头连贯',
        content: '相邻镜头的风格和色调要保持一致',
      },
      {
        icon: '⏱️',
        title: '控制每个镜头时长',
        content: '一般3-5秒的镜头比较合适',
      },
      {
        icon: '🎵',
        title: '考虑音乐节奏',
        content: '视频节奏要与背景音乐匹配',
      },
    ],
  },
  publish: {
    title: '发布推广技巧',
    tips: [
      {
        icon: '📱',
        title: '选择合适的平台',
        content: '抖音适合竖屏短视频，B站适合长视频',
      },
      {
        icon: '🏷️',
        title: '添加热门话题',
        content: '相关的话题标签可以增加曝光',
      },
      {
        icon: '⏰',
        title: '选择发布时间',
        content: '工作日晚上和周末是流量高峰',
      },
    ],
  },
};

const ContextHelp: React.FC<ContextHelpProps> = ({ topic, children, type = 'tooltip' }) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const content = HELP_CONTENTS[topic];

  if (type === 'inline') {
    return (
      <div
        style={{
          background: 'rgba(107, 63, 160, 0.08)',
          border: '1px solid rgba(107, 63, 160, 0.2)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <LightbulbOutlined style={{ fontSize: '24px', color: colors.primary }} />
          <Text strong style={{ color: colors.textPrimary, fontSize: '16px' }}>
            {content.title}
          </Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {content.tips.map((tip, index) => (
            <div
              key={index}
              style={{
                background: colors.bgTertiary,
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>{tip.icon}</span>
                <Text strong style={{ color: colors.textPrimary }}>
                  {tip.title}
                </Text>
              </div>
              <Paragraph style={{ color: colors.textSecondary, margin: 0, fontSize: '13px' }}>
                {tip.content}
              </Paragraph>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const popoverContent = (
    <div style={{ width: 320 }}>
      <div style={{ marginBottom: '16px' }}>
        <Text strong style={{ color: colors.textPrimary, fontSize: '15px' }}>
          {content.title}
        </Text>
      </div>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {content.tips.slice(0, 3).map((tip, index) => (
          <div key={index}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '18px' }}>{tip.icon}</span>
              <Text strong style={{ color: colors.textPrimary, fontSize: '13px' }}>
                {tip.title}
              </Text>
            </div>
            <Text style={{ color: colors.textSecondary, fontSize: '12px' }}>
              {tip.content}
            </Text>
          </div>
        ))}
      </Space>
    </div>
  );

  if (type === 'popover') {
    return (
      <Popover
        content={popoverContent}
        title={null}
        open={popoverVisible}
        onOpenChange={setPopoverVisible}
        trigger="click"
        placement="top"
        styles={{
          body: {
            background: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            boxShadow: shadowStyles.popover,
          },
        }}
      >
        <Button
          type="text"
          icon={<LightbulbOutlined />}
          style={{
            color: popoverVisible ? colors.primary : colors.textSecondary,
            background: popoverVisible ? 'rgba(107, 63, 160, 0.1)' : 'transparent',
            borderRadius: '10px',
          }}
        >
          技巧提示
        </Button>
      </Popover>
    );
  }

  // 默认 tooltip
  return (
    <Tooltip
      title={
        <div style={{ padding: '4px 0' }}>
          <Text strong>{content.title}</Text>
          <Paragraph style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
            点击查看详细技巧
          </Paragraph>
        </div>
      }
    >
      {children || (
        <QuestionCircleOutlined
          style={{
            color: colors.textTertiary,
            cursor: 'pointer',
            fontSize: '18px',
          }}
        />
      )}
    </Tooltip>
  );
};

export default ContextHelp;

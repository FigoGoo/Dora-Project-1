import React, { useState } from 'react';
import {
  Modal,
  Tabs,
  Typography,
  Card,
  Space,
  Input,
  List,
  Tag,
  Button,
  Empty,
  Collapse,
} from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  RocketOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Panel } = Collapse;

// 视频教程数据
const VIDEO_TUTORIALS = [
  {
    id: 'quick-start',
    title: '3分钟快速入门',
    duration: '03:12',
    thumbnail: '🚀',
    description: '从零开始，快速创建你的第一个视频项目',
    tags: ['新手推荐', '必看'],
  },
  {
    id: 'inspiration-tips',
    title: '如何写出好灵感',
    duration: '05:45',
    thumbnail: '✨',
    description: '掌握灵感描述的技巧，让生成效果更出色',
    tags: ['进阶技巧', '灵感输入'],
  },
  {
    id: 'script-editing',
    title: '剧本编辑技巧',
    duration: '08:20',
    thumbnail: '📝',
    description: '学习如何编辑和优化AI生成的剧本',
    tags: ['剧本编辑', '进阶'],
  },
  {
    id: 'storyboard-guide',
    title: '分镜拆解详解',
    duration: '06:30',
    thumbnail: '🎬',
    description: '理解分镜的作用，掌握调整方法',
    tags: ['分镜', '进阶'],
  },
  {
    id: 'image-editing',
    title: '画面生成与调整',
    duration: '10:15',
    thumbnail: '🎨',
    description: '如何生成满意的画面，掌握提示词技巧',
    tags: ['画面生成', '提示词'],
  },
  {
    id: 'export-share',
    title: '导出与分享',
    duration: '04:20',
    thumbnail: '📤',
    description: '导出你的作品，分享到各大平台',
    tags: ['导出', '分享'],
  },
];

// 常见问题数据
const FAQ_TOPICS = [
  {
    category: '基础问题',
    icon: '❓',
    questions: [
      {
        question: 'Dora魔盒是什么？',
        answer: 'Dora魔盒是一款AI驱动的视频创作工具，它可以将你的灵感描述自动转化为完整的视频作品，无需专业的视频制作技能。',
      },
      {
        question: '需要什么技术背景才能使用？',
        answer: '不需要任何技术背景！我们的设计理念是让任何人都能轻松创作视频。只需要会打字描述你的想法即可。',
      },
      {
        question: '生成一个视频需要多长时间？',
        answer: '通常需要10-30分钟，具体时间取决于视频长度和复杂度。你可以随时查看进度，也可以让任务在后台运行。',
      },
    ],
  },
  {
    category: '灵感输入',
    icon: '✨',
    questions: [
      {
        question: '如何写出好的灵感描述？',
        answer: '好的灵感描述应该包含：主要角色、故事背景、关键情节、想要的氛围和风格。示例："在未来都市中，一个小女孩发现了一台神秘的时光机，她决定回到过去帮助小时候的自己。"',
      },
      {
        question: '灵感描述有字数限制吗？',
        answer: '建议在10-500字之间。太短会让AI无法理解你的需求，太长可能会包含不必要的细节。',
      },
      {
        question: '可以使用中文吗？',
        answer: '当然可以！Dora魔盒完美支持中文输入，而且用中文描述通常能获得更好的效果。',
      },
    ],
  },
  {
    category: '模型选择',
    icon: '🧠',
    questions: [
      {
        question: 'DeepSeek和Gemini有什么区别？',
        answer: 'DeepSeek性价比高，适合日常使用；Gemini功能更强大，能处理更复杂的需求，但价格相对较高。新手推荐先使用DeepSeek。',
      },
      {
        question: '可以中途切换模型吗？',
        answer: '可以！每个步骤都可以选择不同的模型。比如用DeepSeek生成剧本，用Gemini生成分镜。',
      },
      {
        question: '模型生成失败怎么办？',
        answer: '别担心，失败不会消耗你的额度。你可以尝试：1.简化你的描述；2.切换到其他模型；3.检查网络连接。',
      },
    ],
  },
  {
    category: '编辑调整',
    icon: '✏️',
    questions: [
      {
        question: '对生成结果不满意怎么办？',
        answer: '你有很多选择：重新生成、手动编辑、调整提示词后再次生成、或者切换模型尝试。所有历史版本都会保存，你可以随时切换。',
      },
      {
        question: '可以只修改某个镜头吗？',
        answer: '完全可以！在分镜和画面阶段，你可以选择单独修改某个镜头，不会影响其他已经完成的部分。',
      },
      {
        question: '如何提高画面质量？',
        answer: '尝试在提示词中加入更具体的视觉描述，比如"4K画质，电影级光影，细腻的纹理"等。也可以尝试不同的视觉风格。',
      },
    ],
  },
  {
    category: '导出分享',
    icon: '🚀',
    questions: [
      {
        question: '支持哪些导出格式？',
        answer: '支持MP4、MOV等主流视频格式，以及GIF动图格式。你可以根据需要选择不同的分辨率。',
      },
      {
        question: '可以直接分享到社交媒体吗？',
        answer: '可以！我们支持一键分享到抖音、B站、小红书等主流平台。也可以下载到本地后手动分享。',
      },
      {
        question: '生成的视频版权归谁？',
        answer: '你创作的视频版权完全归你所有！你可以自由使用、分享和商用。',
      },
    ],
  },
];

// 快速入门指南
const QUICK_GUIDE = [
  {
    step: 1,
    icon: '✨',
    title: '输入灵感',
    description: '在灵感页面描述你想要的视频，选择视频类型和风格',
  },
  {
    step: 2,
    icon: '📝',
    title: '生成剧本',
    description: '点击"生成剧本"，AI会自动为你创作完整的剧本',
  },
  {
    step: 3,
    icon: '🎬',
    title: '查看分镜',
    description: '剧本会自动拆解成分镜，你可以调整每个镜头',
  },
  {
    step: 4,
    icon: '🎨',
    title: '生成画面',
    description: '为每个镜头生成精美的画面，可以反复调整',
  },
  {
    step: 5,
    icon: '🎥',
    title: '生成视频',
    description: '将画面转化为动态视频，添加转场和音乐',
  },
  {
    step: 6,
    icon: '🚀',
    title: '导出分享',
    description: '下载你的作品，或一键分享到社交媒体',
  },
];

const HelpModal: React.FC = () => {
  const { helpVisible, currentHelpTopic, setHelpVisible, setCurrentHelpTopic } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<string>(currentHelpTopic || 'guide');

  const handleClose = () => {
    setHelpVisible(false);
    setCurrentHelpTopic(null);
  };

  // 过滤搜索结果
  const filterContent = (content: string) => {
    if (!searchText) return true;
    return content.toLowerCase().includes(searchText.toLowerCase());
  };

  const filteredVideos = VIDEO_TUTORIALS.filter(
    (v) => filterContent(v.title) || filterContent(v.description)
  );

  const filteredFAQs = FAQ_TOPICS.map((topic) => ({
    ...topic,
    questions: topic.questions.filter(
      (q) => filterContent(q.question) || filterContent(q.answer)
    ),
  })).filter((topic) => topic.questions.length > 0);

  const tabItems = [
    {
      key: 'guide',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOutlined />
          快速入门
        </span>
      ),
    },
    {
      key: 'video',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlayCircleOutlined />
          视频教程
        </span>
      ),
    },
    {
      key: 'faq',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QuestionCircleOutlined />
          常见问题
        </span>
      ),
    },
  ];

  return (
    <Modal
      open={helpVisible}
      onCancel={handleClose}
      footer={null}
      width={900}
      centered
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🎓</span>
          <span style={{ fontSize: '20px', fontWeight: 600, color: colors.textPrimary }}>
            Dora 帮助中心
          </span>
        </div>
      }
      styles={{
        content: {
          background: colors.bgCard,
          borderRadius: '24px',
          border: `1px solid ${colors.border}`,
          boxShadow: shadowStyles.modal,
        },
      }}
    >
      <div style={{ marginBottom: '24px' }}>
        <Search
          placeholder="搜索帮助内容..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="large"
          style={{ borderRadius: '12px' }}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ marginBottom: '24px' }}
      />

      {/* 快速入门 */}
      {activeTab === 'guide' && (
        <div>
          <Title level={4} style={{ color: colors.textPrimary, marginBottom: '24px' }}>
            6步开始你的创作之旅
          </Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {QUICK_GUIDE.map((item) => (
              <Card
                key={item.step}
                size="small"
                style={{
                  background: colors.bgTertiary,
                  borderColor: colors.border,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '16px',
                      background: gradientStyles.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      <Tag
                        style={{
                          background: 'rgba(107, 63, 160, 0.2)',
                          color: colors.primary,
                          border: 'none',
                        }}
                      >
                        步骤 {item.step}
                      </Tag>
                      <Text strong style={{ color: colors.textPrimary, fontSize: '16px' }}>
                        {item.title}
                      </Text>
                    </div>
                    <Text style={{ color: colors.textSecondary }}>
                      {item.description}
                    </Text>
                  </div>
                  <ArrowRightOutlined style={{ color: colors.textTertiary }} />
                </div>
              </Card>
            ))}
          </Space>
        </div>
      )}

      {/* 视频教程 */}
      {activeTab === 'video' && (
        <div>
          {filteredVideos.length === 0 ? (
            <Empty description="没有找到相关视频教程" />
          ) : (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
              dataSource={filteredVideos}
              renderItem={(video) => (
                <List.Item>
                  <Card
                    hoverable
                    style={{
                      background: colors.bgTertiary,
                      borderColor: colors.border,
                      borderRadius: '16px',
                    }}
                    cover={
                      <div
                        style={{
                          height: '160px',
                          background: colors.bgSecondary,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                      >
                        <span style={{ fontSize: '64px', marginBottom: '8px' }}>
                          {video.thumbnail}
                        </span>
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '12px',
                            right: '12px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          {video.duration}
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta
                      title={
                        <span style={{ color: colors.textPrimary }}>{video.title}</span>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2 }}
                            style={{
                              color: colors.textSecondary,
                              marginBottom: '8px',
                              fontSize: '13px',
                            }}
                          >
                            {video.description}
                          </Paragraph>
                          <Space size={[4, 4]} wrap>
                            {video.tags.map((tag) => (
                              <Tag
                                key={tag}
                                size="small"
                                style={{
                                  background: 'rgba(107, 63, 160, 0.15)',
                                  color: colors.primary,
                                  border: 'none',
                                }}
                              >
                                {tag}
                              </Tag>
                            ))}
                          </Space>
                        </div>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          )}
        </div>
      )}

      {/* 常见问题 */}
      {activeTab === 'faq' && (
        <div>
          {filteredFAQs.length === 0 ? (
            <Empty description="没有找到相关问题" />
          ) : (
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {filteredFAQs.map((topic) => (
                <div key={topic.category}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{topic.icon}</span>
                    <Title level={4} style={{ color: colors.textPrimary, margin: 0 }}>
                      {topic.category}
                    </Title>
                  </div>
                  <Collapse
                    ghost
                    style={{ background: colors.bgTertiary, borderRadius: '12px' }}
                  >
                    {topic.questions.map((q, index) => (
                      <Panel
                        key={index}
                        header={<span style={{ color: colors.textPrimary }}>{q.question}</span>}
                      >
                        <Paragraph style={{ color: colors.textSecondary, margin: 0 }}>
                          {q.answer}
                        </Paragraph>
                      </Panel>
                    ))}
                  </Collapse>
                </div>
              ))}
            </Space>
          )}
        </div>
      )}
    </Modal>
  );
};

export default HelpModal;

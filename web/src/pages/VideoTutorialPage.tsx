import React, { useState } from 'react';
import {
  Card,
  Typography,
  Input,
  List,
  Tag,
  Space,
  Empty,
  Button,
  Divider,
  message,
  Modal,
  Select,
  Tabs,
} from 'antd';
import {
  SearchOutlined,
  PlayCircleOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  BookOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

// 完整视频教程列表（详细版）
const FULL_VIDEO_TUTORIALS = [
  {
    id: 'beginner-series',
    series: '新手系列',
    icon: '🚀',
    title: '新手必看：从0到1创建视频',
    duration: '08:30',
    thumbnail: '🎁',
    description: '完整的项目流程演示，让你快速上手',
    difficulty: '初级',
    views: '1.2万',
    rating: 4.9,
    tags: ['新手', '完整流程'],
  },
  {
    id: 'inspiration-mastery',
    series: '灵感输入',
    icon: '✨',
    title: '写出好灵感的10个技巧',
    duration: '12:45',
    thumbnail: '💡',
    description: '掌握灵感描述的核心方法，让AI理解你的需求',
    difficulty: '初级',
    views: '8.5k',
    rating: 4.8,
    tags: ['灵感', '技巧'],
  },
  {
    id: 'script-writing',
    series: '剧本创作',
    icon: '📝',
    title: '如何获得完美的剧本',
    duration: '15:20',
    thumbnail: '📖',
    description: '剧本结构分析，以及如何优化AI生成的剧本',
    difficulty: '中级',
    views: '6.3k',
    rating: 4.7,
    tags: ['剧本', '编辑'],
  },
  {
    id: 'storyboard-design',
    series: '分镜设计',
    icon: '🎬',
    title: '分镜艺术：镜头语言基础',
    duration: '20:15',
    thumbnail: '🎨',
    description: '学习镜头设计、景别、视角，提升画面质量',
    difficulty: '高级',
    views: '4.2k',
    rating: 4.9,
    tags: ['分镜', '专业'],
  },
  {
    id: 'prompt-engineering',
    series: '提示词工程',
    icon: '🧠',
    title: '提示词进阶：精准控制',
    duration: '18:30',
    thumbnail: '⚙️',
    description: '掌握提示词的艺术，让AI生成更符合预期的内容',
    difficulty: '高级',
    views: '9.1k',
    rating: 4.8,
    tags: ['提示词', 'AI'],
  },
  {
    id: 'style-customization',
    series: '风格定制',
    icon: '🎨',
    title: '风格迁移：打造独特视觉',
    duration: '16:45',
    thumbnail: '🎭',
    description: '探索各种视觉风格，创造只属于你的独特画面',
    difficulty: '中级',
    views: '7.8k',
    rating: 4.7,
    tags: ['风格', '艺术'],
  },
  {
    id: 'video-editing',
    series: '视频编辑',
    icon: '✂️',
    title: '视频编辑与特效',
    duration: '25:10',
    thumbnail: '🎥',
    description: '后期处理技巧，让你的视频更专业',
    difficulty: '高级',
    views: '5.6k',
    rating: 4.6,
    tags: ['编辑', '特效'],
  },
  {
    id: 'publishing-strategy',
    series: '发布推广',
    icon: '🚀',
    title: '发布策略：快速涨粉',
    duration: '14:20',
    thumbnail: '📱',
    description: '发布时间、标题优化、话题选择的实战技巧',
    difficulty: '初级',
    views: '10.2k',
    rating: 4.8,
    tags: ['发布', '推广'],
  },
];

// 分类标签
const CATEGORIES = [
  '全部',
  '新手入门',
  '灵感输入',
  '剧本创作',
  '分镜设计',
  '画面生成',
  '视频编辑',
  '发布推广',
];

// 难度级别
const DIFFICULTY = ['全部', '初级', '中级', '高级'];

// 播放历史（模拟数据）
const PLAY_HISTORY = [
  {
    id: 'beginner-series',
    title: '新手必看：从0到1创建视频',
    progress: 65,
    lastWatched: '2天前',
  },
  {
    id: 'inspiration-mastery',
    title: '写出好灵感的10个技巧',
    progress: 100,
    lastWatched: '1周前',
  },
];

// 收藏的教程（模拟数据）
const FAVORITES = [
  {
    id: 'style-customization',
    title: '风格迁移：打造独特视觉',
    description: '探索各种视觉风格，创造只属于你的独特画面',
  },
  {
    id: 'publishing-strategy',
    title: '发布策略：快速涨粉',
    description: '发布时间、标题优化、话题选择的实战技巧',
  },
];

const VideoTutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedDifficulty, setSelectedDifficulty] = useState('全部');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [playModalVisible, setPlayModalVisible] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // 过滤教程列表
  const filteredVideos = FULL_VIDEO_TUTORIALS.filter((video) => {
    const matchesSearch =
      !searchText ||
      video.title.toLowerCase().includes(searchText.toLowerCase()) ||
      video.description.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      selectedCategory === '全部' ||
      video.series.includes(selectedCategory) ||
      video.tags.some((tag) => tag.includes(selectedCategory));

    const matchesDifficulty = selectedDifficulty === '全部' || video.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handlePlay = (videoId: string) => {
    setPlayingVideo(videoId);
    setPlayModalVisible(true);
    message.success('正在加载视频...');
  };

  const handleCloseModal = () => {
    setPlayModalVisible(false);
    setPlayingVideo(null);
  };

  // 渲染视频卡片
  const renderVideoCard = (video: any) => (
    <List.Item key={video.id}>
      <Card
        hoverable
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '16px',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = shadowStyles.cardHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
        cover={
          <div
            style={{
              height: '200px',
              background: colors.bgTertiary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '16px 16px 0 0',
              position: 'relative',
            }}
            onClick={() => handlePlay(video.id)}
          >
            <span style={{ fontSize: '80px', marginBottom: '8px' }}>
              {video.thumbnail}
            </span>
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(107, 63, 160, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <PlayCircleOutlined style={{ fontSize: '32px', color: '#fff' }} />
            </div>
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
        actions={[
          <Button
            key="play"
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={() => handlePlay(video.id)}
            style={{
              background: gradientStyles.primary,
              border: 'none',
              borderRadius: '12px',
              width: '100%',
            }}
          >
            观看视频
          </Button>,
        ]}
      >
        <Card.Meta
          title={
            <span
              style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 600 }}
            >
              {video.title}
            </span>
          }
          description={
            <div>
              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  color: colors.textSecondary,
                  marginBottom: '12px',
                  fontSize: '13px',
                }}
              >
                {video.description}
              </Paragraph>
              <Space size={[4, 4]} wrap style={{ marginBottom: '12px' }}>
                <Tag style={{ background: 'rgba(107, 63, 160, 0.2)', color: colors.primary }}>
                  {video.series}
                </Tag>
                <Tag style={{ background: 'rgba(0, 212, 255, 0.2)', color: colors.cyan }}>
                  {video.difficulty}
                </Tag>
              </Space>
              <Space size="middle">
                <Text style={{ color: colors.textTertiary, fontSize: '12px' }}>
                  <ClockCircleOutlined /> {video.duration}
                </Text>
                <Text style={{ color: colors.textTertiary, fontSize: '12px' }}>
                  {video.views} 观看
                </Text>
              </Space>
            </div>
          }
        />
      </Card>
    </List.Item>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px' }}>
      <Card
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: shadowStyles.card,
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Title level={1} style={{ color: colors.textPrimary }}>
            <span style={{ fontSize: '48px' }}>🎓</span> Dora 学院
          </Title>
          <Paragraph style={{ color: colors.textSecondary, fontSize: '18px', marginBottom: '32px' }}>
            在这里学习所有创作技巧，从新手到专家
          </Paragraph>

          <div style={{ maxWidth: 700, margin: '0 auto' }}>
            <Search
              placeholder="搜索教程（如：灵感输入、剧本创作）"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              style={{ borderRadius: '12px', marginBottom: '24px' }}
            />
          </div>

          <Space wrap>
            {CATEGORIES.slice(0, 8).map((category) => (
              <Tag
                key={category}
                style={{
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  background:
                    selectedCategory === category
                      ? gradientStyles.primary
                      : colors.bgTertiary,
                  color: selectedCategory === category ? '#fff' : colors.textPrimary,
                  border: `1px solid ${colors.border}`,
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Tag>
            ))}
          </Space>
        </div>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'all',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <VideoCameraOutlined />
                全部教程
              </span>
            ),
          },
          {
            key: 'history',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClockCircleOutlined />
                播放历史 ({PLAY_HISTORY.length})
              </span>
            ),
          },
          {
            key: 'favorites',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⭐</span>
                收藏夹 ({FAVORITES.length})
              </span>
            ),
          },
        ]}
        size="large"
        style={{ marginBottom: '24px' }}
      />

      {activeTab === 'all' && (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
          }}
          dataSource={filteredVideos}
          renderItem={renderVideoCard}
          locale={{
            emptyText: <Empty description="没有找到匹配的教程" />,
          }}
        />
      )}

      {activeTab === 'history' && (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
          }}
          dataSource={PLAY_HISTORY}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card
                hoverable
                style={{
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                }}
                actions={[
                  <Button
                    key="continue"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlay(item.id)}
                    style={{
                      background: gradientStyles.primary,
                      border: 'none',
                      borderRadius: '12px',
                      width: '100%',
                    }}
                  >
                    继续观看
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <span style={{ color: colors.textPrimary, fontSize: '16px' }}>
                      {item.title}
                    </span>
                  }
                  description={
                    <div>
                      <div style={{ marginBottom: '8px' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: '13px' }}>
                          观看进度: {item.progress}%
                        </Text>
                        <div
                          style={{
                            height: '4px',
                            background: colors.border,
                            borderRadius: '2px',
                            marginTop: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${item.progress}%`,
                              background: gradientStyles.primary,
                            }}
                          />
                        </div>
                      </div>
                      <Text style={{ color: colors.textTertiary, fontSize: '12px' }}>
                        最后观看: {item.lastWatched}
                      </Text>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="还没有观看过教程" />,
          }}
        />
      )}

      {activeTab === 'favorites' && (
        <List
          grid={{
            gutter: 24,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 3,
          }}
          dataSource={FAVORITES}
          renderItem={(item) => (
            <List.Item key={item.id}>
              <Card
                hoverable
                style={{
                  background: colors.bgTertiary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '16px',
                }}
                actions={[
                  <Button
                    key="play"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={() => handlePlay(item.id)}
                    style={{
                      background: gradientStyles.primary,
                      border: 'none',
                      borderRadius: '12px',
                      width: '100%',
                    }}
                  >
                    观看视频
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <span style={{ color: colors.textPrimary, fontSize: '16px' }}>
                      {item.title}
                    </span>
                  }
                  description={
                    <div>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{
                          color: colors.textSecondary,
                          marginBottom: '12px',
                          fontSize: '13px',
                        }}
                      >
                        {item.description}
                      </Paragraph>
                      <Tag style={{ background: 'rgba(107, 63, 160, 0.2)', color: colors.primary }}>
                        已收藏
                      </Tag>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
          locale={{
            emptyText: <Empty description="还没有收藏任何教程" />,
          }}
        />
      )}

      {/* 播放模态框 */}
      <Modal
        open={playModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={1000}
        centered
        styles={{
          content: {
            background: colors.bgCard,
            borderRadius: '24px',
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        {playingVideo && (
          <div>
            <div
              style={{
                width: '100%',
                height: '500px',
                background: colors.bgTertiary,
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  fontSize: '120px',
                  animation: 'bounce 1s infinite',
                }}
              >
                🎬
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: colors.textPrimary }}>
                {FULL_VIDEO_TUTORIALS.find((v) => v.id === playingVideo)?.title}
              </Title>
              <Paragraph style={{ color: colors.textSecondary }}>
                {FULL_VIDEO_TUTORIALS.find((v) => v.id === playingVideo)?.description}
              </Paragraph>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
      `}</style>
    </div>
  );
};

export default VideoTutorialPage;

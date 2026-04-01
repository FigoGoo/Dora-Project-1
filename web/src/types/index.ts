// 项目状态类型
export type ProjectStatus = 'draft' | 'inspiration' | 'script' | 'storyboard' | 'image' | 'video' | 'completed' | 'published';

// 视频类型
export type VideoType = '剧情短片' | '科普教育' | '产品宣传' | '动画故事';

// 视频时长
export type VideoDuration = '15-30秒' | '1-2分钟' | '3-5分钟' | '5分钟以上';

// 视觉风格
export type VisualStyle = '赛博朋克' | '宫崎骏风格' | '写实3D' | '像素艺术' | '水墨国风' | '梦幻童话';

// 画面比例
export type AspectRatio = '16:9 (横屏)' | '9:16 (竖屏)' | '1:1 (正方形)' | '4:3 (传统)';

// AI模型类型
export type ModelType = 'deepseek' | 'gemini' | 'banana' | 'seedance';

// 项目数据类型
export interface Project {
  id: string;
  name?: string;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;

  // 灵感输入
  inspiration?: {
    description: string;
    videoType: VideoType;
    duration: VideoDuration;
    style: VisualStyle;
    aspectRatio: AspectRatio;
    model: ModelType;
  };

  // 剧本
  script?: {
    title: string;
    content: string;
    scenes: Scene[];
    versions?: ScriptVersion[];
    currentVersion?: number;
  };

  // 分镜
  storyboard?: StoryboardPanel[];

  // 图片
  images?: ImagePanel[];

  // 视频
  videos?: VideoClip[];

  // 最终视频
  finalVideo?: string;

  // 视频拼接设置
  concatSettings?: {
    transitionType: string;
    transitionDuration: number;
    outputFormat: string;
    outputResolution: string;
    includeAudio: boolean;
    backgroundMusic?: string;
  };
}

// 剧本版本
export interface ScriptVersion {
  id: string;
  versionNumber: number;
  title: string;
  content: string;
  scenes: Scene[];
  createdAt: number;
  createdBy?: string;
  changeDescription?: string;
}

// 剧本场景
export interface Scene {
  id: string;
  number: number;
  title: string;
  content: string;
  duration: string;
  location?: string;
  characters?: string[];
}

// 分镜面板
export interface StoryboardPanel {
  id: string;
  sceneId: string;
  panelNumber: number;
  description: string;
  cameraAngle?: string;
  movement?: string;
  duration?: string;
  notes?: string;
  sketch?: string;
}

// 图片面板
export interface ImagePanel {
  id: string;
  storyboardPanelId: string;
  imageUrl?: string;
  prompt: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  model: ModelType;
  alternatives?: string[];
}

// 视频片段
export interface VideoClip {
  id: string;
  imagePanelId: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  model: ModelType;
  duration: number;
  order?: number;
}

// AI模型配置
export interface ModelConfig {
  id: ModelType;
  name: string;
  icon: string;
  description: string;
  type: 'text' | 'image' | 'video';
  enabled: boolean;
}

// 灵感推荐
export interface InspirationSuggestion {
  id: string;
  emoji: string;
  title: string;
  text: string;
  inspiration: string;
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 生成任务状态
export interface GenerationTask {
  id: string;
  type: 'script' | 'storyboard' | 'image' | 'video';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  projectId: string;
  createdAt: number;
  updatedAt: number;
  result?: any;
  error?: string;
  // 新增字段
  estimatedTime?: number; // 预计完成时间（秒）
  elapsedTime?: number; // 已用时（秒）
  logs?: TaskLog[]; // 实时状态日志
  subTasks?: SubTask[]; // 子任务进度
}

// 任务日志
export interface TaskLog {
  id: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
  details?: string;
}

// 子任务
export interface SubTask {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
}

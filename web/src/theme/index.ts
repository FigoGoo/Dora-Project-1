import { ThemeConfig } from 'antd';

// Dora 魔盒视觉设计系统 - Ant Design 主题配置
export const doraTheme: ThemeConfig = {
  token: {
    // 主色 - 深空紫
    colorPrimary: '#6b3fa0',

    // 功能色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',

    // 背景色
    colorBgBase: '#0a0a0f',
    colorBgContainer: 'rgba(26, 26, 37, 0.8)',
    colorBgElevated: 'rgba(26, 26, 37, 0.9)',

    // 边框色
    colorBorder: 'rgba(107, 63, 160, 0.3)',

    // 文字色
    colorText: '#ffffff',
    colorTextSecondary: '#b0b0c0',
    colorTextTertiary: '#6b6b80',

    // 圆角
    borderRadius: 12,
    borderRadiusSM: 8,
    borderRadiusLG: 20,

    // 字体
    fontFamily: "'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    fontSize: 16,
    fontSizeSM: 14,
    fontSizeLG: 18,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,

    // 间距
    sizeUnit: 4,
    sizeStep: 4,
    sizePopupArrow: 16,
    controlHeight: 40,
    controlHeightSM: 32,
    controlHeightLG: 48,
  },
  components: {
    Button: {
      controlHeight: 44,
      controlHeightSM: 36,
      controlHeightLG: 52,
      borderRadius: 12,
      borderRadiusSM: 8,
      borderRadiusLG: 16,
      fontWeight: 500,
      colorPrimary: '#6b3fa0',
      colorPrimaryHover: '#9b59b6',
      colorPrimaryActive: '#2d1b4e',
    },
    Input: {
      controlHeight: 44,
      controlHeightSM: 36,
      controlHeightLG: 52,
      borderRadius: 12,
      colorBgContainer: 'rgba(26, 26, 37, 0.8)',
      colorBorder: 'rgba(107, 63, 160, 0.3)',
      colorPrimary: '#6b3fa0',
      colorTextPlaceholder: '#6b6b80',
    },
    Select: {
      controlHeight: 44,
      controlHeightSM: 36,
      controlHeightLG: 52,
      borderRadius: 12,
      colorBgContainer: 'rgba(26, 26, 37, 0.8)',
      colorBorder: 'rgba(107, 63, 160, 0.3)',
      colorPrimary: '#6b3fa0',
    },
    Card: {
      colorBgContainer: 'rgba(26, 26, 37, 0.8)',
      colorBorder: 'rgba(107, 63, 160, 0.3)',
      borderRadiusLG: 20,
    },
    Modal: {
      colorBgElevated: 'rgba(26, 26, 37, 0.95)',
      borderRadiusLG: 20,
    },
    Layout: {
      colorBgBody: '#0a0a0f',
      colorBgHeader: 'rgba(18, 18, 26, 0.95)',
    },
    Menu: {
      colorBgContainer: 'rgba(26, 26, 37, 0.95)',
      colorItemText: '#b0b0c0',
      colorItemTextSelected: '#ffffff',
      colorItemBgSelected: 'rgba(107, 63, 160, 0.3)',
    },
    Progress: {
      colorPrimary: '#6b3fa0',
      colorSuccess: '#52c41a',
    },
    Tag: {
      borderRadiusSM: 8,
    },
    Dropdown: {
      colorBgElevated: 'rgba(26, 26, 37, 0.95)',
      borderRadiusLG: 12,
      controlHeight: 40,
    },
  },
};

// 渐变背景样式
export const gradientStyles = {
  primary: 'linear-gradient(135deg, #6b3fa0 0%, #e91e8c 50%, #00d4ff 100%)',
  purple: 'linear-gradient(135deg, #2d1b4e 0%, #6b3fa0 100%)',
  glow: 'linear-gradient(135deg, rgba(107, 63, 160, 0.3) 0%, rgba(233, 30, 140, 0.3) 50%, rgba(0, 212, 255, 0.3) 100%)',
  success: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
};

// 阴影样式
export const shadowStyles = {
  purple: '0 0 30px rgba(107, 63, 160, 0.4)',
  pink: '0 0 30px rgba(233, 30, 140, 0.4)',
  cyan: '0 0 30px rgba(0, 212, 255, 0.4)',
  card: '0 8px 32px rgba(0, 0, 0, 0.3)',
};

// 动画样式
export const animationStyles = {
  fast: '0.2s ease',
  normal: '0.3s ease',
  slow: '0.5s ease',
};

// 色彩变量
export const colors = {
  primary: '#6b3fa0',
  primaryDeep: '#2d1b4e',
  primaryLight: '#9b59b6',
  pink: '#e91e8c',
  cyan: '#00d4ff',
  gold: '#ffd700',
  amber: '#ff9800',

  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgTertiary: '#1a1a25',
  bgCard: 'rgba(26, 26, 37, 0.8)',
  bgGlass: 'rgba(26, 26, 37, 0.6)',

  textPrimary: '#ffffff',
  textSecondary: '#b0b0c0',
  textMuted: '#6b6b80',

  border: 'rgba(107, 63, 160, 0.3)',
  borderLight: 'rgba(107, 63, 160, 0.15)',

  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  info: '#1890ff',
};

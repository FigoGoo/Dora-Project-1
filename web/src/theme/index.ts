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
  primaryHover: 'linear-gradient(135deg, #8b5fc0 0%, #f93e9c 50%, #20f4ff 100%)',
  purple: 'linear-gradient(135deg, #2d1b4e 0%, #6b3fa0 100%)',
  purpleSoft: 'linear-gradient(135deg, rgba(45, 27, 78, 0.8) 0%, rgba(107, 63, 160, 0.8) 100%)',
  glow: 'linear-gradient(135deg, rgba(107, 63, 160, 0.3) 0%, rgba(233, 30, 140, 0.3) 50%, rgba(0, 212, 255, 0.3) 100%)',
  glowStrong: 'linear-gradient(135deg, rgba(107, 63, 160, 0.5) 0%, rgba(233, 30, 140, 0.5) 50%, rgba(0, 212, 255, 0.5) 100%)',
  success: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
  successHover: 'linear-gradient(135deg, #72e43a 0%, #58be2d 100%)',
  warning: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
  error: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
  glass: 'linear-gradient(135deg, rgba(26, 26, 37, 0.6) 0%, rgba(26, 26, 37, 0.4) 100%)',
};

// 阴影样式
export const shadowStyles = {
  purple: '0 0 30px rgba(107, 63, 160, 0.4)',
  purpleSoft: '0 0 20px rgba(107, 63, 160, 0.25)',
  purpleStrong: '0 0 40px rgba(107, 63, 160, 0.6)',
  pink: '0 0 30px rgba(233, 30, 140, 0.4)',
  pinkSoft: '0 0 20px rgba(233, 30, 140, 0.25)',
  cyan: '0 0 30px rgba(0, 212, 255, 0.4)',
  cyanSoft: '0 0 20px rgba(0, 212, 255, 0.25)',
  card: '0 8px 32px rgba(0, 0, 0, 0.3)',
  cardSoft: '0 4px 20px rgba(0, 0, 0, 0.2)',
  cardHover: '0 12px 40px rgba(0, 0, 0, 0.4)',
  button: '0 4px 15px rgba(107, 63, 160, 0.3)',
  buttonHover: '0 6px 25px rgba(107, 63, 160, 0.5)',
  inner: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
  text: '0 0 20px rgba(107, 63, 160, 0.5)',
};

// 动画样式
export const animationStyles = {
  fast: '0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};

// 动画关键帧
export const keyframes = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes floatSlow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(107, 63, 160, 0.4); }
    50% { box-shadow: 0 0 40px rgba(107, 63, 160, 0.7); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes gradientMove {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

// 动画类名
export const animationClasses = {
  float: 'animation-float',
  floatSlow: 'animation-float-slow',
  pulse: 'animation-pulse',
  pulseGlow: 'animation-pulse-glow',
  fadeInUp: 'animation-fade-in-up',
  fadeIn: 'animation-fade-in',
  scaleIn: 'animation-scale-in',
  gradientMove: 'animation-gradient-move',
};

// 色彩变量
export const colors = {
  primary: '#6b3fa0',
  primaryDeep: '#2d1b4e',
  primaryLight: '#9b59b6',
  primaryLighter: '#bb79d6',
  pink: '#e91e8c',
  pinkLight: '#f93e9c',
  cyan: '#00d4ff',
  cyanLight: '#20f4ff',
  gold: '#ffd700',
  amber: '#ff9800',

  bgPrimary: '#0a0a0f',
  bgSecondary: '#12121a',
  bgTertiary: '#1a1a25',
  bgCard: 'rgba(26, 26, 37, 0.8)',
  bgGlass: 'rgba(26, 26, 37, 0.6)',
  bgGlassStrong: 'rgba(26, 26, 37, 0.9)',

  textPrimary: '#ffffff',
  textSecondary: '#b0b0c0',
  textTertiary: '#808090',
  textMuted: '#6b6b80',

  border: 'rgba(107, 63, 160, 0.3)',
  borderLight: 'rgba(107, 63, 160, 0.15)',
  borderHover: 'rgba(107, 63, 160, 0.5)',

  success: '#52c41a',
  successLight: '#72e43a',
  warning: '#faad14',
  warningLight: '#fccd44',
  error: '#ff4d4f',
  errorLight: '#ff7d7f',
  info: '#1890ff',
  infoLight: '#38b0ff',
};

// 通用样式工具
export const styleUtils = {
  glassCard: {
    background: colors.bgCard,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${colors.border}`,
  },

  glassCardHover: {
    borderColor: colors.borderHover,
    boxShadow: shadowStyles.cardHover,
    transform: 'translateY(-2px)',
  },

  gradientButton: {
    background: gradientStyles.primary,
    border: 'none',
    transition: `all ${animationStyles.fast}`,
  },

  gradientButtonHover: {
    background: gradientStyles.primaryHover,
    boxShadow: shadowStyles.buttonHover,
    transform: 'translateY(-1px)',
  },

  inputStyle: {
    background: colors.bgTertiary,
    borderColor: colors.border,
    color: colors.textPrimary,
  },

  inputFocus: {
    borderColor: colors.primary,
    boxShadow: `0 0 0 2px rgba(107, 63, 160, 0.2)`,
  },

  tagPurple: {
    background: 'rgba(107, 63, 160, 0.2)',
    color: colors.primary,
    border: 'none',
  },

  tagPink: {
    background: 'rgba(233, 30, 140, 0.2)',
    color: colors.pink,
    border: 'none',
  },

  tagCyan: {
    background: 'rgba(0, 212, 255, 0.2)',
    color: colors.cyan,
    border: 'none',
  },

  tagSuccess: {
    background: 'rgba(82, 196, 26, 0.2)',
    color: colors.success,
    border: 'none',
  },

  tagWarning: {
    background: 'rgba(250, 173, 20, 0.2)',
    color: colors.warning,
    border: 'none',
  },

  tagError: {
    background: 'rgba(255, 77, 79, 0.2)',
    color: colors.error,
    border: 'none',
  },
};

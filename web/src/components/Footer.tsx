import React from 'react';
import { Layout, Tooltip } from 'antd';
import { colors, gradientStyles } from '../theme';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        backgroundColor: colors.bgSecondary,
        borderTop: `1px solid ${colors.borderLight}`,
        padding: '32px 32px',
        color: colors.textSecondary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 底部装饰光晕 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '100px',
        background: 'radial-gradient(ellipse at center, rgba(107, 63, 160, 0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* Logo 区域 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '10px',
          background: 'rgba(107, 63, 160, 0.1)',
          border: '1px solid rgba(107, 63, 160, 0.2)',
        }}>
          <span style={{ fontSize: '20px', animation: 'floatSlow 4s ease-in-out infinite' }}>🎁</span>
          <span style={{
            fontWeight: 600,
            background: gradientStyles.primary,
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradientMove 6s ease infinite',
          }}>
            Dora 魔盒
          </span>
        </div>

        <div style={{ color: colors.textMuted, opacity: 0.5 }}>•</div>

        <div style={{
          color: colors.textMuted,
          fontSize: '14px',
        }}>
          ©{new Date().getFullYear()} 版权所有
        </div>

        <div style={{ color: colors.textMuted, opacity: 0.5 }}>•</div>

        <div style={{
          color: colors.textMuted,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          基于
          <Tooltip title="CloudWeGo - 高性能微服务框架">
            <a
              href="https://www.cloudwego.io/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: colors.primaryLight,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = colors.pink;
                e.currentTarget.style.background = 'rgba(233, 30, 140, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = colors.primaryLight;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              CloudWeGo
            </a>
          </Tooltip>
          构建
        </div>

        {/* 技术栈标签 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginLeft: '8px',
        }}>
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(107, 63, 160, 0.15)',
            color: colors.primaryLight,
            border: '1px solid rgba(107, 63, 160, 0.2)',
          }}>
            Kitex
          </span>
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(233, 30, 140, 0.15)',
            color: colors.pink,
            border: '1px solid rgba(233, 30, 140, 0.2)',
          }}>
            Hertz
          </span>
          <span style={{
            fontSize: '12px',
            padding: '2px 8px',
            borderRadius: '6px',
            background: 'rgba(0, 212, 255, 0.15)',
            color: colors.cyan,
            border: '1px solid rgba(0, 212, 255, 0.2)',
          }}>
            React
          </span>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;

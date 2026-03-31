import React from 'react';
import { Layout } from 'antd';
import { colors } from '../theme';

const { Footer: AntFooter } = Layout;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        backgroundColor: colors.bgSecondary,
        borderTop: `1px solid ${colors.borderLight}`,
        padding: '24px 32px',
        color: colors.textSecondary,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🎁</span>
          <span>Dora 魔盒</span>
        </div>
        <div style={{ color: colors.textMuted }}>|</div>
        <div>©{new Date().getFullYear()} 版权所有</div>
        <div style={{ color: colors.textMuted }}>|</div>
        <div style={{ color: colors.textMuted }}>
          基于 <a
            href="https://www.cloudwego.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: colors.primaryLight,
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.pink;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.primaryLight;
            }}
          >CloudWeGo</a> 构建
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;

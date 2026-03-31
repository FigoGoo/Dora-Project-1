import React from 'react';
import { Button, Result, Typography } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { colors, gradientStyles, shadowStyles } from '../theme';

const { Paragraph } = Typography;

const NotFoundPage: React.FC = () => {

  return (
    <Result
      status="404"
      title={<span style={{ color: colors.textPrimary }}>404</span>}
      subTitle={<span style={{ color: colors.textSecondary }}>抱歉，您访问的页面不存在。</span>}
      extra={
        <Button
          type="primary"
          icon={<LeftOutlined />}
          href="#/"
          style={{
            background: gradientStyles.primary,
            border: 'none',
            height: '48px',
            padding: '0 28px',
            borderRadius: '12px',
            fontWeight: 500,
            boxShadow: shadowStyles.purple,
            transition: 'all 0.2s ease',
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
          返回首页
        </Button>
      }
      style={{
        background: colors.bgCard,
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        borderRadius: '20px',
        boxShadow: shadowStyles.card,
        padding: '64px 48px',
        marginTop: '64px',
      }}
    >
      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Paragraph style={{ color: colors.textSecondary }}>您可能是</Paragraph>
        <Paragraph style={{ color: colors.textSecondary }}>
          - 输入了错误的地址<br />
          - 页面已被删除<br />
          - 或者页面正在建设中
        </Paragraph>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '20px' }}>
          如果您有任何疑问，请联系我们的技术支持团队。
        </div>
      </div>
    </Result>
  );
};

export default NotFoundPage;

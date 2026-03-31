import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, message, Spin, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { useAppStore } from './store';
import { doraTheme } from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import InspirationPage from './pages/InspirationPage';
import ScriptEditorPage from './pages/ScriptEditorPage';
import StoryboardPage from './pages/StoryboardPage';
import ImageEditorPage from './pages/ImageEditorPage';
import VideoEditorPage from './pages/VideoEditorPage';
import PublishPage from './pages/PublishPage';
import NotFoundPage from './pages/NotFoundPage';
import { colors } from './theme';

const { Content } = Layout;

function App() {
  const { currentProject, isLoading, error, setError } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();

  // 处理错误
  useEffect(() => {
    if (error) {
      messageApi.error(error);
      setError(null);
    }
  }, [error, messageApi, setError]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={doraTheme}
    >
      {contextHolder}
      <Layout style={{ minHeight: '100vh', background: colors.bgPrimary }}>
        <Header />
        <Content
          style={{
            padding: '32px 24px',
            margin: '0 auto',
            maxWidth: 1440,
            width: '100%',
            flex: 1,
          }}
        >
          {isLoading && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(10, 10, 15, 0.9)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
            }}>
              <div style={{ textAlign: 'center' }}>
                <Spin
                  size="large"
                  tip={
                    <span style={{ color: colors.textSecondary, marginTop: '16px' }}>
                      正在施展魔法...
                    </span>
                  }
                  style={{ color: colors.primary }}
                />
              </div>
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inspiration" element={<InspirationPage />} />
            <Route
              path="/script-editor"
              element={
                currentProject ? <ScriptEditorPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/storyboard"
              element={
                currentProject ? <StoryboardPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/image-editor"
              element={
                currentProject ? <ImageEditorPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/video-editor"
              element={
                currentProject ? <VideoEditorPage /> : <Navigate to="/" replace />
              }
            />
            <Route
              path="/publish"
              element={
                currentProject ? <PublishPage /> : <Navigate to="/" replace />
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </ConfigProvider>
  );
}

export default App;

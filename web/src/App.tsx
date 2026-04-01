import { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, message, Spin, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import { useAppStore } from './store';
import { doraTheme } from './theme';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { colors } from './theme';
import NewUserTour from './components/NewUserTour';
import HelpModal from './components/HelpModal';
import HelpButton from './components/HelpButton';

// 路由懒加载
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InspirationPage = lazy(() => import('./pages/InspirationPage'));
const ScriptEditorPage = lazy(() => import('./pages/ScriptEditorPage'));
const StoryboardPage = lazy(() => import('./pages/StoryboardPage'));
const ImageEditorPage = lazy(() => import('./pages/ImageEditorPage'));
const VideoEditorPage = lazy(() => import('./pages/VideoEditorPage'));
const PublishPage = lazy(() => import('./pages/PublishPage'));
const VideoTutorialPage = lazy(() => import('./pages/VideoTutorialPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const { Content, Sider } = Layout;

// 页面加载骨架屏
const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  }}>
    <div style={{ textAlign: 'center' }}>
      <Spin
        size="large"
        tip={
          <span style={{ color: colors.textSecondary, marginTop: '16px' }}>
            页面加载中...
          </span>
        }
        style={{ color: colors.primary }}
      />
    </div>
  </div>
);

function App() {
  const {
    currentProject,
    isLoading,
    error,
    setError,
    isFirstTime,
    setTourVisible,
    projects,
  } = useAppStore();
  const [messageApi, contextHolder] = message.useMessage();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 处理错误
  useEffect(() => {
    if (error) {
      messageApi.error(error);
      setError(null);
    }
  }, [error, messageApi, setError]);

  // 首次使用显示新手引导
  useEffect(() => {
    if (isFirstTime && projects.length === 0) {
      // 延迟一下显示，让页面先加载
      const timer = setTimeout(() => {
        setTourVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTime, projects.length, setTourVisible]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={doraTheme}
    >
      {contextHolder}
      <NewUserTour />
      <HelpModal />
      <Layout style={{ minHeight: '100vh', background: colors.bgPrimary }}>
        <Sider
          width={280}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          theme="light"
          style={{
            background: colors.bgCard,
            borderRight: `1px solid ${colors.border}`,
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 1000,
            transition: 'all 0.3s ease',
          }}
          trigger={null}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
          />
        </Sider>

        <Layout style={{ marginLeft: sidebarCollapsed ? 80 : 280, transition: 'all 0.3s ease' }}>
          <Header
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />

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
                left: sidebarCollapsed ? 80 : 280,
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

            <Suspense fallback={<PageLoader />}>
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
                <Route path="/tutorials" element={<VideoTutorialPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Content>

          <Footer />
        </Layout>

        <HelpButton />
      </Layout>
    </ConfigProvider>
  );
}

export default App;

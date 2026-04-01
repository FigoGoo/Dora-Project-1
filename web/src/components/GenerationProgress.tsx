import React, { useEffect, useRef, useState } from 'react';
import { Progress, Card, Timeline, Typography, Space, Tag, Tooltip, Spin, Statistic, Row, Col } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
  ErrorOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

import { useAppStore } from '../store';
import { colors, shadowStyles, gradientStyles, animationStyles } from '../theme';
import { GenerationTask, TaskLog, SubTask } from '../types';

const { Title, Text } = Typography;

interface GenerationProgressProps {
  taskId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ taskId, onComplete, onError }) => {
  const { tasks, addTaskLog, updateSubTask, addSubTask, performanceMetrics } = useAppStore();
  const task = tasks.find(t => t.id === taskId) as GenerationTask | undefined;
  const [isPlaying, setIsPlaying] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到日志底部
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [task?.logs]);

  // 根据任务类型获取预计时间
  const getEstimatedTime = (type: string): number => {
    const modelType = task?.id.split(':')[1] || 'deepseek';
    const modelPerformance = performanceMetrics.modelPerformance[modelType] ||
      performanceMetrics.modelPerformance['deepseek'];
    const baseTimes: Record<string, number> = {
      script: 30,
      storyboard: 60,
      image: 45,
      video: 120,
    };
    return baseTimes[type] || 60;
  };

  // 计算任务进度百分比
  const calculateProgress = (task: GenerationTask): number => {
    if (task.subTasks && task.subTasks.length > 0) {
      const totalProgress = task.subTasks.reduce((sum, st) => sum + st.progress, 0);
      return Math.round(totalProgress / task.subTasks.length);
    }
    return task.progress;
  };

  // 获取任务状态颜色
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'processing': return colors.primary;
      case 'completed': return colors.success;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  // 获取日志级别图标
  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircleOutlined style={{ color: colors.success }} />;
      case 'info': return <InfoCircleOutlined style={{ color: colors.primary }} />;
      case 'warning': return <WarningOutlined style={{ color: colors.warning }} />;
      case 'error': return <ErrorOutlined style={{ color: colors.error }} />;
      default: return <InfoCircleOutlined style={{ color: colors.textSecondary }} />;
    }
  };

  // 获取日志级别颜色
  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'success': return colors.success;
      case 'info': return colors.primary;
      case 'warning': return colors.warning;
      case 'error': return colors.error;
      default: return colors.textSecondary;
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  // 计算剩余时间
  const calculateRemainingTime = (task: GenerationTask): string => {
    if (!task.estimatedTime || !task.progress) return '计算中...';

    const elapsed = task.elapsedTime || 0;
    const remainingSeconds = Math.max(0, task.estimatedTime - elapsed);
    return formatTime(remainingSeconds);
  };

  // 初始化子任务
  useEffect(() => {
    if (task && !task.subTasks) {
      const subTasks: SubTask[] = [];
      switch (task.type) {
        case 'script':
          subTasks.push(
            { id: 'analyze', name: '分析灵感', status: 'pending', progress: 0, estimatedTime: 5 },
            { id: 'generate', name: '生成剧情', status: 'pending', progress: 0, estimatedTime: 15 },
            { id: 'structure', name: '结构化剧本', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'finalize', name: '优化完善', status: 'pending', progress: 0, estimatedTime: 5 }
          );
          break;
        case 'storyboard':
          subTasks.push(
            { id: 'parse', name: '解析剧本', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'scene', name: '分场景设计', status: 'pending', progress: 0, estimatedTime: 30 },
            { id: 'layout', name: '画面构图', status: 'pending', progress: 0, estimatedTime: 15 },
            { id: 'render', name: '渲染分镜', status: 'pending', progress: 0, estimatedTime: 15 }
          );
          break;
        case 'image':
          subTasks.push(
            { id: 'prompt', name: '生成提示词', status: 'pending', progress: 0, estimatedTime: 5 },
            { id: 'generate', name: 'AI生成图像', status: 'pending', progress: 0, estimatedTime: 30 },
            { id: 'enhance', name: '图像优化', status: 'pending', progress: 0, estimatedTime: 8 },
            { id: 'verify', name: '质量验证', status: 'pending', progress: 0, estimatedTime: 5 }
          );
          break;
        case 'video':
          subTasks.push(
            { id: 'prepare', name: '准备素材', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'generate', name: '视频生成', status: 'pending', progress: 0, estimatedTime: 80 },
            { id: 'edit', name: '视频编辑', status: 'pending', progress: 0, estimatedTime: 20 },
            { id: 'render', name: '最终渲染', status: 'pending', progress: 0, estimatedTime: 30 }
          );
          break;
      }
      subTasks.forEach(st => addSubTask(taskId, st));
    }
  }, [task, addSubTask]);

  // 模拟任务进度
  useEffect(() => {
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return;
    }

    // 初始化任务时间
    if (!task.estimatedTime) {
      const estimatedTime = getEstimatedTime(task.type);
      // 这里应该是 updateTask，但是类型声明是 Partial<GenerationTask>，所以我们可以用这种方式
      // 注意：我需要检查 store 中的 updateTask 是否允许更新 estimatedTime
    }

    // 模拟子任务进度
    if (task.subTasks) {
      const activeSubTask = task.subTasks.find(st => st.status === 'processing');
      if (activeSubTask) {
        if (activeSubTask.progress < 100) {
          const newProgress = activeSubTask.progress + Math.random() * 10;
          updateSubTask(taskId, activeSubTask.id, {
            progress: Math.min(100, Math.floor(newProgress)),
          });
        } else {
          updateSubTask(taskId, activeSubTask.id, { status: 'completed' });
          const nextIndex = task.subTasks.findIndex(st => st.id === activeSubTask.id) + 1;
          if (nextIndex < task.subTasks.length) {
            updateSubTask(taskId, task.subTasks[nextIndex].id, { status: 'processing' });
            addTaskLog(taskId, {
              id: Date.now().toString(),
              message: `开始 ${task.subTasks[nextIndex].name}`,
              level: 'info',
              timestamp: Date.now(),
            });
          } else {
            // 所有子任务完成
            addTaskLog(taskId, {
              id: Date.now().toString(),
              message: '任务完成',
              level: 'success',
              timestamp: Date.now(),
            });
            if (onComplete) {
              setTimeout(onComplete, 500);
            }
          }
        }
      } else {
        // 开始第一个子任务
        if (task.subTasks.length > 0) {
          updateSubTask(taskId, task.subTasks[0].id, { status: 'processing' });
          addTaskLog(taskId, {
            id: Date.now().toString(),
            message: `开始 ${task.subTasks[0].name}`,
            level: 'info',
            timestamp: Date.now(),
          });
        }
      }
    }
  }, [task, task?.subTasks]);

  if (!task) {
    return (
      <Card style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        boxShadow: shadowStyles.card,
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <WarningOutlined style={{ fontSize: '48px', color: colors.warning, marginBottom: '16px' }} />
          <Text style={{ color: colors.textSecondary }}>任务未找到</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      boxShadow: shadowStyles.card,
      marginTop: '24px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{
          marginBottom: '16px',
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            fontSize: '24px',
            background: gradientStyles.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎬
          </div>
          {task.type === 'script' ? '剧本生成' :
           task.type === 'storyboard' ? '分镜设计' :
           task.type === 'image' ? '图像生成' : '视频合成'}
          <Tag color={task.status === 'completed' ? 'success' :
                     task.status === 'failed' ? 'error' :
                     task.status === 'pending' ? 'warning' : 'processing'}>
            {task.status === 'completed' ? '完成' :
             task.status === 'failed' ? '失败' :
             task.status === 'pending' ? '待处理' : '生成中'}
          </Tag>
        </Title>
      </div>

      {/* 整体进度 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Text style={{ color: colors.textSecondary }}>整体进度</Text>
          <Text style={{ color: colors.textPrimary, fontWeight: 500 }}>
            {calculateProgress(task)}%
          </Text>
        </div>
        <Progress
          percent={calculateProgress(task)}
          strokeColor={task.status === 'completed' ? colors.success : colors.primary}
          size="large"
          style={{ marginBottom: '16px' }}
        />
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>已用时</Text>}
            value={Math.floor((task.elapsedTime || 0))}
            suffix={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>秒</Text>}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>预计剩余</Text>}
            value={calculateRemainingTime(task)}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>预计总时间</Text>}
            value={formatTime(getEstimatedTime(task.type))}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
      </Row>

      {/* 子任务进度 */}
      {task.subTasks && task.subTasks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Title level={5} style={{
            marginBottom: '16px',
            color: colors.textPrimary,
            fontSize: '16px',
          }}>
            📋 生成步骤
          </Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {task.subTasks.map(subTask => (
              <div key={subTask.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: colors.bgTertiary,
                borderRadius: '12px',
                transition: `all ${animationStyles.fast}`,
                border: `1px solid ${subTask.status === 'processing' ? colors.primary : colors.border}`,
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: subTask.status === 'completed' ? colors.success :
                             subTask.status === 'failed' ? colors.error :
                             subTask.status === 'processing' ? colors.primary : colors.textSecondary,
                  animation: subTask.status === 'processing' ? 'pulse 1s infinite' : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text style={{ color: colors.textPrimary }}>{subTask.name}</Text>
                    <Text style={{ fontSize: '12px', color: colors.textSecondary }}>
                      {subTask.estimatedTime}秒
                    </Text>
                  </div>
                  <Progress
                    percent={subTask.progress}
                    strokeColor={subTask.status === 'processing' ? colors.primary :
                               subTask.status === 'completed' ? colors.success : colors.border}
                    size="small"
                  />
                </div>
                <div style={{
                  fontSize: '18px',
                  color: subTask.status === 'completed' ? colors.success :
                         subTask.status === 'failed' ? colors.error :
                         subTask.status === 'processing' ? colors.primary : colors.textSecondary,
                }}>
                  {subTask.status === 'completed' ? <CheckCircleOutlined /> :
                   subTask.status === 'failed' ? <ErrorOutlined /> :
                   subTask.status === 'processing' ? <LoadingOutlined spin /> : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实时日志 */}
      {task.logs && task.logs.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{
            marginBottom: '16px',
            color: colors.textPrimary,
            fontSize: '16px',
          }}>
            📝 生成日志
          </Title>
          <Card style={{
            background: colors.bgTertiary,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            height: '200px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
              }}
            >
              <Timeline
                mode="left"
                style={{ margin: 0 }}
                items={task.logs.map(log => ({
                  color: getLogLevelColor(log.level),
                  children: (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 0',
                    }}>
                      {getLogIcon(log.level)}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          color: colors.textPrimary,
                          marginBottom: '4px',
                        }}>
                          {log.message}
                        </div>
                        {log.details && (
                          <div style={{
                            fontSize: '12px',
                            color: colors.textSecondary,
                            background: colors.bgCard,
                            padding: '8px',
                            borderRadius: '8px',
                            marginTop: '8px',
                          }}>
                            {log.details}
                          </div>
                        )}
                        <div style={{
                          fontSize: '11px',
                          color: colors.textTertiary,
                          marginTop: '4px',
                        }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 动画反馈 */}
      {task.status === 'processing' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(107, 63, 160, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            animation: 'bounce 1s ease-in-out infinite',
            marginBottom: '16px',
          }}>
            ✨
          </div>
          <Text style={{ color: colors.primary }}>
            AI正在为您创作{task.type === 'script' ? '精彩剧本' :
                         task.type === 'storyboard' ? '精美分镜' :
                         task.type === 'image' ? '梦幻画面' : '震撼视频'}中...
          </Text>
        </div>
      )}

      {/* 任务完成 */}
      {task.status === 'completed' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(67, 160, 71, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            animation: 'successBounce 0.6s ease',
            marginBottom: '16px',
          }}>
            🎉
          </div>
          <Text style={{ color: colors.success, fontSize: '18px', fontWeight: 500 }}>
            {task.type === 'script' ? '剧本' :
             task.type === 'storyboard' ? '分镜' :
             task.type === 'image' ? '图像' : '视频'}生成完成！
          </Text>
        </div>
      )}

      {/* 任务失败 */}
      {task.status === 'failed' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(239, 83, 80, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ⚠️
          </div>
          <Text style={{ color: colors.error, fontSize: '18px', fontWeight: 500 }}>
            生成失败
          </Text>
          {task.error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: colors.bgTertiary,
              borderRadius: '8px',
              textAlign: 'left',
            }}>
              <Text style={{ fontSize: '14px', color: colors.textSecondary }}>
                错误信息：{task.error}
              </Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GenerationProgress;
  const calculateRemainingTime = (task: GenerationTask): string => {
    if (!task.estimatedTime || !task.progress) return '计算中...';

    const elapsed = task.elapsedTime || 0;
    const remainingSeconds = Math.max(0, task.estimatedTime - elapsed);
    return formatTime(remainingSeconds);
  };

  // 初始化子任务
  useEffect(() => {
    if (task && !task.subTasks) {
      const subTasks: SubTask[] = [];
      switch (task.type) {
        case 'script':
          subTasks.push(
            { id: 'analyze', name: '分析灵感', status: 'pending', progress: 0, estimatedTime: 5 },
            { id: 'generate', name: '生成剧情', status: 'pending', progress: 0, estimatedTime: 15 },
            { id: 'structure', name: '结构化剧本', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'finalize', name: '优化完善', status: 'pending', progress: 0, estimatedTime: 5 }
          );
          break;
        case 'storyboard':
          subTasks.push(
            { id: 'parse', name: '解析剧本', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'scene', name: '分场景设计', status: 'pending', progress: 0, estimatedTime: 30 },
            { id: 'layout', name: '画面构图', status: 'pending', progress: 0, estimatedTime: 15 },
            { id: 'render', name: '渲染分镜', status: 'pending', progress: 0, estimatedTime: 15 }
          );
          break;
        case 'image':
          subTasks.push(
            { id: 'prompt', name: '生成提示词', status: 'pending', progress: 0, estimatedTime: 5 },
            { id: 'generate', name: 'AI生成图像', status: 'pending', progress: 0, estimatedTime: 30 },
            { id: 'enhance', name: '图像优化', status: 'pending', progress: 0, estimatedTime: 8 },
            { id: 'verify', name: '质量验证', status: 'pending', progress: 0, estimatedTime: 5 }
          );
          break;
        case 'video':
          subTasks.push(
            { id: 'prepare', name: '准备素材', status: 'pending', progress: 0, estimatedTime: 10 },
            { id: 'generate', name: '视频生成', status: 'pending', progress: 0, estimatedTime: 80 },
            { id: 'edit', name: '视频编辑', status: 'pending', progress: 0, estimatedTime: 20 },
            { id: 'render', name: '最终渲染', status: 'pending', progress: 0, estimatedTime: 30 }
          );
          break;
      }
      subTasks.forEach(st => addSubTask(taskId, st));
    }
  }, [task, addSubTask]);

  // 模拟任务进度
  useEffect(() => {
    if (!task || task.status === 'completed' || task.status === 'failed') {
      return;
    }

    // 初始化任务时间
    if (!task.estimatedTime) {
      const estimatedTime = getEstimatedTime(task.type);
      addTaskLog(taskId, {
        id: Date.now().toString(),
        message: `开始任务，预计需要 ${formatTime(estimatedTime)}`,
        level: 'info',
        timestamp: Date.now(),
      });
      // 这里应该是 updateTask，但是类型声明是 Partial<GenerationTask>，所以我们可以用这种方式
      // 注意：我需要检查 store 中的 updateTask 是否允许更新 estimatedTime
    }

    // 模拟子任务进度
    if (task.subTasks) {
      const activeSubTask = task.subTasks.find(st => st.status === 'processing');
      if (activeSubTask) {
        if (activeSubTask.progress < 100) {
          const newProgress = activeSubTask.progress + Math.random() * 10;
          updateSubTask(taskId, activeSubTask.id, {
            progress: Math.min(100, Math.floor(newProgress)),
          });
        } else {
          updateSubTask(taskId, activeSubTask.id, { status: 'completed' });
          const nextIndex = task.subTasks.findIndex(st => st.id === activeSubTask.id) + 1;
          if (nextIndex < task.subTasks.length) {
            updateSubTask(taskId, task.subTasks[nextIndex].id, { status: 'processing' });
            addTaskLog(taskId, {
              id: Date.now().toString(),
              message: `开始 ${task.subTasks[nextIndex].name}`,
              level: 'info',
              timestamp: Date.now(),
            });
          } else {
            // 所有子任务完成
            addTaskLog(taskId, {
              id: Date.now().toString(),
              message: '任务完成',
              level: 'success',
              timestamp: Date.now(),
            });
            if (onComplete) {
              setTimeout(onComplete, 500);
            }
          }
        }
      } else {
        // 开始第一个子任务
        if (task.subTasks.length > 0) {
          updateSubTask(taskId, task.subTasks[0].id, { status: 'processing' });
          addTaskLog(taskId, {
            id: Date.now().toString(),
            message: `开始 ${task.subTasks[0].name}`,
            level: 'info',
            timestamp: Date.now(),
          });
        }
      }
    }
  }, [task, task?.subTasks]);

  if (!task) {
    return (
      <Card style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        boxShadow: shadowStyles.card,
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <WarningOutlined style={{ fontSize: '48px', color: colors.warning, marginBottom: '16px' }} />
          <Text style={{ color: colors.textSecondary }}>任务未找到</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{
      background: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '16px',
      boxShadow: shadowStyles.card,
      marginTop: '24px',
    }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={4} style={{
          marginBottom: '16px',
          color: colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            fontSize: '24px',
            background: gradientStyles.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            🎬
          </div>
          {task.type === 'script' ? '剧本生成' :
           task.type === 'storyboard' ? '分镜设计' :
           task.type === 'image' ? '图像生成' : '视频合成'}
          <Tag color={task.status === 'completed' ? 'success' :
                     task.status === 'failed' ? 'error' :
                     task.status === 'pending' ? 'warning' : 'processing'}>
            {task.status === 'completed' ? '完成' :
             task.status === 'failed' ? '失败' :
             task.status === 'pending' ? '待处理' : '生成中'}
          </Tag>
        </Title>
      </div>

      {/* 整体进度 */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <Text style={{ color: colors.textSecondary }}>整体进度</Text>
          <Text style={{ color: colors.textPrimary, fontWeight: 500 }}>
            {calculateProgress(task)}%
          </Text>
        </div>
        <Progress
          percent={calculateProgress(task)}
          strokeColor={task.status === 'completed' ? colors.success : colors.primary}
          size="large"
          style={{ marginBottom: '16px' }}
        />
      </div>

      {/* 统计信息 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>已用时</Text>}
            value={Math.floor((task.elapsedTime || 0))}
            suffix={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>秒</Text>}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>预计剩余</Text>}
            value={calculateRemainingTime(task)}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={<Text style={{ fontSize: '14px', color: colors.textSecondary }}>预计总时间</Text>}
            value={formatTime(getEstimatedTime(task.type))}
            valueStyle={{ color: colors.textPrimary }}
          />
        </Col>
      </Row>

      {/* 子任务进度 */}
      {task.subTasks && task.subTasks.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <Title level={5} style={{
            marginBottom: '16px',
            color: colors.textPrimary,
            fontSize: '16px',
          }}>
            📋 生成步骤
          </Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {task.subTasks.map(subTask => (
              <div key={subTask.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: colors.bgTertiary,
                borderRadius: '12px',
                transition: `all ${animationStyles.fast}`,
                border: `1px solid ${subTask.status === 'processing' ? colors.primary : colors.border}`,
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: subTask.status === 'completed' ? colors.success :
                             subTask.status === 'failed' ? colors.error :
                             subTask.status === 'processing' ? colors.primary : colors.textSecondary,
                  animation: subTask.status === 'processing' ? 'pulse 1s infinite' : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <Text style={{ color: colors.textPrimary }}>{subTask.name}</Text>
                    <Text style={{ fontSize: '12px', color: colors.textSecondary }}>
                      {subTask.estimatedTime}秒
                    </Text>
                  </div>
                  <Progress
                    percent={subTask.progress}
                    strokeColor={subTask.status === 'processing' ? colors.primary :
                               subTask.status === 'completed' ? colors.success : colors.border}
                    size="small"
                  />
                </div>
                <div style={{
                  fontSize: '18px',
                  color: subTask.status === 'completed' ? colors.success :
                         subTask.status === 'failed' ? colors.error :
                         subTask.status === 'processing' ? colors.primary : colors.textSecondary,
                }}>
                  {subTask.status === 'completed' ? <CheckCircleOutlined /> :
                   subTask.status === 'failed' ? <ErrorOutlined /> :
                   subTask.status === 'processing' ? <LoadingOutlined spin /> : '⏸'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 实时日志 */}
      {task.logs && task.logs.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <Title level={5} style={{
            marginBottom: '16px',
            color: colors.textPrimary,
            fontSize: '16px',
          }}>
            📝 生成日志
          </Title>
          <Card style={{
            background: colors.bgTertiary,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            height: '200px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div
              ref={logContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
              }}
            >
              <Timeline
                mode="left"
                style={{ margin: 0 }}
                items={task.logs.map(log => ({
                  color: getLogLevelColor(log.level),
                  children: (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '8px 0',
                    }}>
                      {getLogIcon(log.level)}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          color: colors.textPrimary,
                          marginBottom: '4px',
                        }}>
                          {log.message}
                        </div>
                        {log.details && (
                          <div style={{
                            fontSize: '12px',
                            color: colors.textSecondary,
                            background: colors.bgCard,
                            padding: '8px',
                            borderRadius: '8px',
                            marginTop: '8px',
                          }}>
                            {log.details}
                          </div>
                        )}
                        <div style={{
                          fontSize: '11px',
                          color: colors.textTertiary,
                          marginTop: '4px',
                        }}>
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ),
                }))}
              />
            </div>
          </Card>
        </div>
      )}

      {/* 动画反馈 */}
      {task.status === 'processing' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(107, 63, 160, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            animation: 'bounce 1s ease-in-out infinite',
            marginBottom: '16px',
          }}>
            ✨
          </div>
          <Text style={{ color: colors.primary }}>
            AI正在为您创作{task.type === 'script' ? '精彩剧本' :
                         task.type === 'storyboard' ? '精美分镜' :
                         task.type === 'image' ? '梦幻画面' : '震撼视频'}中...
          </Text>
        </div>
      )}

      {/* 任务完成 */}
      {task.status === 'completed' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(67, 160, 71, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            animation: 'successBounce 0.6s ease',
            marginBottom: '16px',
          }}>
            🎉
          </div>
          <Text style={{ color: colors.success, fontSize: '18px', fontWeight: 500 }}>
            {task.type === 'script' ? '剧本' :
             task.type === 'storyboard' ? '分镜' :
             task.type === 'image' ? '图像' : '视频'}生成完成！
          </Text>
        </div>
      )}

      {/* 任务失败 */}
      {task.status === 'failed' && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          background: `rgba(239, 83, 80, 0.05)`,
          borderRadius: '16px',
          marginBottom: '24px',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            ⚠️
          </div>
          <Text style={{ color: colors.error, fontSize: '18px', fontWeight: 500 }}>
            生成失败
          </Text>
          {task.error && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: colors.bgTertiary,
              borderRadius: '8px',
              textAlign: 'left',
            }}>
              <Text style={{ fontSize: '14px', color: colors.textSecondary }}>
                错误信息：{task.error}
              </Text>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default GenerationProgress;

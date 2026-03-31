import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Project,
  ModelConfig,
  InspirationSuggestion,
  GenerationTask,
  ModelType,
  VideoType,
  VideoDuration,
  VisualStyle,
  AspectRatio,
  ScriptVersion,
  Scene,
} from '../types';

// 草稿数据类型
export interface Draft {
  id: string;
  name: string;
  description: string;
  videoType: VideoType;
  duration: VideoDuration;
  style: VisualStyle;
  aspectRatio: AspectRatio;
  model: ModelType;
  savedAt: number;
}

// 默认 AI 模型配置
const DEFAULT_MODELS: ModelConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🧠',
    description: '文本生成模型',
    type: 'text',
    enabled: true,
  },
  {
    id: 'gemini',
    name: 'Gemini 3.1 Pro',
    icon: '💎',
    description: '多模态大模型',
    type: 'text',
    enabled: true,
  },
  {
    id: 'banana',
    name: 'Banana 2',
    icon: '🍌',
    description: '图像生成模型',
    type: 'image',
    enabled: true,
  },
  {
    id: 'seedance',
    name: 'Seedance',
    icon: '🎬',
    description: '视频生成模型',
    type: 'video',
    enabled: true,
  },
];

// 灵感推荐
const INSPIRATION_SUGGESTIONS: InspirationSuggestion[] = [
  {
    id: '1',
    emoji: '🚀',
    title: '星际探险',
    text: '在浩瀚宇宙中探索未知星球，遇见神秘的外星文明',
    inspiration: '一个关于时间旅行的科幻故事，主角发现了一扇能通往过去的门...',
  },
  {
    id: '2',
    emoji: '🐱',
    title: '萌宠冒险',
    text: '可爱的小动物们的奇幻冒险之旅',
    inspiration: '一只勇敢的小猫踏上了寻找失落宝藏的冒险旅程...',
  },
  {
    id: '3',
    emoji: '🤖',
    title: '赛博未来',
    text: '霓虹闪烁的未来世界，高科技与人性的碰撞',
    inspiration: '未来都市中，机器人与人类共存，一个关于爱与勇气的故事...',
  },
  {
    id: '4',
    emoji: '🐉',
    title: '东方神话',
    text: '神秘的东方古国，仙魔大战的史诗传说',
    inspiration: '古老的东方传说，龙族守护着人间的最后一片净土...',
  },
  {
    id: '5',
    emoji: '✨',
    title: '魔法世界',
    text: '充满魔力的奇幻世界，咒语与法杖的奇妙冒险',
    inspiration: '在魔法学院里，一群年轻的魔法师学习着各种神奇的魔法...',
  },
  {
    id: '6',
    emoji: '🌟',
    title: '温馨回忆',
    text: '治愈系的日常故事，温暖人心的美好时光',
    inspiration: '回到童年的夏日，在奶奶家的院子里数星星、捉萤火虫...',
  },
];

interface AppState {
  // 当前项目
  currentProject: Project | null;
  projects: Project[];
  models: ModelConfig[];
  suggestions: InspirationSuggestion[];
  tasks: GenerationTask[];
  drafts: Draft[];
  isLoading: boolean;
  error: string | null;

  // 操作方法
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // 项目操作
  createProject: () => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  saveProject: () => void;

  // 灵感输入
  updateInspiration: (data: {
    name?: string;
    description: string;
    videoType: VideoType;
    duration: VideoDuration;
    style: VisualStyle;
    aspectRatio: AspectRatio;
    model: ModelType;
  }) => void;

  // 草稿操作
  saveDraft: (data: Omit<Draft, 'id' | 'savedAt'>) => void;
  loadDraft: (draftId: string) => Draft | undefined;
  deleteDraft: (draftId: string) => void;
  getDrafts: () => Draft[];

  // 生成任务
  addTask: (task: GenerationTask) => void;
  updateTask: (id: string, updates: Partial<GenerationTask>) => void;
  removeTask: (id: string) => void;

  // 剧本版本管理
  saveScriptVersion: (changeDescription?: string) => void;
  restoreScriptVersion: (versionId: string) => void;
  deleteScriptVersion: (versionId: string) => void;
  getScriptVersions: () => ScriptVersion[];

  // 场景管理
  addScene: (scene: Omit<Scene, 'id' | 'number'>) => void;
  updateScene: (sceneId: string, updates: Partial<Scene>) => void;
  deleteScene: (sceneId: string) => void;
  reorderScenes: (fromIndex: number, toIndex: number) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      models: DEFAULT_MODELS,
      suggestions: INSPIRATION_SUGGESTIONS,
      tasks: [],
      drafts: [],
      isLoading: false,
      error: null,

      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      createProject: () => {
        const newProject: Project = {
          id: Date.now().toString(),
          status: 'inspiration',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          currentProject: newProject,
        }));

        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: Date.now() }
              : state.currentProject,
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      setCurrentProject: (project) => set({ currentProject: project }),

      saveProject: () => {
        // 保存当前项目到 projects 列表
        const { currentProject, projects } = get();
        if (!currentProject) return;

        const existingIndex = projects.findIndex((p) => p.id === currentProject.id);
        if (existingIndex >= 0) {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? currentProject : p
            ),
          }));
        }
      },

      updateInspiration: (data) => {
        const { currentProject } = get();
        if (!currentProject) return;

        set((state) => {
          const updatedProject: Project = {
            ...currentProject,
            name: data.name,
            status: 'inspiration',
            inspiration: {
              description: data.description,
              videoType: data.videoType,
              duration: data.duration,
              style: data.style,
              aspectRatio: data.aspectRatio,
              model: data.model,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      saveDraft: (data) => {
        const draft: Draft = {
          id: Date.now().toString(),
          ...data,
          savedAt: Date.now(),
        };

        set((state) => ({
          drafts: [draft, ...state.drafts.slice(0, 19)], // 最多保留 20 个草稿
        }));
      },

      loadDraft: (draftId) => {
        const { drafts } = get();
        return drafts.find((d) => d.id === draftId);
      },

      deleteDraft: (draftId) => {
        set((state) => ({
          drafts: state.drafts.filter((d) => d.id !== draftId),
        }));
      },

      getDrafts: () => {
        return get().drafts;
      },

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
          ),
        }));
      },

      removeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      },

      // 剧本版本管理
      saveScriptVersion: (changeDescription) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script) return;

        const currentVersions = currentProject.script.versions || [];
        const newVersionNumber = currentVersions.length + 1;

        const newVersion: ScriptVersion = {
          id: Date.now().toString(),
          versionNumber: newVersionNumber,
          title: currentProject.script.title,
          content: currentProject.script.content,
          scenes: [...(currentProject.script.scenes || [])],
          createdAt: Date.now(),
          changeDescription,
        };

        set((state) => {
          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              versions: [...currentVersions, newVersion],
              currentVersion: newVersionNumber,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      restoreScriptVersion: (versionId) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script?.versions) return;

        const version = currentProject.script.versions.find((v) => v.id === versionId);
        if (!version) return;

        set((state) => {
          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              title: version.title,
              content: version.content,
              scenes: [...version.scenes],
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      deleteScriptVersion: (versionId) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script?.versions) return;

        set((state) => {
          const updatedVersions = currentProject.script!.versions!.filter(
            (v) => v.id !== versionId
          );

          // 重新编号版本
          const renumberedVersions = updatedVersions
            .sort((a, b) => a.createdAt - b.createdAt)
            .map((v, index) => ({ ...v, versionNumber: index + 1 }));

          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              versions: renumberedVersions,
              currentVersion: renumberedVersions.length > 0 ? renumberedVersions.length : undefined,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      getScriptVersions: () => {
        const { currentProject } = get();
        return currentProject?.script?.versions || [];
      },

      // 场景管理
      addScene: (scene) => {
        const { currentProject } = get();
        if (!currentProject) return;

        const scenes = currentProject.script?.scenes || [];
        const newScene: Scene = {
          ...scene,
          id: Date.now().toString(),
          number: scenes.length + 1,
        };

        set((state) => {
          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              scenes: [...scenes, newScene],
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      updateScene: (sceneId, updates) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script?.scenes) return;

        set((state) => {
          const updatedScenes = currentProject.script!.scenes.map((s) =>
            s.id === sceneId ? { ...s, ...updates } : s
          );

          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              scenes: updatedScenes,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      deleteScene: (sceneId) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script?.scenes) return;

        set((state) => {
          const updatedScenes = currentProject.script!.scenes
            .filter((s) => s.id !== sceneId)
            .sort((a, b) => a.number - b.number)
            .map((s, index) => ({ ...s, number: index + 1 }));

          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              scenes: updatedScenes,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },

      reorderScenes: (fromIndex, toIndex) => {
        const { currentProject } = get();
        if (!currentProject || !currentProject.script?.scenes) return;

        set((state) => {
          const scenes = [...currentProject.script!.scenes];
          const [movedScene] = scenes.splice(fromIndex, 1);
          scenes.splice(toIndex, 0, movedScene);

          // 重新编号
          const reorderedScenes = scenes.map((s, index) => ({ ...s, number: index + 1 }));

          const updatedProject: Project = {
            ...currentProject,
            script: {
              ...currentProject.script!,
              scenes: reorderedScenes,
            },
            updatedAt: Date.now(),
          };

          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === currentProject.id ? updatedProject : p
            ),
          };
        });
      },
    }),
    {
      name: 'dora-magic-box-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

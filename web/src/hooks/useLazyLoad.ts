import { useState, useEffect, useRef, useCallback } from 'react';

// 数据缓存配置
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number; // 过期时间（毫秒）
}

interface CacheConfig {
  defaultExpiry?: number;
  maxSize?: number;
}

// 默认配置
const DEFAULT_CONFIG: CacheConfig = {
  defaultExpiry: 5 * 60 * 1000, // 默认5分钟过期
  maxSize: 100,
};

// 内存缓存
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private config: CacheConfig;

  constructor(config: CacheConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  set<T>(key: string, data: T, expiry?: number): void {
    // 如果超过最大容量，删除最早的条目
    if (this.cache.size >= (this.config.maxSize || 100)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.config.defaultExpiry || DEFAULT_CONFIG.defaultExpiry!,
    });

    console.log(`[Cache] Set: ${key}`);
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      console.log(`[Cache] Miss: ${key}`);
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.expiry) {
      this.cache.delete(key);
      console.log(`[Cache] Expired: ${key}`);
      return null;
    }

    console.log(`[Cache] Hit: ${key}`);
    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
    console.log(`[Cache] Delete: ${key}`);
  }

  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared');
  }

  // 获取缓存统计
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// 全局缓存实例
const globalCache = new MemoryCache();

export { globalCache, MemoryCache };

// 图片懒加载 Hook
export function useLazyLoadImage(options: IntersectionObserverInit = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, defaultOptions);

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [defaultOptions]);

  const handleLoad = useCallback(() => {
    setHasLoaded(true);
  }, []);

  return {
    ref,
    isVisible,
    hasLoaded,
    handleLoad,
  };
}

// 数据缓存 Hook
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { enabled?: boolean; expiry?: number } = {}
) {
  const { enabled = true, expiry } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // 先尝试从缓存获取
    if (!force) {
      const cached = globalCache.get<T>(key);
      if (cached) {
        setData(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      setData(result);
      globalCache.set(key, result, expiry);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, enabled, expiry]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    clearCache: () => globalCache.delete(key),
  };
}

// 防抖 Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 节流 Hook
export function useThrottle<T>(callback: (...args: T[]) => void, delay: number) {
  const lastCall = useRef(0);

  return useCallback(
    (...args: T[]) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

// 组件懒加载包装器
export function withLazyLoad<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(() =>
    Promise.resolve({ default: Component })
  );

  return (props: P) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

import React from 'react';
import { Skeleton } from 'antd';
import { useLazyLoadImage } from '../hooks/useLazyLoad';
import { colors } from '../theme';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: React.ReactNode;
  aspectRatio?: string;
  width?: number | string;
  height?: number | string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  style,
  placeholder,
  aspectRatio,
  width,
  height,
  onLoad,
  onError,
}) => {
  const { ref, isVisible, hasLoaded, handleLoad } = useLazyLoadImage({
    rootMargin: '100px', // 提前100px开始加载
  });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleLoad();
    onLoad?.();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.(e);
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: width || '100%',
    height: height || 'auto',
    overflow: 'hidden',
    ...(aspectRatio && { aspectRatio }),
    ...style,
  };

  const skeletonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgTertiary,
    borderRadius: '8px',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: hasLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <div className={className} style={containerStyle}>
      {!hasLoaded && (
        <div style={skeletonStyle}>
          {placeholder || (
            <Skeleton.Image
              style={{
                width: '100%',
                height: '100%',
                background: colors.bgTertiary,
              }}
            />
          )}
        </div>
      )}

      {isVisible && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          style={imageStyle}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default LazyImage;

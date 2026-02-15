import { useState, useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';
import { SplineErrorBoundary } from './SplineErrorBoundary';
import { isValidSplineUrl, shouldLoadSpline, getSplineLoadDelay, handleSplineError } from '@/lib/spline-utils';

interface LazySplineProps {
  scene?: string;
  url?: string; // Support both 'scene' and 'url' props for backwards compatibility
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

/**
 * LazySpline - загружает Spline только когда компонент виден
 * Оптимизация: не грузим тяжелую 3D сцену до скролла
 * + requestIdleCallback для предотвращения Long Tasks
 * + Error Boundary для обработки ошибок загрузки
 */
export function LazySpline({ scene, url, className, style, onLoad }: LazySplineProps) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadTimeoutRef = useRef<number | null>(null);
  
  // Support both 'scene' and 'url' props
  const splineUrl = scene || url;
  
  // Validate URL before loading
  if (!isValidSplineUrl(splineUrl)) {
    console.warn('LazySpline: Invalid or missing scene/url prop');
    return (
      <div ref={containerRef} className={className} style={style}>
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
      </div>
    );
  }

  useEffect(() => {
    // Проверяем размер экрана - на mobile не грузим Spline вообще
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad && !hasError) {
            // 🚀 OPTIMIZATION: Используем requestIdleCallback для загрузки в idle time
            // Это предотвращает блокировку main thread и Long Tasks
            if ('requestIdleCallback' in window) {
              requestIdleCallback(
                () => {
                  // Дополнительная задержка для избежания конкуренции с другими компонентами
                  loadTimeoutRef.current = window.setTimeout(() => {
                    setShouldLoad(true);
                  }, getSplineLoadDelay()); // 800ms базовая задержка для стабильности
                },
                { timeout: 5000 } // Увеличено с 3s до 5s - максимум ждем idle
              );
            } else {
              // Fallback для браузеров без requestIdleCallback
              loadTimeoutRef.current = window.setTimeout(() => {
                setShouldLoad(true);
              }, 1000); // Увеличено с 500ms до 1000ms
            }
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '400px', // Увеличено с 300px до 400px для более ранней загрузки
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [shouldLoad, hasError]);

  // Handle Spline load errors
  const handleError = (error?: Error) => {
    setHasError(true);
    if (error && splineUrl) {
      handleSplineError(error, splineUrl);
    } else {
      console.warn('LazySpline: Failed to load scene:', splineUrl);
    }
  };

  // Fallback UI для ошибок
  if (hasError) {
    return (
      <div ref={containerRef} className={className} style={style}>
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
          <div className="text-center px-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                />
              </svg>
            </div>
            <p className="text-xs text-gray-400 font-['Inter']">
              3D preview unavailable
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      {shouldLoad ? (
        <SplineErrorBoundary>
          <Spline 
            scene={splineUrl} 
            onLoad={onLoad}
            onError={handleError}
          />
        </SplineErrorBoundary>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white" />
      )}
    </div>
  );
}
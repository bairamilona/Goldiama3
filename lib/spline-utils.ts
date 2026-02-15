/**
 * Spline Utilities
 * Helpers для работы с Spline 3D сценами
 */

/**
 * Проверяет, является ли URL валидным Spline URL
 */
export function isValidSplineUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Проверяем формат URL
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname.includes('spline.design') &&
      (url.endsWith('.splinecode') || url.endsWith('.spline'))
    );
  } catch {
    return false;
  }
}

/**
 * Проверяет, поддерживает ли браузер WebGL (необходимо для Spline)
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Проверяет, достаточно ли производительности для Spline
 */
export function shouldLoadSpline(): boolean {
  // Не загружаем на мобильных устройствах
  if (window.innerWidth < 1024) {
    return false;
  }
  
  // Не загружаем если нет WebGL
  if (!isWebGLSupported()) {
    return false;
  }
  
  // Проверяем доступную память (если поддерживается)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMemoryRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
    
    // Если используется больше 80% памяти - не загружаем Spline
    if (usedMemoryRatio > 0.8) {
      console.warn('[Spline] Insufficient memory, skipping 3D scene load');
      return false;
    }
  }
  
  return true;
}

/**
 * Задержка загрузки Spline для оптимизации производительности
 */
export function getSplineLoadDelay(): number {
  // На медленных устройствах увеличиваем задержку
  const connection = (navigator as any).connection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    
    // Slow 2G / 3G - большая задержка
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      return 3000; // Увеличено с 2000ms
    }
    
    // 3G - средняя задержка
    if (effectiveType === '3g') {
      return 1500; // Увеличено с 1000ms
    }
  }
  
  // 4G / WiFi - увеличена базовая задержка для уменьшения Long Tasks
  // Это позволяет React, Motion и другим библиотекам загрузиться первыми
  return 800; // Увеличено с 300ms до 800ms
}

/**
 * Обрабатывает ошибки загрузки Spline
 */
export function handleSplineError(error: Error, sceneUrl: string): void {
  // Известные некритичные ошибки - не логируем
  if (
    error.message?.includes('Data read, but end of buffer not reached') ||
    error.message?.includes('Failed to fetch')
  ) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '%c[Spline] Known loading issue (non-critical):',
        'color: #F59E0B;',
        sceneUrl,
        error.message
      );
    }
    return;
  }
  
  // Остальные ошибки логируем
  console.error('[Spline] Error loading scene:', sceneUrl, error);
}
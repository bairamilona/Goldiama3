/**
 * Vite Plugin для обработки figma:asset импортов
 * Заменяет figma:asset/... на placeholder изображения
 */

import type { Plugin } from 'vite';

export function figmaAssetsPlugin(): Plugin {
  return {
    name: 'vite-plugin-figma-assets',
    enforce: 'pre',
    
    resolveId(id: string) {
      // Перехватываем все импорты с схемой figma:asset
      if (id.startsWith('figma:asset/')) {
        // Возвращаем виртуальный модуль
        return '\0figma-asset:' + id;
      }
      return null;
    },
    
    load(id: string) {
      // Обрабатываем виртуальные модули
      if (id.startsWith('\0figma-asset:')) {
        // Извлекаем хеш из ID
        const hash = id.replace('\0figma-asset:figma:asset/', '').replace('.png', '');
        
        // Возвращаем placeholder изображение (1x1 прозрачный PNG в base64)
        // Это минимальное валидное изображение, которое не сломает приложение
        const placeholderImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        
        // Для production можно использовать Unsplash placeholder
        // const placeholderImage = `https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&h=400&fit=crop&q=80`;
        
        return `export default "${placeholderImage}";`;
      }
      return null;
    }
  };
}

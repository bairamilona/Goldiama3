/**
 * GOLDIAMA Landing - Minimal App для тестирования инфраструктуры
 * Этот файл проверяет работоспособность базовой структуры
 */

import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#D4AF37' }}>
          GOLDIAMA
        </h1>
        <p className="text-xl text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
          Premium Gold, Silver & Platinum Store
        </p>
        <div className="mt-8 text-sm text-gray-400">
          ✅ Фаза 1: Инфраструктура готова
        </div>
      </div>
    </div>
  );
}

#!/usr/bin/env node

/**
 * Скрипт для проверки, что все импорты в проекте корректны
 * Запуск: node check-imports.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, 'src');
const errors = [];
const warnings = [];

console.log('🔍 Проверка импортов в проекте Goldiama...\n');

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const fileName = filePath.replace(__dirname + '/', '');
  
  // Проверка 1: Импорты без расширения .tsx/.ts (кроме пакетов)
  const importRegex = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Пропускаем npm пакеты
    if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
      continue;
    }
    
    // Проверяем наличие расширения для относительных путей
    if (importPath.startsWith('../') || importPath.startsWith('./')) {
      if (!importPath.includes('.')) {
        warnings.push(`${fileName}: Относительный импорт без расширения: "${importPath}"`);
      }
    }
  }
  
  // Проверка 2: Динамические импорты
  if (content.includes('import(')) {
    warnings.push(`${fileName}: Найден динамический import() - может вызвать проблемы в Figma Make`);
  }
  
  // Проверка 3: React.lazy
  if (content.includes('React.lazy')) {
    warnings.push(`${fileName}: Найден React.lazy() - может вызвать проблемы в Figma Make`);
  }
  
  // Проверка 4: Циклические импорты App.tsx
  if (content.includes('@/app/App') && !fileName.includes('main.tsx')) {
    errors.push(`${fileName}: Возможный циклический импорт App.tsx!`);
  }
}

function walkDir(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        walkDir(filePath);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      checkFile(filePath);
    }
  }
}

// Запуск проверки
walkDir(srcDir);

// Вывод результатов
console.log('📊 Результаты проверки:\n');

if (errors.length > 0) {
  console.log('❌ ОШИБКИ:');
  errors.forEach(err => console.log('  - ' + err));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  ПРЕДУПРЕЖДЕНИЯ:');
  warnings.forEach(warn => console.log('  - ' + warn));
  console.log('');
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ Все импорты корректны!\n');
} else {
  console.log(`\nИтого: ${errors.length} ошибок, ${warnings.length} предупреждений\n`);
}

// Выход с кодом ошибки если есть критичные проблемы
process.exit(errors.length > 0 ? 1 : 0);

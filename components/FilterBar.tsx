'use client';

import React from 'react';
import { Search, LayoutGrid, Layers } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'flashcard';
  onViewModeChange: (mode: 'grid' | 'flashcard') => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
      {/* Search input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm theo tên quán, món ăn, địa chỉ, ghi chú..."
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)] transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 bg-stone-100 dark:bg-stone-800 rounded-full w-6 h-6 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* View Mode Segmented Switcher */}
      <div className="inline-flex items-center p-1 rounded-2xl bg-[var(--color-surface-subtle)] border-2 border-[var(--color-border)] shadow-xs shrink-0">
        <button
          onClick={() => {
            soundManager.playClick();
            onViewModeChange('grid');
          }}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            viewMode === 'grid'
              ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Xem toàn bộ quán theo dạng lưới"
        >
          <LayoutGrid className="w-4 h-4 text-[var(--color-primary)]" />
          <span>Dạng Lưới</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClick();
            onViewModeChange('flashcard');
          }}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            viewMode === 'flashcard'
              ? 'bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/25'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
          title="Lướt xem từng quán dạng Flashcard Quizlet, chạm đúp để thả tim"
        >
          <Layers className="w-4 h-4" />
          <span>Thẻ Quizlet</span>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse ml-0.5" />
        </button>
      </div>
    </div>
  );
}





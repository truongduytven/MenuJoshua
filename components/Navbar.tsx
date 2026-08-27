'use client';

import React from 'react';
import { Plus, Volume2, VolumeX, Palette, UtensilsCrossed, Flame, Database } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface NavbarProps {
  totalCount: number;
  eatenCount: number;
  uneatenCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAddModal: () => void;
  onOpenThemeModal: () => void;
  onOpenDataManagerModal: () => void;
}

export function Navbar({
  totalCount,
  eatenCount,
  uneatenCount,
  soundEnabled,
  onToggleSound,
  onOpenAddModal,
  onOpenThemeModal,
  onOpenDataManagerModal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--color-background)]/90 backdrop-blur-md transition-colors border-b border-[var(--color-border)]/50">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="relative group cursor-pointer shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center shadow-md shadow-[var(--color-primary)]/25 transform group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-base sm:text-xl tracking-tight text-[var(--color-text-primary)] whitespace-nowrap">
                Ăn Gì Hôm Nay?
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                <Flame className="w-3 h-3 fill-current" />
                <span>v1.0</span>
              </span>
            </div>
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] hidden md:block">
              Bộ chọn quán ăn ngẫu nhiên vui vẻ & nhanh chóng
            </p>
          </div>
        </div>

        {/* Quick Stats Pill (Desktop/Tablet) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs text-xs font-bold shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)]">
            <span className="text-[var(--color-text-muted)]">Tổng</span>
            <span className="text-[var(--color-primary)] font-extrabold">{totalCount}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[var(--color-surface-subtle)] text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Đã ăn:</span>
            <strong className="font-extrabold">{eatenCount}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-primary)]">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>Chưa ăn:</span>
            <strong className="font-extrabold">{uneatenCount}</strong>
          </div>
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Data Manager / JSON Modal Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenDataManagerModal();
            }}
            title="Quản lý dữ liệu & Nhập/Xuất JSON"
            className="w-9 h-9 sm:w-auto sm:px-3 sm:h-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all flex items-center justify-center gap-1.5 shadow-xs text-xs font-bold active:scale-95"
          >
            <Database className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
            <span className="hidden md:inline">Quản lý JSON</span>
          </button>

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all flex items-center justify-center shadow-xs active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--color-primary)]" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenThemeModal();
            }}
            title="Đổi giao diện & Cài đặt"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary-light)] transition-all flex items-center justify-center shadow-xs active:scale-95"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Add Restaurant CTA Button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAddModal();
            }}
            className="btn-primary px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-white font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden sm:inline">Thêm quán</span>
          </button>
        </div>
      </div>
    </header>
  );
}

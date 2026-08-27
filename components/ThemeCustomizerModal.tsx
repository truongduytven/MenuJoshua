'use client';

import React, { useState } from 'react';
import { ThemePreset } from '@/types/restaurant';
import {
  X,
  Palette,
  Check,
  RotateCcw,
  Download,
  Upload,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { exportData, importData, resetAllDataToSample } from '@/lib/storage';
import { soundManager } from '@/lib/audio';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  currentTheme: ThemePreset;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectTheme: (theme: ThemePreset) => void;
  onClose: () => void;
  onDataReset: () => void;
}

const PRESETS: {
  id: ThemePreset;
  name: string;
  desc: string;
  primary: string;
  secondary: string;
  bg: string;
}[] = [
  {
    id: 'orange-food',
    name: 'Cam Giòn (Mặc định)',
    desc: 'Cam ấm & vàng tươi kích thích vị giác',
    primary: '#FF6B35',
    secondary: '#FFC857',
    bg: '#FFF9F2',
  },
  {
    id: 'strawberry',
    name: 'Dâu Tây Ngọt Ngào',
    desc: 'Hồng berry & đỏ dâu rực rỡ',
    primary: '#FF4F6D',
    secondary: '#FFB3C1',
    bg: '#FFF5F6',
  },
  {
    id: 'fresh-lime',
    name: 'Chanh Xanh Tươi Mát',
    desc: 'Xanh lá tươi & vàng nắng energetic',
    primary: '#52B72A',
    secondary: '#EAB308',
    bg: '#F7FCF4',
  },
  {
    id: 'ocean-food',
    name: 'Đại Dương & Hải Sản',
    desc: 'Xanh biển sâu & cam hải sản',
    primary: '#FF6B35',
    secondary: '#0284C7',
    bg: '#F4F9FD',
  },
  {
    id: 'grape-dessert',
    name: 'Nho Tím Tráng Miệng',
    desc: 'Tím mộng mơ & hồng phấn ngọt ngào',
    primary: '#9333EA',
    secondary: '#EC4899',
    bg: '#FAF5FF',
  },
  {
    id: 'dark-warm',
    name: 'Đêm Ấm Cúng (Dark Mode)',
    desc: 'Tông tối ấm áp không mỏi mắt ban đêm',
    primary: '#FF7A45',
    secondary: '#FBBF24',
    bg: '#181513',
  },
];

export function ThemeCustomizerModal({
  isOpen,
  currentTheme,
  soundEnabled,
  onToggleSound,
  onSelectTheme,
  onClose,
  onDataReset,
}: ThemeCustomizerModalProps) {
  const [importError, setImportError] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    soundManager.playClick();
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `an-gi-hom-nay-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importData(content);
        if (success) {
          soundManager.playSuccessChime();
          onDataReset();
          onClose();
        } else {
          setImportError(true);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục lại dữ liệu mẫu 10 quán ăn mặc định ban đầu không?')) {
      soundManager.playSuccessChime();
      resetAllDataToSample();
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-[var(--color-text-primary)]">
              Giao diện & Cài đặt ứng dụng
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-stone-400 hover:text-stone-700 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Section 1: Themes */}
          <div>
            <label className="font-extrabold text-xs text-[var(--color-text-primary)] block mb-3">
              🎨 Chọn bảng màu yêu thích (5 Theme Presets)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESETS.map((preset) => {
                const isSelected = currentTheme === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      soundManager.playSuccessChime();
                      onSelectTheme(preset.id);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary-light)] bg-[var(--color-surface-subtle)] shadow-xs'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-3.5 h-3.5 rounded-full border border-black/10"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <span className="font-bold text-xs text-[var(--color-text-primary)]">
                          {preset.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">
                        {preset.desc}
                      </p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Sound Settings */}
          <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-xs text-[var(--color-text-primary)]">
                  Âm thanh ăn mừng & vòng quay
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Phát tiếng quay thẻ và nhạc chiến thắng khi chọn được quán
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleSound();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                soundEnabled
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-transparent'
              }`}
            >
              {soundEnabled ? 'BẬT' : 'TẮT'}
            </button>
          </div>

          {/* Section 3: Data Management (Backup, Restore, Reset) */}
          <div className="space-y-2.5">
            <label className="font-extrabold text-xs text-[var(--color-text-primary)] block">
              💾 Quản lý dữ liệu quán ăn
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExport}
                className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Sao lưu JSON</span>
              </button>

              <label className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-bold text-[var(--color-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-stone-500" />
                <span>Nhập JSON</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFile}
                />
              </label>
            </div>

            {importError && (
              <p className="text-[11px] text-rose-500 font-bold">
                File JSON không hợp lệ. Vui lòng kiểm tra lại.
              </p>
            )}

            <button
              onClick={handleResetData}
              className="w-full mt-1 p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Khôi phục lại dữ liệu mẫu 10 quán ban đầu</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="btn-primary px-5 py-2 text-xs font-bold"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

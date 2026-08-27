'use client';

import React from 'react';
import { Sparkles, Dices } from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface HeroBannerProps {
  onOpenPicker: () => void;
  onOpenAddModal: () => void;
  restaurantCount: number;
}

export function HeroBanner({ onOpenPicker, onOpenAddModal, restaurantCount }: HeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-xl shadow-[var(--color-primary)]/20 p-6 sm:p-10 mb-8 border border-white/20">
      {/* Decorative background food elements & glowing blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/15 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

      {/* Floating appetizing stickers */}
      <div className="absolute top-4 right-8 text-3xl sm:text-4xl select-none animate-float-food hidden sm:block">
        🍜
      </div>
      <div className="absolute bottom-4 right-24 text-3xl sm:text-4xl select-none animate-float-food [animation-delay:1.5s] hidden sm:block">
        🍕
      </div>
      <div className="absolute top-12 right-40 text-2xl select-none animate-float-food [animation-delay:0.8s] hidden md:block">
        🍣
      </div>

      <div className="relative z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider mb-3 text-white border border-white/20">
          <Sparkles className="w-3.5 h-3.5" />
          Quyết định trong 3 giây
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white mb-3">
          Hôm nay ăn gì?
        </h2>

        <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed mb-6">
          Không còn đau đầu nghĩ món hay tranh luận với hội bạn. Bấm nút để ứng dụng chọn ngay cho bạn quán ăn hoàn hảo hôm nay!
        </p>

        {/* Primary Single CTA Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenPicker();
            }}
            disabled={restaurantCount === 0}
            className="group relative px-7 sm:px-9 py-3.5 sm:py-4 rounded-2xl bg-white text-[var(--color-primary)] hover:bg-white/90 font-black text-base sm:text-lg shadow-lg hover:shadow-2xl hover:shadow-white/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Dices className="w-6 h-6 text-[var(--color-primary)] group-hover:rotate-180 transition-transform duration-500" />
            <span>Quay ngẫu nhiên chọn quán!</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] animate-ping" />
          </button>
        </div>

        {restaurantCount === 0 && (
          <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-white/90 bg-black/20 px-3 py-1.5 rounded-xl border border-white/10">
            <span>Danh sách chưa có quán nào. Hãy thêm quán trước nhé!</span>
            <button
              onClick={onOpenAddModal}
              className="underline font-bold text-white hover:text-white/80"
            >
              Thêm quán ngay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}




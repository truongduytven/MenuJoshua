'use client';

import React, { useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  Sparkles,
  MapPin,
  Navigation,
  RotateCcw,
  CheckCircle2,
  UtensilsCrossed,
} from 'lucide-react';
import { triggerCelebration } from '@/lib/confetti';
import { soundManager } from '@/lib/audio';

interface WinnerScreenProps {
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  onToggleEaten: (id: string) => void;
}

export function WinnerScreen({
  restaurant,
  isOpen,
  onClose,
  onSpinAgain,
  onToggleEaten,
}: WinnerScreenProps) {
  useEffect(() => {
    if (isOpen && restaurant) {
      // Trigger celebration fireworks & fanfare audio!
      triggerCelebration();
      soundManager.playCelebrationFanfare();
    }
  }, [isOpen, restaurant]);

  if (!isOpen || !restaurant) return null;

  const getDirectionsUrl = () => {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-pop-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border-2 border-orange-400/50 rounded-[32px] shadow-2xl overflow-hidden my-4 text-center animate-winner-pulse flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top glowing celebration banner */}
        <div className="relative pt-6 pb-4 px-6 bg-gradient-to-b from-orange-500 to-amber-500 text-white overflow-hidden">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-white/20 blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-2 text-white border border-white/30 animate-bounce-gentle">
            <Sparkles className="w-4 h-4 text-yellow-200" />
            <span>Đã tìm thấy quán chân ái hôm nay!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
            🎉 HÔM NAY ĂN Ở ĐÂY!
          </h2>
        </div>

        {/* Big Food Photo Section */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-lg border border-[var(--color-border)] group">
            {restaurant.imageUrl ? (
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-stone-400">
                <UtensilsCrossed className="w-12 h-12 text-orange-400 mb-2" />
                <span className="font-bold text-stone-500">Món ăn hấp dẫn</span>
              </div>
            )}
          </div>

          {/* Restaurant Title */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] leading-tight">
              {restaurant.name}
            </h3>

            {/* Address */}
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium flex items-center justify-center gap-1.5 mt-2 max-w-md mx-auto">
              <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <span>{restaurant.address || 'Địa chỉ đang cập nhật'}</span>
            </p>
          </div>

          {/* Note if available */}
          {restaurant.note && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-200 font-medium italic max-w-md mx-auto">
              &ldquo;{restaurant.note}&rdquo;
            </div>
          )}
        </div>

        {/* Grand Action Buttons */}
        <div className="p-5 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] space-y-2.5">
          {/* Main Action: Go Eat! */}
          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => soundManager.playSuccessChime()}
            className="w-full btn-primary py-3.5 px-6 flex items-center justify-center gap-2 text-base sm:text-lg font-black shadow-lg shadow-orange-500/30"
          >
            <Navigation className="w-5 h-5 animate-bounce-gentle" />
            <span>🛵 Đi thôi! (Mở chỉ đường Maps)</span>
          </a>

          {/* Secondary helper actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onSpinAgain();
              }}
              className="py-2.5 px-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-border-subtle)] text-xs font-bold text-[var(--color-text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-orange-500" />
              <span>Quay chọn lại</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onToggleEaten(restaurant.id);
              }}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                restaurant.eaten
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:border-emerald-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{restaurant.eaten ? '✓ Đã đánh dấu ăn' : 'Đánh dấu đã ăn'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


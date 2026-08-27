'use client';

import React from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
  CircleDot,
  Dices,
  Edit2,
  Trash2,
  Utensils,
  Navigation,
  Heart,
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface RestaurantDetailModalProps {
  restaurant: Restaurant | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleEaten: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onSelectDirectly: (restaurant: Restaurant) => void;
}

export function RestaurantDetailModal({
  restaurant,
  isOpen,
  onClose,
  onToggleEaten,
  onToggleFavorite,
  onEdit,
  onDelete,
  onSelectDirectly,
}: RestaurantDetailModalProps) {
  if (!isOpen || !restaurant) return null;

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return '';
    }
  };

  const getGoogleMapsDirectionsUrl = () => {
    const query = encodeURIComponent(`${restaurant.name} ${restaurant.address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div className="relative w-full h-64 bg-stone-900 overflow-hidden">
          {restaurant.imageUrl ? (
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-stone-400">
              <Utensils className="w-12 h-12 text-orange-400 mb-2" />
              <span className="font-bold text-stone-500">Chưa có ảnh</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Top action buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {onToggleFavorite && (
              <button
                onClick={() => {
                  soundManager.playHeartPop();
                  onToggleFavorite(restaurant.id);
                }}
                className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
                  restaurant.isFavorite
                    ? 'bg-rose-500 text-white ring-2 ring-rose-300/60 scale-105'
                    : 'bg-black/50 hover:bg-black/70 text-white'
                }`}
                title="Thả tim quán yêu thích"
              >
                <Heart className={`w-4 h-4 ${restaurant.isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Eaten badge floating on image */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
                restaurant.eaten
                  ? 'bg-emerald-500 text-white'
                  : 'bg-orange-500 text-white'
              }`}
            >
              {restaurant.eaten ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã ăn
                </>
              ) : (
                <>
                  <CircleDot className="w-3.5 h-3.5" />
                  Chưa ăn
                </>
              )}
            </span>
          </div>

          {/* Bottom title info over image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-black tracking-tight leading-snug drop-shadow-md">
              {restaurant.name}
            </h2>
          </div>
        </div>


        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Address info card */}
          <div className="p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <div className="flex-1 text-xs sm:text-sm">
              <p className="font-bold text-[var(--color-text-primary)]">Địa chỉ quán</p>
              <p className="text-[var(--color-text-secondary)] mt-0.5">
                {restaurant.address || 'Chưa cập nhật địa chỉ'}
              </p>
              <a
                href={getGoogleMapsDirectionsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Mở chỉ đường Google Maps</span>
              </a>
            </div>
          </div>

          {/* Note / Review */}
          {restaurant.note && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm">
              <p className="font-bold text-amber-800 dark:text-amber-300">Ghi chú / Món gợi ý</p>
              <p className="text-stone-700 dark:text-stone-300 mt-1 leading-relaxed italic">
                &ldquo;{restaurant.note}&rdquo;
              </p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3 text-xs text-[var(--color-text-secondary)]">
            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)] mb-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Ngày thêm</span>
              </div>
              <p>{formatDateTime(restaurant.createdAt) || 'Không xác định'}</p>
            </div>

            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
              <div className="flex items-center gap-1.5 font-bold text-[var(--color-text-primary)] mb-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ăn gần nhất</span>
              </div>
              <p>
                {restaurant.eaten && restaurant.eatenAt
                  ? formatDateTime(restaurant.eatenAt)
                  : 'Chưa từng ăn'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-subtle)] flex flex-col gap-2.5">
          {/* Main Decision CTA */}
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
              onSelectDirectly(restaurant);
            }}
            className="w-full btn-primary py-3 px-4 flex items-center justify-center gap-2 text-base font-black shadow-lg"
          >
            <Dices className="w-5 h-5" />
            <span>🎉 Chọn quán này hôm nay!</span>
          </button>

          {/* Secondary helper buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onToggleEaten(restaurant.id);
              }}
              className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-primary)] hover:border-emerald-500 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{restaurant.eaten ? 'Bỏ đã ăn' : 'Đánh dấu đã ăn'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onEdit(restaurant);
              }}
              className="px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors flex items-center justify-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              <span>Sửa</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onClose();
                onDelete(restaurant.id);
              }}
              className="px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/40 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


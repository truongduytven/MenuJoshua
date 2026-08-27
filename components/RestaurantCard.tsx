'use client';

import React, { useState, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  MapPin,
  Check,
  Clock,
  ExternalLink,
  MoreVertical,
  Edit2,
  Trash2,
  Dices,
  Utensils,
  Heart,
  Sparkles,
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onToggleEaten: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (restaurant: Restaurant) => void;
  onDelete: (id: string) => void;
  onClick: (restaurant: Restaurant) => void;
  onSelectDirectly: (restaurant: Restaurant) => void;
}

export function RestaurantCard({
  restaurant,
  onToggleEaten,
  onToggleFavorite,
  onEdit,
  onDelete,
  onClick,
  onSelectDirectly,
}: RestaurantCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHeartPop, setShowHeartPop] = useState(false);

  const lastTapRef = useRef<number>(0);

  // Format eaten date
  const formatEatenDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return '';
    }
  };

  const triggerHeartPop = () => {
    soundManager.playHeartPop();
    onToggleFavorite(restaurant.id);
    setShowHeartPop(true);
    setTimeout(() => {
      setShowHeartPop(false);
    }, 800);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      e.stopPropagation();
      triggerHeartPop();
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div
      onClick={() => onClick(restaurant)}
      className={`group relative flex flex-col bg-[var(--color-surface)] border rounded-[22px] overflow-hidden transition-all duration-300 cursor-pointer ${
        restaurant.eaten
          ? 'border-[var(--color-border)] hover:border-emerald-300 shadow-xs hover:shadow-md'
          : 'border-[var(--color-border)] hover:border-orange-300 shadow-sm hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      {/* Food Image (4/3 aspect ratio) */}
      <div
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => {
          e.stopPropagation();
          triggerHeartPop();
        }}
        className="relative w-full aspect-[4/3] bg-[var(--color-surface-subtle)] overflow-hidden"
      >
        {/* Pop Heart Overlay on Double Tap */}
        {showHeartPop && (
          <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-black/20 backdrop-blur-[1px] animate-pop-in">
            <div className="relative animate-bounce-gentle">
              <Heart className="w-16 h-16 text-rose-500 fill-rose-500 drop-shadow-xl animate-pulse" />
              <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-spin" />
            </div>
          </div>
        )}

        {restaurant.imageUrl && !imageError ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-stone-800 dark:to-stone-900 text-stone-400 p-4">
            <Utensils className="w-10 h-10 text-orange-400 mb-2" />
            <span className="text-xs font-bold text-stone-500 dark:text-stone-400">Hình ảnh món ngon</span>
          </div>
        )}

        {/* Gradient overlay on top */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Eaten Status Pill Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundManager.playClick();
            onToggleEaten(restaurant.id);
          }}
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md shadow-md transition-all ${
            restaurant.eaten
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'bg-white/90 text-stone-800 hover:bg-white dark:bg-stone-900/90 dark:text-stone-100'
          }`}
          title="Bấm để đổi trạng thái Đã ăn / Chưa ăn"
        >
          {restaurant.eaten ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Đã ăn</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>Chưa ăn</span>
            </>
          )}
        </button>

        {/* Top Right Action Buttons: Heart + Context Menu */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {/* Heart Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHeartPop();
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md ${
              restaurant.isFavorite
                ? 'bg-rose-500 text-white ring-2 ring-rose-300/50 scale-105'
                : 'bg-black/40 hover:bg-black/60 text-white'
            }`}
            title="Thả tim yêu thích (hoặc chạm đúp)"
          >
            <Heart
              className={`w-4 h-4 ${restaurant.isFavorite ? 'fill-current' : ''}`}
            />
          </button>

          {/* Quick Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundManager.playClick();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all shadow-md"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Context Dropdown */}
            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-10 w-44 bg-white dark:bg-stone-900 border border-[var(--color-border)] rounded-2xl p-1.5 shadow-xl z-20 animate-pop-in text-xs font-semibold"
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onSelectDirectly(restaurant);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-stone-800 transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Chọn quán này</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(restaurant);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Chỉnh sửa</span>
                </button>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${restaurant.name} ${restaurant.address}`.trim())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--color-text-primary)] hover:bg-[var(--color-surface-subtle)] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xem trên Maps</span>
                </a>

                <hr className="my-1 border-[var(--color-border)]" />

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(restaurant.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa quán</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Restaurant Name */}
          <h3 className="font-black text-base sm:text-lg text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
            {restaurant.name}
          </h3>

          {/* Address */}
          <p className="text-xs text-[var(--color-text-secondary)] flex items-start gap-1.5 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <span>{restaurant.address || 'Chưa cập nhật địa chỉ'}</span>
          </p>

          {/* Note if any */}
          {restaurant.note && (
            <p className="text-[11px] text-[var(--color-text-muted)] italic mt-1.5 line-clamp-2">
              &ldquo;{restaurant.note}&rdquo;
            </p>
          )}
        </div>

        {/* Footer info: eaten date & click action */}
        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-medium">
          {restaurant.eaten && restaurant.eatenAt ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Clock className="w-3 h-3" />
              <span>Ăn: {formatEatenDate(restaurant.eatenAt)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-stone-400">
              <Clock className="w-3 h-3" />
              <span>Chưa thử</span>
            </span>
          )}

          <span className="text-[var(--color-primary)] font-bold group-hover:underline">
            Chi tiết →
          </span>
        </div>
      </div>
    </div>
  );
}



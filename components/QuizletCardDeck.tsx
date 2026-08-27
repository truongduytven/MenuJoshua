'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  MapPin,
  Navigation,
  CheckCircle2,
  CircleDot,
  Dices,
  Sparkles,
  Utensils,
  Layers,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface QuizletCardDeckProps {
  restaurants: Restaurant[];
  onToggleFavorite: (id: string) => void;
  onToggleEaten: (id: string) => void;
  onOpenPicker: (onlyFavorites?: boolean) => void;
  onSelectDirectly: (restaurant: Restaurant) => void;
  onSwitchToGridView?: () => void;
}

export function QuizletCardDeck({
  restaurants,
  onToggleFavorite,
  onToggleEaten,
  onOpenPicker,
}: QuizletCardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [showHeartPop, setShowHeartPop] = useState(false);

  // Smooth drag & carousel slider states
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);

  // Safe index clamping
  const safeIndex =
    restaurants.length === 0
      ? 0
      : Math.min(Math.max(0, currentIndex), restaurants.length - 1);

  const currentItem = restaurants[safeIndex] || null;
  const favoritedCount = restaurants.filter((r) => r.isFavorite).length;

  // Trigger double tap heart effect
  const triggerDoubleTapHeart = useCallback(
    (restaurantId: string) => {
      soundManager.playHeartPop();
      onToggleFavorite(restaurantId);

      setShowHeartPop(true);
      setTimeout(() => {
        setShowHeartPop(false);
      }, 900);
    },
    [onToggleFavorite]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (restaurants.length <= 1) return;
    soundManager.playClick();
    setFlippedCardId(null);
    setCurrentIndex((prev) => (prev + 1 < restaurants.length ? prev + 1 : 0));
  }, [restaurants.length]);

  const handlePrev = useCallback(() => {
    if (restaurants.length <= 1) return;
    soundManager.playClick();
    setFlippedCardId(null);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : restaurants.length - 1));
  }, [restaurants.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (currentItem) {
          setFlippedCardId((prev) => (prev === currentItem.id ? null : currentItem.id));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, currentItem]);

  // Pointer / Touch / Mouse Drag Gesture Handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };

    if (containerRef.current) {
      containerRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;

    const diffX = e.clientX - dragStartRef.current.x;

    // Apply rubber-band effect at edges if at boundaries
    let actualDragX = diffX;
    if (safeIndex === 0 && diffX > 0) {
      actualDragX = diffX * 0.35;
    } else if (safeIndex === restaurants.length - 1 && diffX < 0) {
      actualDragX = diffX * 0.35;
    }

    setDragX(actualDragX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    if (containerRef.current && containerRef.current.hasPointerCapture(e.pointerId)) {
      containerRef.current.releasePointerCapture(e.pointerId);
    }

    const start = dragStartRef.current;
    dragStartRef.current = null;

    if (!start) {
      setDragX(0);
      return;
    }

    const diffX = e.clientX - start.x;
    const diffY = e.clientY - start.y;
    const deltaTime = Date.now() - start.time;
    const moveDist = Math.sqrt(diffX * diffX + diffY * diffY);

    // Tap detection for double-tap favorite
    if (moveDist < 8) {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        if (currentItem) {
          triggerDoubleTapHeart(currentItem.id);
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
      setDragX(0);
      return;
    }

    // Velocity / Distance Swipe threshold
    const velocity = Math.abs(diffX) / Math.max(1, deltaTime);
    const isFastSwipe = velocity > 0.45 && Math.abs(diffX) > 25;
    const isLongSwipe = Math.abs(diffX) > 60;

    if (isFastSwipe || isLongSwipe) {
      if (diffX < 0) {
        // Swiping Left -> Move to Next card
        if (safeIndex < restaurants.length - 1) {
          soundManager.playClick();
          setFlippedCardId(null);
          setCurrentIndex(safeIndex + 1);
        } else {
          // Wrap to start
          soundManager.playClick();
          setFlippedCardId(null);
          setCurrentIndex(0);
        }
      } else {
        // Swiping Right -> Move to Prev card
        if (safeIndex > 0) {
          soundManager.playClick();
          setFlippedCardId(null);
          setCurrentIndex(safeIndex - 1);
        } else {
          // Wrap to end
          soundManager.playClick();
          setFlippedCardId(null);
          setCurrentIndex(restaurants.length - 1);
        }
      }
    }

    // Reset drag offset
    setDragX(0);
  };

  const handlePointerCancel = () => {
    setIsDragging(false);
    dragStartRef.current = null;
    setDragX(0);
  };

  const getGoogleMapsDirectionsUrl = (res: Restaurant) => {
    const query = encodeURIComponent(`${res.name} ${res.address}`.trim());
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  return (
    <div className="w-full max-w-xl mx-auto py-2 px-2 sm:px-4 space-y-4">
      {/* Progress & Deck Counter */}
      {restaurants.length > 0 && (
        <div className="space-y-2 px-1">
          <div className="flex items-center justify-between text-xs font-black text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-primary)]">
              <Layers className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Thẻ Flashcard ({safeIndex + 1}/{restaurants.length})</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-[var(--color-primary)] font-black text-xs shadow-xs">
              {Math.round(((safeIndex + 1) / restaurants.length) * 100)}% hoàn thành
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] overflow-hidden">
            <div
              className="h-full bg-[var(--color-primary)] transition-all duration-300 rounded-full shadow-xs"
              style={{
                width: `${((safeIndex + 1) / restaurants.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Main Flashcard Carousel Area */}
      {restaurants.length > 0 ? (
        <div className="space-y-4">
          {/* Continuous Sliding Window */}
          <div
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            className="relative w-full rounded-3xl overflow-hidden touch-pan-y select-none cursor-grab active:cursor-grabbing border-2 border-[var(--color-border)] shadow-xl shadow-black/10 bg-[var(--color-surface)]"
          >
            {/* Pop Heart Overlay on Double Tap */}
            {showHeartPop && (
              <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-pop-in">
                <div className="relative animate-bounce-gentle">
                  <Heart className="w-28 h-28 text-rose-500 fill-rose-500 drop-shadow-2xl animate-pulse" />
                  <Sparkles className="w-10 h-10 text-amber-300 absolute -top-3 -right-3 animate-spin" />
                </div>
              </div>
            )}

            {/* Seamless Horizontal Slider Track */}
            <div
              className="flex w-full will-change-transform"
              style={{
                transform: `translate3d(calc(-${safeIndex * 100}% + ${dragX}px), 0, 0)`,
                transition: isDragging
                  ? 'none'
                  : 'transform 0.36s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            >
              {restaurants.map((item) => {
                const isFlipped = flippedCardId === item.id;

                return (
                  <div
                    key={item.id}
                    className="w-full shrink-0 aspect-[4/5] sm:aspect-[4/3] relative flex flex-col justify-between overflow-hidden"
                  >
                    {!isFlipped ? (
                      /* CARD FRONT: Food photo & primary info */
                      <div className="relative w-full h-full flex flex-col justify-between pointer-events-auto">
                        {/* Photo */}
                        <div className="relative w-full h-full bg-stone-900 overflow-hidden">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              draggable={false}
                              className="w-full h-full object-cover pointer-events-none"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-900 text-stone-400">
                              <Utensils className="w-16 h-16 text-[var(--color-primary)] mb-2" />
                              <span className="font-black text-stone-600 dark:text-stone-300">
                                Hình ảnh quán ăn
                              </span>
                            </div>
                          )}

                          {/* Gradient bottom overlay for ultra readable text */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent pointer-events-none" />

                          {/* Eaten Status Pill (Top Left) */}
                          <div className="absolute top-4 left-4 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundManager.playClick();
                                onToggleEaten(item.id);
                              }}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all active:scale-95 cursor-pointer ${
                                item.eaten
                                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-white/30'
                                  : 'bg-black/50 text-white hover:bg-black/70 border border-white/20'
                              }`}
                            >
                              {item.eaten ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Đã ăn</span>
                                </>
                              ) : (
                                <>
                                  <CircleDot className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Chưa ăn</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Heart Favorite Button (Top Right) */}
                          <div className="absolute top-4 right-4 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerDoubleTapHeart(item.id);
                              }}
                              className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl transition-all transform active:scale-90 cursor-pointer ${
                                item.isFavorite
                                  ? 'bg-rose-500 text-white scale-105 ring-4 ring-rose-400/40'
                                  : 'bg-black/50 hover:bg-black/70 text-white border border-white/20'
                              }`}
                              title="Chạm đúp hoặc bấm để thả tim"
                            >
                              <Heart
                                className={`w-6 h-6 transition-transform ${
                                  item.isFavorite ? 'fill-current scale-110' : ''
                                }`}
                              />
                            </button>
                          </div>

                          {/* Double tap hint */}
                          <div className="absolute top-18 right-4 z-10 pointer-events-none hidden sm:flex items-center gap-1.5">
                            <span className="text-[11px] font-bold text-white/90 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
                              Chạm đúp để thả tim ❤️
                            </span>
                          </div>

                          {/* Bottom Text Details */}
                          <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-2 pointer-events-none">
                            <h3 className="text-2xl sm:text-3xl font-black leading-tight drop-shadow-md text-white">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-1.5 truncate">
                              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{item.address || 'Chưa có địa chỉ cụ thể'}</span>
                            </p>

                            {item.note && (
                              <p className="text-xs sm:text-sm text-white/90 italic line-clamp-2 pt-1.5 border-t border-white/20 bg-black/30 px-3 py-1.5 rounded-xl backdrop-blur-xs">
                                &ldquo;{item.note}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* CARD BACK: Detailed notes, Maps direction, info */
                      <div className="relative w-full h-full p-6 flex flex-col justify-between bg-[var(--color-surface)] overflow-y-auto pointer-events-auto">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
                            <span className="text-xs font-black uppercase text-[var(--color-primary)] tracking-wider">
                              Thông tin chi tiết quán
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerDoubleTapHeart(item.id);
                              }}
                              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold border transition-colors cursor-pointer ${
                                item.isFavorite
                                  ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                                  : 'bg-[var(--color-surface)] text-stone-400 border-[var(--color-border)]'
                              }`}
                            >
                              <Heart className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                              <span>{item.isFavorite ? 'Đã yêu thích' : 'Chưa tim'}</span>
                            </button>
                          </div>

                          <div>
                            <h3 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)]">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] flex items-start gap-1.5 mt-2">
                              <MapPin className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
                              <span>{item.address || 'Chưa cập nhật địa chỉ'}</span>
                            </p>
                          </div>

                          {item.note && (
                            <div className="p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-text-primary)] leading-relaxed italic">
                              <p className="font-bold not-italic text-[var(--color-primary)] mb-1">
                                Gợi ý / Ghi chú món ngon:
                              </p>
                              &ldquo;{item.note}&rdquo;
                            </div>
                          )}

                          <div className="p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                            <span className="font-bold">Trạng thái:</span>
                            <span
                              className={`font-black ${
                                item.eaten ? 'text-emerald-600' : 'text-orange-500'
                              }`}
                            >
                              {item.eaten ? '✓ Đã từng ăn tại quán' : 'Chưa ăn thử'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[var(--color-border)] space-y-2">
                          <a
                            href={getGoogleMapsDirectionsUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-full btn-primary py-3 px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-md shadow-[var(--color-primary)]/20"
                          >
                            <Navigation className="w-4 h-4" />
                            <span>Mở chỉ đường Google Maps</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Flip Card Floating Toggle Pill */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        setFlippedCardId(isFlipped ? null : item.id);
                      }}
                      className="absolute bottom-3.5 right-3.5 z-20 px-4 py-2 rounded-2xl bg-black/75 hover:bg-black/90 backdrop-blur-md text-white text-xs font-black flex items-center gap-2 shadow-xl border border-white/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <RotateCw
                        className={`w-4 h-4 text-amber-300 transition-transform duration-300 ${
                          isFlipped ? 'rotate-180' : ''
                        }`}
                      />
                      <span>{isFlipped ? 'Xem ảnh quán' : 'Lật xem thông tin'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Swipe / Navigation Control Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handlePrev}
              disabled={restaurants.length <= 1}
              className="py-4 px-5 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm sm:text-base font-black text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--color-primary)] stroke-[3]" />
              <span>Thẻ trước</span>
            </button>

            <button
              onClick={handleNext}
              disabled={restaurants.length <= 1}
              className="py-4 px-5 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] text-sm sm:text-base font-black text-[var(--color-text-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-sm cursor-pointer"
            >
              <span>Thẻ tiếp</span>
              <ChevronRight className="w-5 h-5 text-[var(--color-primary)] stroke-[3]" />
            </button>
          </div>

          {/* Swipe instructions helper hint */}
          <div className="flex items-center justify-center gap-3 text-xs text-[var(--color-text-muted)] font-medium pt-1">
            <span className="flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Lướt sang phải: Thẻ trước
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Lướt sang trái: Thẻ tiếp <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Dedicated Action Buttons for Random Picks */}
          <div className="p-3 rounded-2xl bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-xs space-y-2">
            {favoritedCount > 0 ? (
              <button
                onClick={() => {
                  soundManager.playClick();
                  onOpenPicker(true);
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-500/25 transform active:scale-95 transition-all cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-current animate-pulse" />
                <span>Quay ngẫu nhiên trong {favoritedCount} món đã tim</span>
              </button>
            ) : (
              <div className="text-center text-xs text-[var(--color-text-muted)] py-1 font-medium">
                💡 Hãy chạm đúp 2 lần vào ảnh để thả tim các quán yêu thích!
              </div>
            )}

            <button
              onClick={() => {
                soundManager.playClick();
                onOpenPicker(false);
              }}
              className="w-full btn-secondary py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <Dices className="w-4 h-4 text-[var(--color-primary)]" />
              <span>Quay ngẫu nhiên toàn bộ danh sách</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] space-y-3">
          <Heart className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-black text-[var(--color-text-primary)]">
            Chưa có quán nào trong danh sách
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Hãy thêm quán ăn mới vào thực đơn để bắt đầu lướt thẻ nhé!
          </p>
        </div>
      )}
    </div>
  );
}

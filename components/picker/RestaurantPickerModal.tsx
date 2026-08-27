'use client';

import React, { useState, useEffect } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  Dices,
  Sparkles,
  Utensils,
  MapPin,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { soundManager } from '@/lib/audio';

interface RestaurantPickerModalProps {
  isOpen: boolean;
  initialOnlyFavorites?: boolean;
  restaurants: Restaurant[];
  onClose: () => void;
  onSelectWinner: (restaurant: Restaurant) => void;
}

export function RestaurantPickerModal({
  isOpen,
  initialOnlyFavorites = false,
  restaurants,
  onClose,
  onSelectWinner,
}: RestaurantPickerModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeCandidate, setActiveCandidate] = useState<Restaurant | null>(null);

  // Selected candidate IDs for this current roll round
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchCandidate, setSearchCandidate] = useState('');
  const [showCandidateList, setShowCandidateList] = useState(false);

  // Initialize selected IDs when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSpinning(false);
      setSearchCandidate('');
      setShowCandidateList(false);

      if (initialOnlyFavorites) {
        const favIds = restaurants.filter((r) => r.isFavorite).map((r) => r.id);
        setSelectedIds(favIds.length > 0 ? favIds : restaurants.map((r) => r.id));
      } else {
        setSelectedIds(restaurants.map((r) => r.id));
      }

      if (restaurants.length > 0) {
        setActiveCandidate(restaurants[Math.floor(Math.random() * restaurants.length)]);
      }
    }
  }, [isOpen, initialOnlyFavorites, restaurants]);

  if (!isOpen) return null;

  // Active candidates participating in this spin round
  const activeCandidates = restaurants.filter((r) => selectedIds.includes(r.id));
  const favoritedCount = restaurants.filter((r) => r.isFavorite).length;

  // Filtered candidate list if searching
  const displayedCandidates = searchCandidate.trim()
    ? restaurants.filter((r) => {
        const q = searchCandidate.toLowerCase();
        return r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
      })
    : restaurants;

  // Toggle candidate
  const handleToggleCandidate = (id: string) => {
    if (isSpinning) return;
    soundManager.playClick();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (isSpinning) return;
    soundManager.playClick();
    setSelectedIds(restaurants.map((r) => r.id));
  };

  const handleDeselectAll = () => {
    if (isSpinning) return;
    soundManager.playClick();
    setSelectedIds([]);
  };

  const handleSelectOnlyFavorites = () => {
    if (isSpinning) return;
    soundManager.playClick();
    setSelectedIds(restaurants.filter((r) => r.isFavorite).map((r) => r.id));
  };

  // Random Shuffle with Easing Physics
  const startRandomSpin = () => {
    if (activeCandidates.length === 0 || isSpinning) return;

    setIsSpinning(true);
    soundManager.playClick();

    const winnerIndex = Math.floor(Math.random() * activeCandidates.length);
    const finalWinner = activeCandidates[winnerIndex];

    const totalSteps = 26;
    let currentStep = 0;

    const runStep = () => {
      currentStep++;
      const randomItem = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
      setActiveCandidate(randomItem);
      soundManager.playTick(1.0 + (currentStep / totalSteps) * 0.3);

      if (currentStep < totalSteps) {
        const progress = currentStep / totalSteps;
        const delay = 40 + Math.pow(progress, 2.4) * 300;
        setTimeout(runStep, delay);
      } else {
        setActiveCandidate(finalWinner);
        setTimeout(() => {
          setIsSpinning(false);
          onSelectWinner(finalWinner);
        }, 350);
      }
    };

    runStep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-pop-in overflow-y-auto">
      <div
        className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xs">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--color-text-primary)]">
                Quay Ngẫu Nhiên
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)] font-medium">
                {activeCandidates.length} / {restaurants.length} quán được chọn
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isSpinning) {
                soundManager.playClick();
                onClose();
              }
            }}
            disabled={isSpinning}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {/* Collapsible Candidate Selection Trigger */}
          <div className="rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCandidateList(!showCandidateList)}
              className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span>Chọn bớt quán ({activeCandidates.length}/{restaurants.length})</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-black text-[var(--color-primary)]">
                <span>{showCandidateList ? 'Thu gọn' : 'Tùy chỉnh'}</span>
                {showCandidateList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Collapsed Candidate Filter Drawer */}
            {showCandidateList && (
              <div className="px-4 pb-3.5 pt-1 border-t border-[var(--color-border)] space-y-2.5 animate-pop-in">
                {/* Search & Fast Controls */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchCandidate}
                      onChange={(e) => setSearchCandidate(e.target.value)}
                      placeholder="Tìm kiếm nhanh quán..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                    />
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={handleDeselectAll}
                      className="text-stone-400 hover:underline"
                    >
                      Bỏ chọn
                    </button>
                  </div>

                  {favoritedCount > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectOnlyFavorites}
                      className="text-rose-500 hover:underline flex items-center gap-1"
                    >
                      <span>❤️ Chỉ chọn Đã tim ({favoritedCount})</span>
                    </button>
                  )}
                </div>

                {/* Compact selectable list */}
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1 no-scrollbar">
                  {displayedCandidates.map((res) => {
                    const isSelected = selectedIds.includes(res.id);
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleToggleCandidate(res.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[var(--color-surface)] border-[var(--color-primary)] shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-900/40 border-transparent opacity-50 hover:opacity-80'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-[var(--color-text-primary)]' : 'text-stone-400 line-through'}`}>
                            {res.name}
                          </span>
                        </div>

                        {res.isFavorite && (
                          <span className="text-xs shrink-0 ml-1">❤️</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Stage: Shuffling / Rolling Display Card */}
          {activeCandidates.length > 0 ? (
            <div
              className={`relative w-full rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                isSpinning
                  ? 'border-[var(--color-primary)] shadow-xl shadow-[var(--color-primary)]/20 scale-[1.01]'
                  : 'border-[var(--color-border)] shadow-md'
              }`}
            >
              {/* Display Card Image */}
              <div className="relative w-full aspect-[16/11] bg-stone-900 overflow-hidden">
                {activeCandidate?.imageUrl ? (
                  <img
                    src={activeCandidate.imageUrl}
                    alt={activeCandidate.name}
                    className={`w-full h-full object-cover transition-all ${
                      isSpinning ? 'filter blur-[1px] brightness-105' : ''
                    }`}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--color-surface-subtle)] text-stone-400">
                    <Utensils className="w-12 h-12 text-[var(--color-primary)] mb-2" />
                    <span className="font-bold text-stone-500">Món ăn ngon</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Spinning indicator banner */}
                {isSpinning && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[var(--color-primary)] text-white text-xs font-black animate-pulse flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang quay chọn...</span>
                  </div>
                )}

                {/* Card Title & Info over image */}
                <div className="absolute bottom-3.5 left-4 right-4 text-white space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black leading-tight drop-shadow-md">
                    {activeCandidate?.name || 'Đang sẵn sàng...'}
                  </h3>
                  <p className="text-xs text-stone-200 flex items-center gap-1 truncate">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{activeCandidate?.address || 'Địa chỉ quán'}</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-[var(--color-text-primary)]">
                Chưa có quán nào được chọn!
              </p>
              <button
                type="button"
                onClick={handleSelectAll}
                className="mt-3 btn-primary px-4 py-2 text-xs font-bold rounded-xl"
              >
                Chọn tất cả {restaurants.length} quán
              </button>
            </div>
          )}

          {/* Primary Giant Spin Action Button */}
          <button
            onClick={startRandomSpin}
            disabled={activeCandidates.length === 0 || isSpinning}
            className="w-full btn-primary py-3.5 sm:py-4 px-6 text-base font-black flex items-center justify-center gap-2.5 shadow-xl shadow-[var(--color-primary)]/25 disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95 transition-all"
          >
            <Dices
              className={`w-5 h-5 ${isSpinning ? 'animate-spin' : 'animate-bounce-gentle'}`}
            />
            <span>
              {isSpinning
                ? 'ĐANG QUAY CHỌN...'
                : `BẮT ĐẦU QUAY NGẪU NHIÊN (${activeCandidates.length} quán)`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}




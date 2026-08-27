'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Restaurant, ThemePreset } from '@/types/restaurant';
import {
  getStoredRestaurants,
  saveStoredRestaurants,
  getStoredTheme,
  saveStoredTheme,
  getStoredSoundEnabled,
  saveStoredSoundEnabled,
} from '@/lib/storage';
import { soundManager } from '@/lib/audio';
import {
  fetchRestaurantsApi,
  saveRestaurantApi,
  updateRestaurantApi,
  deleteRestaurantApi,
  bulkUpdateRestaurantsApi,
} from '@/lib/api';
import { ToastProvider, useToast } from '@/components/ToastContext';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { FilterBar } from '@/components/FilterBar';
import { RestaurantCard } from '@/components/RestaurantCard';
import { RestaurantDetailModal } from '@/components/RestaurantDetailModal';
import { AddEditRestaurantModal } from '@/components/AddEditRestaurantModal';
import { ThemeCustomizerModal } from '@/components/ThemeCustomizerModal';
import { RestaurantPickerModal } from '@/components/picker/RestaurantPickerModal';
import { WinnerScreen } from '@/components/picker/WinnerScreen';
import { QuizletCardDeck } from '@/components/QuizletCardDeck';
import { DataManagerModal } from '@/components/DataManagerModal';
import { Plus, UtensilsCrossed, Dices } from 'lucide-react';

function MainApp() {
  const { showToast } = useToast();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentTheme, setCurrentTheme] = useState<ThemePreset>('orange-food');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // View Mode: 'grid' or 'flashcard' (Quizlet style)
  const [viewMode, setViewMode] = useState<'grid' | 'flashcard'>('grid');

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerOnlyFavorites, setPickerOnlyFavorites] = useState(false);

  const [isWinnerOpen, setIsWinnerOpen] = useState(false);
  const [winningRestaurant, setWinningRestaurant] = useState<Restaurant | null>(null);

  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isDataManagerOpen, setIsDataManagerOpen] = useState(false);

  // Initialize data from local storage & DB on mount
  useEffect(() => {
    const loadedRestaurants = getStoredRestaurants();
    const loadedTheme = getStoredTheme();
    const loadedSound = getStoredSoundEnabled();

    setRestaurants(loadedRestaurants);
    setCurrentTheme(loadedTheme);
    setSoundEnabled(loadedSound);
    soundManager.setMuted(!loadedSound);
    document.documentElement.setAttribute('data-theme', loadedTheme);
    setIsLoaded(true);

    // Fetch fresh data from Neon PostgreSQL database
    fetchRestaurantsApi()
      .then((dbData) => {
        if (dbData && dbData.length > 0) {
          setRestaurants(dbData);
          saveStoredRestaurants(dbData);
        } else if (loadedRestaurants.length > 0) {
          // If DB is empty but we have local restaurants, seed them into DB
          bulkUpdateRestaurantsApi(loadedRestaurants, 'append').catch(console.error);
        }
      })
      .catch((err) => {
        console.warn('Could not sync from database, using cached local data:', err);
      });

    const handleDataUpdate = () => {
      setRestaurants(getStoredRestaurants());
    };

    window.addEventListener('restaurants_updated', handleDataUpdate);

    return () => {
      window.removeEventListener('restaurants_updated', handleDataUpdate);
    };
  }, []);

  // Sync helpers
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.setMuted(!next);
    saveStoredSoundEnabled(next);
  };

  const handleSelectTheme = (theme: ThemePreset) => {
    setCurrentTheme(theme);
    saveStoredTheme(theme);
  };

  // Bulk update restaurants handler (for JSON import / reset / bulk delete)
  const handleUpdateAllRestaurants = async (newList: Restaurant[]) => {
    setRestaurants(newList);
    saveStoredRestaurants(newList);
    try {
      await bulkUpdateRestaurantsApi(newList, 'replace');
    } catch (e) {
      console.error('Failed to sync bulk update to DB:', e);
    }
  };

  // Toggle favorite (Thả tim)
  const handleToggleFavorite = async (id: string) => {
    let nextFav = false;
    const updated = restaurants.map((r) => {
      if (r.id === id) {
        nextFav = !r.isFavorite;
        return {
          ...r,
          isFavorite: nextFav,
        };
      }
      return r;
    });

    setRestaurants(updated);
    saveStoredRestaurants(updated);

    const changedItem = updated.find((r) => r.id === id);
    if (changedItem) {
      if (viewingRestaurant?.id === id) {
        setViewingRestaurant(changedItem);
      }
      if (winningRestaurant?.id === id) {
        setWinningRestaurant(changedItem);
      }
    }

    try {
      await updateRestaurantApi(id, { isFavorite: nextFav });
    } catch (e) {
      console.error('Failed to update favorite in DB:', e);
    }
  };

  // Toggle eaten status directly
  const handleToggleEaten = async (id: string) => {
    let nextEaten = false;
    const updated = restaurants.map((r) => {
      if (r.id === id) {
        nextEaten = !r.eaten;
        return {
          ...r,
          eaten: nextEaten,
          eatenAt: nextEaten ? new Date().toISOString() : undefined,
        };
      }
      return r;
    });

    setRestaurants(updated);
    saveStoredRestaurants(updated);

    const changedItem = updated.find((r) => r.id === id);
    if (changedItem) {
      if (changedItem.eaten) {
        soundManager.playSuccessChime();
      }

      // Sync active modals if viewing this restaurant
      if (viewingRestaurant?.id === id) {
        setViewingRestaurant(changedItem);
      }
      if (winningRestaurant?.id === id) {
        setWinningRestaurant(changedItem);
      }
    }

    try {
      await updateRestaurantApi(id, {
        eaten: nextEaten,
        eatenAt: nextEaten ? new Date().toISOString() : undefined,
      });
    } catch (e) {
      console.error('Failed to update eaten status in DB:', e);
    }
  };

  // Save new or updated restaurant
  const handleSaveRestaurant = async (item: Restaurant) => {
    const exists = restaurants.some((r) => r.id === item.id);
    let updated: Restaurant[];

    if (exists) {
      updated = restaurants.map((r) => (r.id === item.id ? item : r));
      showToast({
        title: '✓ Đã cập nhật thông tin quán!',
        description: item.name,
        type: 'success',
      });
    } else {
      updated = [item, ...restaurants];
      showToast({
        title: '🎉 Đã thêm quán mới vào danh sách!',
        description: item.name,
        type: 'success',
      });
    }

    setRestaurants(updated);
    saveStoredRestaurants(updated);
    setIsAddEditOpen(false);
    setEditingRestaurant(null);

    try {
      await saveRestaurantApi(item);
    } catch (e) {
      console.error('Failed to save restaurant to DB:', e);
    }
  };

  // Delete restaurant with Undo capability
  const handleDeleteRestaurant = async (id: string) => {
    const deletedItem = restaurants.find((r) => r.id === id);
    if (!deletedItem) return;

    const remaining = restaurants.filter((r) => r.id !== id);
    setRestaurants(remaining);
    saveStoredRestaurants(remaining);

    try {
      await deleteRestaurantApi(id);
    } catch (e) {
      console.error('Failed to delete restaurant from DB:', e);
    }

    showToast({
      title: `Đã xóa quán "${deletedItem.name}"`,
      type: 'info',
      action: {
        label: 'Hoàn tác',
        onClick: async () => {
          const restored = [deletedItem, ...remaining];
          setRestaurants(restored);
          saveStoredRestaurants(restored);
          try {
            await saveRestaurantApi(deletedItem);
          } catch (e) {
            console.error('Failed to restore restaurant in DB:', e);
          }
          showToast({
            title: `✓ Đã khôi phục quán "${deletedItem.name}"`,
            type: 'success',
          });
        },
      },
    });
  };

  // Filter & Sort Logic (Newest first by default, filtered by search query)
  const filteredRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.address.toLowerCase().includes(q) ||
          (r.note && r.note.toLowerCase().includes(q))
      );
    }

    // Default sorting: newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return result;
  }, [restaurants, searchQuery]);

  // Statistics
  const eatenCount = useMemo(() => restaurants.filter((r) => r.eaten).length, [restaurants]);
  const uneatenCount = restaurants.length - eatenCount;
  const favoritedCount = useMemo(() => restaurants.filter((r) => r.isFavorite).length, [restaurants]);

  // Open Picker modal
  const handleOpenPicker = (onlyFavorites = false) => {
    if (restaurants.length === 0) {
      showToast({
        title: 'Chưa có quán nào trong danh sách!',
        description: 'Hãy bấm "+ Thêm quán" để bắt đầu nhé.',
        type: 'error',
      });
      return;
    }

    if (onlyFavorites && favoritedCount === 0) {
      showToast({
        title: 'Chưa có quán nào được thả tim ❤️',
        description: 'Chạm đúp vào ảnh quán hoặc bấm icon trái tim để yêu thích trước nhé!',
        type: 'warning',
      });
      return;
    }

    setPickerOnlyFavorites(onlyFavorites);
    setIsPickerOpen(true);
  };

  // When a winner is selected from picker
  const handleSelectWinner = (winner: Restaurant) => {
    setIsPickerOpen(false);
    setWinningRestaurant(winner);
    setIsWinnerOpen(true);
  };

  // Direct pick from card/modal
  const handleSelectDirectly = (res: Restaurant) => {
    setWinningRestaurant(res);
    setIsWinnerOpen(true);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto animate-bounce-gentle">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <p className="font-extrabold text-stone-700 text-base">Đang mở thực đơn ngon lành...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-text-primary)] transition-colors pb-24 sm:pb-12">
      {/* Top Sticky Navigation */}
      <Navbar
        totalCount={restaurants.length}
        eatenCount={eatenCount}
        uneatenCount={uneatenCount}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAddModal={() => {
          setEditingRestaurant(null);
          setIsAddEditOpen(true);
        }}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenDataManagerModal={() => setIsDataManagerOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 sm:px-6 pt-6 flex-1">
        {/* Central Playful Hero CTA Banner */}
        <HeroBanner
          onOpenPicker={() => handleOpenPicker(false)}
          onOpenAddModal={() => {
            setEditingRestaurant(null);
            setIsAddEditOpen(true);
          }}
          restaurantCount={restaurants.length}
        />

        {/* Section Heading & Stats Bar */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-text-primary)] flex items-center gap-2">
              <span>Danh sách quán ăn</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                {filteredRestaurants.length} / {restaurants.length} quán
              </span>
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Khám phá và lưu lại những địa điểm ăn uống ngon nhất • Chạm đúp để thả tim ❤️
            </p>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              setEditingRestaurant(null);
              setIsAddEditOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-xs font-bold text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm quán mới</span>
          </button>
        </div>

        {/* Filter & View Switcher Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Dynamic View: Quizlet Flashcard vs Grid */}
        {viewMode === 'flashcard' ? (
          <QuizletCardDeck
            restaurants={filteredRestaurants.length > 0 ? filteredRestaurants : restaurants}
            onToggleFavorite={handleToggleFavorite}
            onToggleEaten={handleToggleEaten}
            onOpenPicker={handleOpenPicker}
            onSelectDirectly={handleSelectDirectly}
            onSwitchToGridView={() => setViewMode('grid')}
          />
        ) : filteredRestaurants.length > 0 ? (
          /* Restaurant Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredRestaurants.map((res) => (
              <RestaurantCard
                key={res.id}
                restaurant={res}
                onToggleEaten={handleToggleEaten}
                onToggleFavorite={handleToggleFavorite}
                onEdit={(item) => {
                  setEditingRestaurant(item);
                  setIsAddEditOpen(true);
                }}
                onDelete={handleDeleteRestaurant}
                onClick={(item) => {
                  setViewingRestaurant(item);
                  setIsDetailOpen(true);
                }}
                onSelectDirectly={handleSelectDirectly}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 px-6 text-center rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs max-w-lg mx-auto my-8">
            <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <UtensilsCrossed className="w-10 h-10" />
            </div>

            {restaurants.length === 0 ? (
              <>
                <h3 className="text-xl font-black text-[var(--color-text-primary)]">
                  Chưa có quán nào cả!
                </h3>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Thêm những quán ăn bạn đang muốn thử hoặc các quán quen để bắt đầu quay chọn nhé!
                </p>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setEditingRestaurant(null);
                    setIsAddEditOpen(true);
                  }}
                  className="mt-6 btn-primary px-6 py-3 text-sm font-bold inline-flex items-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Thêm quán đầu tiên</span>
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-black text-[var(--color-text-primary)]">
                  Không tìm thấy quán nào phù hợp
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-xs mx-auto">
                  Thử xóa bớt từ khóa tìm kiếm nhé.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)]"
                >
                  Đặt lại tìm kiếm
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {/* 1. Add / Edit Restaurant Modal */}
      <AddEditRestaurantModal
        isOpen={isAddEditOpen}
        initialData={editingRestaurant}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingRestaurant(null);
        }}
        onSave={handleSaveRestaurant}
      />

      {/* 2. Restaurant Detail Modal */}
      <RestaurantDetailModal
        restaurant={viewingRestaurant}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingRestaurant(null);
        }}
        onToggleEaten={handleToggleEaten}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(item) => {
          setIsDetailOpen(false);
          setEditingRestaurant(item);
          setIsAddEditOpen(true);
        }}
        onDelete={(id) => {
          setIsDetailOpen(false);
          handleDeleteRestaurant(id);
        }}
        onSelectDirectly={handleSelectDirectly}
      />

      {/* 3. Picker Modal (Random mode with customizable candidate pool) */}
      <RestaurantPickerModal
        isOpen={isPickerOpen}
        initialOnlyFavorites={pickerOnlyFavorites}
        restaurants={restaurants}
        onClose={() => setIsPickerOpen(false)}
        onSelectWinner={handleSelectWinner}
      />

      {/* 4. Grand Winner Celebration Screen */}
      <WinnerScreen
        restaurant={winningRestaurant!}
        isOpen={isWinnerOpen && winningRestaurant !== null}
        onClose={() => {
          setIsWinnerOpen(false);
          setWinningRestaurant(null);
        }}
        onSpinAgain={() => {
          setIsWinnerOpen(false);
          handleOpenPicker(false);
        }}
        onToggleEaten={handleToggleEaten}
      />

      {/* 5. Theme & Settings Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        currentTheme={currentTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onSelectTheme={handleSelectTheme}
        onClose={() => setIsThemeModalOpen(false)}
        onDataReset={() => {
          setRestaurants(getStoredRestaurants());
          setCurrentTheme(getStoredTheme());
          setSoundEnabled(getStoredSoundEnabled());
        }}
      />

      {/* 6. Bulk Data & JSON Management Modal */}
      <DataManagerModal
        isOpen={isDataManagerOpen}
        restaurants={restaurants}
        onClose={() => setIsDataManagerOpen(false)}
        onUpdateRestaurants={handleUpdateAllRestaurants}
        onShowToast={showToast}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}


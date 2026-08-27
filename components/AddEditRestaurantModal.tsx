'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  Upload,
  Sparkles,
  MapPin,
  Check,
  CheckCircle2,
  CircleDot,
} from 'lucide-react';
import { FOOD_PRESET_IMAGES } from '@/lib/storage';
import { soundManager } from '@/lib/audio';

interface AddEditRestaurantModalProps {
  isOpen: boolean;
  initialData?: Restaurant | null;
  onClose: () => void;
  onSave: (restaurant: Restaurant) => void;
}

export function AddEditRestaurantModal({
  isOpen,
  initialData,
  onClose,
  onSave,
}: AddEditRestaurantModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [eaten, setEaten] = useState(false);
  const [note, setNote] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setAddress(initialData.address || '');
      setImageUrl(initialData.imageUrl || '');
      setEaten(initialData.eaten || false);
      setNote(initialData.note || '');
    } else {
      setName('');
      setAddress('');
      setImageUrl('');
      setEaten(false);
      setNote('');
    }
  }, [initialData, isOpen]);

  // Global paste handler for screenshot / image clipboard
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setImageUrl(event.target.result as string);
                soundManager.playSuccessChime();
              }
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string);
        soundManager.playSuccessChime();
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playSuccessChime();

    const newRestaurant: Restaurant = {
      id: initialData?.id || 'res-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      name: name.trim(),
      address: address.trim(),
      imageUrl: imageUrl.trim(),
      eaten,
      eatenAt: eaten ? initialData?.eatenAt || new Date().toISOString() : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      note: note.trim() || undefined,
    };

    onSave(newRestaurant);
  };

  return (
    <div
      ref={modalContainerRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-pop-in overflow-y-auto"
    >
      <div
        className="relative w-full max-w-xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-subtle)]">
          <div>
            <h2 className="text-xl font-black text-[var(--color-text-primary)]">
              {initialData ? 'Chỉnh sửa quán ăn' : 'Thêm quán ăn mới'}
            </h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
              Lưu lại địa điểm bạn muốn trải nghiệm hoặc đã từng ăn
            </p>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          {/* Section 1: Image Upload & Paste Area */}
          <div>
            <label className="block font-bold text-xs text-[var(--color-text-primary)] mb-1.5 flex items-center justify-between">
              <span>Hình ảnh quán / món ăn</span>
              <span className="text-[11px] text-[var(--color-primary)] font-semibold">
                📷 Có thể bấm Ctrl/Cmd + V để paste ảnh chụp màn hình
              </span>
            </label>

            {/* Drop / Paste Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface-subtle)]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {imageUrl ? (
                <div className="relative group/preview w-full h-44 rounded-xl overflow-hidden">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="text-xs font-bold text-white bg-black/60 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                      Bấm để thay đổi ảnh
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl('');
                      }}
                      className="text-xs font-bold text-rose-300 bg-rose-950/80 px-3 py-1.5 rounded-lg"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-4 flex flex-col items-center justify-center text-[var(--color-text-secondary)]">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-primary)] flex items-center justify-center shadow-xs mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-[var(--color-text-primary)]">
                    Kéo thả ảnh vào đây hoặc click để tải lên
                  </p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1">
                    Hỗ trợ paste trực tiếp từ clipboard (Ctrl + V / Cmd + V)
                  </p>
                </div>
              )}
            </div>

            {/* Quick Preset Photos Selector */}
            <div className="mt-2.5">
              <span className="text-[11px] font-bold text-[var(--color-text-muted)]">
                Hoặc chọn nhanh ảnh mẫu có sẵn:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
                {FOOD_PRESET_IMAGES.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      soundManager.playClick();
                      setImageUrl(preset.url);
                    }}
                    className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Name & Address */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-xs text-[var(--color-text-primary)] mb-1">
                Tên quán ăn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Phở Thìn Lò Đúc, Cơm Tấm Ba Ghiền..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </div>

            <div>
              <label className="block font-bold text-xs text-[var(--color-text-primary)] mb-1">
                Địa chỉ quán
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ví dụ: 13 Lò Đúc, Hai Bà Trưng, Hà Nội"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Eaten Status */}
          <div>
            <label className="block font-bold text-xs text-[var(--color-text-primary)] mb-1">
              Trạng thái đã ăn
            </label>
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                setEaten(!eaten);
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                eaten
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                  : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-secondary)] border-[var(--color-border)]'
              }`}
            >
              {eaten ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đã từng ăn ở quán này</span>
                </>
              ) : (
                <>
                  <CircleDot className="w-4 h-4 text-orange-500" />
                  <span>Chưa ăn (Quán muốn thử)</span>
                </>
              )}
            </button>
          </div>

          {/* Section 5: Note */}
          <div>
            <label className="block font-bold text-xs text-[var(--color-text-primary)] mb-1">
              Ghi chú / Món ngon nên thử
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Ví dụ: Nên gọi sườn cọng nướng, gọi thêm trứng ốp la, quán đông lúc 12h..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)]"
            />
          </div>

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)]"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="btn-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {initialData ? 'Lưu thay đổi' : 'Thêm vào danh sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Sparkles,
  MapPin,
  Check,
  CheckCircle2,
  CircleDot,
} from 'lucide-react';
import { FOOD_PRESET_IMAGES } from '@/lib/storage';
import { MAX_IMAGE_BYTES } from '@/lib/api';
import { soundManager } from '@/lib/audio';

const MAX_IMAGE_MB = MAX_IMAGE_BYTES / (1024 * 1024);

interface AddEditRestaurantModalProps {
  isOpen: boolean;
  initialData?: Restaurant | null;
  onClose: () => void;
  onSave: (restaurant: Restaurant, imageFile?: File | null) => Promise<void> | void;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [eaten, setEaten] = useState(false);
  const [note, setNote] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewObjectUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewObjectUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    setSelectedFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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

  const validateAndSelectFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setImageError('Vui lòng chọn đúng tệp hình ảnh (PNG, JPG, WEBP, GIF...).');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setImageError(
        `Ảnh vượt quá giới hạn tối đa ${MAX_IMAGE_MB}MB (dung lượng hiện tại: ${sizeMb}MB).`
      );
      return;
    }
    setImageError(null);
    setImageUrl('');
    setSelectedFile(file);
    soundManager.playSuccessChime();
  };

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
            if (!blob.type.startsWith('image/')) {
              setImageError('Vui lòng chọn đúng tệp hình ảnh (PNG, JPG, WEBP, GIF...).');
            } else if (blob.size > MAX_IMAGE_BYTES) {
              const sizeMb = (blob.size / (1024 * 1024)).toFixed(2);
              setImageError(
                `Ảnh vượt quá giới hạn tối đa ${MAX_IMAGE_MB}MB (dung lượng hiện tại: ${sizeMb}MB).`
              );
            } else {
              setImageError(null);
              setImageUrl('');
              setSelectedFile(blob);
              soundManager.playSuccessChime();
            }
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const clearSelectedImage = () => {
    setSelectedFile(null);
    setImageUrl('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (file: File) => {
    validateAndSelectFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    const newRestaurant: Restaurant = {
      id: initialData?.id || 'res-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      address: address.trim(),
      imageUrl: selectedFile ? '' : imageUrl.trim(),
      eaten,
      eatenAt: eaten ? initialData?.eatenAt || new Date().toISOString() : undefined,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      note: note.trim() || undefined,
    };

    setIsSaving(true);
    try {
      await onSave(newRestaurant, selectedFile);
      soundManager.playSuccessChime();
    } catch {
      // Error toast is handled by parent onSave
    } finally {
      setIsSaving(false);
    }
  };

  const activePreviewUrl = previewObjectUrl || imageUrl;
  const hasPendingUpload =
    Boolean(selectedFile) || /^data:image\/[a-zA-Z0-9+.-]+;base64,/i.test(imageUrl.trim());

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
          {/* Section 1: Image URL Input & Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-xs text-[var(--color-text-primary)]">
                Đường dẫn ảnh (Image URL)
              </label>
              <label className="text-[11px] text-[var(--color-primary)] font-bold cursor-pointer hover:underline flex items-center gap-1">
                <Upload className="w-3 h-3" />
                <span>Tải ảnh từ máy (tối đa {MAX_IMAGE_MB}MB)</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                      e.target.value = '';
                    }
                  }}
                />
              </label>
            </div>

            {/* URL Input */}
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setSelectedFile(null);
                  setImageError(null);
                  setImageUrl(e.target.value);
                }}
                placeholder={
                  selectedFile
                    ? `Đã chọn tệp "${selectedFile.name}" (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) — sẽ upload khi lưu`
                    : 'Dán link ảnh tại đây (https://images.unsplash.com/... hoặc link ảnh bất kỳ)'
                }
                className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
              {activePreviewUrl && (
                <button
                  type="button"
                  onClick={clearSelectedImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {imageError && (
              <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {imageError}
              </p>
            )}

            {/* Image Preview or Drop Zone */}
            {activePreviewUrl ? (
              <div className="relative group/preview w-full h-44 rounded-2xl overflow-hidden border border-[var(--color-border)] bg-stone-900 shadow-xs">
                <img
                  key={activePreviewUrl}
                  src={activePreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/preview:scale-105"
                  onError={(e) => {
                    // Fallback on broken image link
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <span className="text-[11px] font-bold text-white/90 bg-black/50 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                    {selectedFile
                      ? `${selectedFile.name || 'Ảnh dán'} • ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                      : 'Xem trước ảnh'}
                  </span>
                  <button
                    type="button"
                    onClick={clearSelectedImage}
                    className="text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 px-3 py-1 rounded-lg transition-colors"
                  >
                    Xóa ảnh này
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-3.5 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-surface-subtle)]'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-[var(--color-text-secondary)]">
                  <ImageIcon className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="text-xs font-bold text-[var(--color-text-primary)]">
                    Chưa có ảnh (Dán link URL ở trên, kéo thả ảnh hoặc bấm Ctrl+V • tối đa {MAX_IMAGE_MB}MB)
                  </span>
                </div>
              </div>
            )}

            {/* Quick Preset Photos Selector */}
            <div className="pt-1">
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
                      setSelectedFile(null);
                      setImageError(null);
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
              disabled={isSaving}
              onClick={() => {
                soundManager.playClick();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-subtle)] disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="btn-primary px-6 py-2.5 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving
                ? hasPendingUpload
                  ? 'Đang tải ảnh & lưu...'
                  : 'Đang lưu...'
                : initialData
                ? 'Lưu thay đổi'
                : 'Thêm vào danh sách'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


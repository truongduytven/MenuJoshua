'use client';

import React, { useState } from 'react';
import { Restaurant } from '@/types/restaurant';
import {
  X,
  Database,
  FileJson,
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  CheckSquare,
  Square,
  Sparkles,
  Plus,
} from 'lucide-react';
import { soundManager } from '@/lib/audio';
import { INITIAL_RESTAURANTS } from '@/lib/storage';

interface DataManagerModalProps {
  isOpen: boolean;
  restaurants: Restaurant[];
  onClose: () => void;
  onUpdateRestaurants: (newList: Restaurant[]) => void;
  onShowToast: (msg: { title: string; description?: string; type?: 'success' | 'info' | 'warning' | 'error' }) => void;
}

const SAMPLE_JSON_TEMPLATE = `[
  {
    "name": "Phở Bò Gia Truyền",
    "address": "45 Hàng Đồng, Hoàn Kiếm, Hà Nội",
    "imageUrl": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop&q=80"
  },
  {
    "name": "Bún Đậu Mắm Tôm Cô Hương",
    "address": "174 Nguyễn Trãi, Thanh Xuân, Hà Nội",
    "imageUrl": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&auto=format&fit=crop&q=80"
  }
]`;

export function DataManagerModal({
  isOpen,
  restaurants,
  onClose,
  onUpdateRestaurants,
  onShowToast,
}: DataManagerModalProps) {
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'bulk-delete'>('import');
  
  // Import state
  const [jsonInput, setJsonInput] = useState('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreviewCount, setParsedPreviewCount] = useState<number | null>(null);

  // Export state
  const [copied, setCopied] = useState(false);

  // Bulk delete state
  const [selectedDeleteIds, setSelectedDeleteIds] = useState<string[]>([]);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  if (!isOpen) return null;

  // Handle JSON Input change & auto validate
  const handleJsonInputChange = (text: string) => {
    setJsonInput(text);
    setParseError(null);
    setParsedPreviewCount(null);

    if (!text.trim()) return;

    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setParseError('Dữ liệu JSON phải là một mảng danh sách [ { ... }, { ... } ]');
        return;
      }
      if (parsed.length === 0) {
        setParseError('Mảng JSON đang rỗng.');
        return;
      }
      // Check each item has at least a name
      const validItems = parsed.filter(
        (item) => item && typeof item === 'object' && (item.name || item.title || item['tên'] || item['tên món'])
      );
      if (validItems.length === 0) {
        setParseError('Không tìm thấy món/quán nào có trường "name" hợp lệ.');
        return;
      }
      setParsedPreviewCount(validItems.length);
    } catch (e: any) {
      setParseError('Cú pháp JSON chưa đúng: ' + e.message);
    }
  };

  // Upload file handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleJsonInputChange(content);
    };
    reader.readAsText(file);
  };

  // Fill sample template
  const handleFillSample = () => {
    soundManager.playClick();
    handleJsonInputChange(SAMPLE_JSON_TEMPLATE);
  };

  // Execute Import
  const handleExecuteImport = () => {
    if (!jsonInput.trim()) return;

    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error('Dữ liệu phải là một mảng.');

      const newItems: Restaurant[] = parsed
        .filter((item) => item && typeof item === 'object' && (item.name || item.title || item['tên'] || item['tên món']))
        .map((item, idx) => {
          const name = String(item.name || item.title || item.mon || item['tên'] || item['tên món'] || '').trim();
          const address = String(item.address || item.diaChi || item['địa chỉ'] || '').trim();
          const imageUrl = String(item.imageUrl || item.image || item.image_url || item.url || item.photo || '').trim();

          return {
            id: item.id || `res_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
            name,
            address,
            imageUrl,
            note: item.note ? String(item.note).trim() : undefined,
            eaten: Boolean(item.eaten),
            eatenAt: item.eatenAt || (item.eaten ? new Date().toISOString() : undefined),
            isFavorite: Boolean(item.isFavorite),
            createdAt: item.createdAt || new Date().toISOString(),
          };
        });

      if (newItems.length === 0) {
        setParseError('Không có quán/món hợp lệ để nhập.');
        return;
      }

      let updatedList: Restaurant[];
      if (importMode === 'replace') {
        updatedList = newItems;
      } else {
        // Append & avoid duplicate IDs
        const existingIds = new Set(restaurants.map((r) => r.id));
        const filteredNew = newItems.map((item) =>
          existingIds.has(item.id)
            ? { ...item, id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}` }
            : item
        );
        updatedList = [...filteredNew, ...restaurants];
      }

      soundManager.playSuccessChime();
      onUpdateRestaurants(updatedList);
      onShowToast({
        title: `✓ Đã nhập thành công ${newItems.length} món ăn!`,
        description: importMode === 'replace' ? 'Đã thay thế toàn bộ danh sách cũ.' : 'Đã gộp thêm vào danh sách hiện tại.',
        type: 'success',
      });
      onClose();
    } catch (e: any) {
      setParseError('Lỗi xử lý: ' + e.message);
    }
  };

  // Copy JSON to clipboard
  const handleCopyJson = () => {
    soundManager.playClick();
    const cleanData = restaurants.map(({ name, address, imageUrl }) => ({
      name,
      address,
      imageUrl,
    }));
    navigator.clipboard.writeText(JSON.stringify(cleanData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast({
      title: '✓ Đã sao chép toàn bộ JSON vào bộ nhớ tạm!',
      type: 'success',
    });
  };

  // Download JSON file
  const handleDownloadJson = () => {
    soundManager.playClick();
    const cleanData = restaurants.map(({ name, address, imageUrl }) => ({
      name,
      address,
      imageUrl,
    }));
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cleanData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `danh_sach_mon_an_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast({
      title: '✓ Đã tải file JSON về máy!',
      type: 'success',
    });
  };

  // Bulk Delete
  const handleToggleSelectDelete = (id: string) => {
    soundManager.playClick();
    setSelectedDeleteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllDelete = () => {
    soundManager.playClick();
    setSelectedDeleteIds(restaurants.map((r) => r.id));
  };

  const handleDeselectAllDelete = () => {
    soundManager.playClick();
    setSelectedDeleteIds([]);
  };

  const handleExecuteBulkDelete = () => {
    if (selectedDeleteIds.length === 0) return;
    soundManager.playClick();
    const count = selectedDeleteIds.length;
    const remaining = restaurants.filter((r) => !selectedDeleteIds.includes(r.id));
    onUpdateRestaurants(remaining);
    setSelectedDeleteIds([]);
    onShowToast({
      title: `✓ Đã xóa ${count} quán ăn khỏi danh sách!`,
      type: 'info',
    });
  };

  // Clear all restaurants
  const handleClearAll = () => {
    soundManager.playClick();
    onUpdateRestaurants([]);
    setConfirmClearAll(false);
    onShowToast({
      title: 'Đã xóa trắng toàn bộ danh sách quán ăn!',
      type: 'info',
    });
    onClose();
  };

  // Reset to default sample restaurants
  const handleResetSampleData = () => {
    soundManager.playSuccessChime();
    onUpdateRestaurants(INITIAL_RESTAURANTS);
    onShowToast({
      title: '✓ Đã khôi phục dữ liệu mẫu gốc!',
      type: 'success',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-pop-in overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-subtle)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-xs shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-[var(--color-text-primary)] truncate">
                Quản Lý Dữ Liệu JSON
              </h2>
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
                Nhập, xuất hoặc xóa hàng loạt quán ăn
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 flex items-center justify-center transition-colors shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation Segmented Bar */}
        <div className="px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('import');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'import'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>Nhập JSON</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('export');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'export'
                  ? 'bg-[var(--color-primary)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Xuất JSON</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('bulk-delete');
              }}
              className={`py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'bulk-delete'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Xóa bớt</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: IMPORT JSON */}
          {activeTab === 'import' && (
            <div className="space-y-4 animate-pop-in">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-secondary)]">
                  <span>Chế độ nhập:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-[var(--color-primary)]"
                    />
                    <span>Gộp thêm vào ({restaurants.length} quán cũ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="accent-rose-500"
                    />
                    <span className="text-rose-600 font-bold">Ghi đè thay thế toàn bộ</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] hover:bg-[var(--color-border-subtle)] flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Dán mẫu JSON</span>
                  </button>

                  <label className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-border-subtle)] flex items-center gap-1 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Chọn file .json</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* JSON Textarea */}
              <div className="space-y-1.5">
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder={`Dán chuỗi JSON danh sách món ăn vào đây...\nVí dụ:\n[\n  {\n    "name": "Bánh Mì Huỳnh Hoa",\n    "address": "26 Lê Thị Riêng, Q1, TP.HCM",\n    "imageUrl": "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=800"\n  }\n]`}
                  rows={9}
                  className="w-full p-3.5 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] leading-relaxed"
                />

                {/* Validation status feedback */}
                {parseError && (
                  <p className="text-xs text-rose-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{parseError}</span>
                  </p>
                )}

                {parsedPreviewCount !== null && !parseError && (
                  <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Hợp lệ! Sẵn sàng thêm {parsedPreviewCount} món mới vào danh sách.</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setJsonInput('')}
                  className="btn-secondary px-4 py-2.5 text-xs font-bold rounded-xl"
                >
                  Xóa trắng
                </button>
                <button
                  type="button"
                  onClick={handleExecuteImport}
                  disabled={!jsonInput.trim() || !!parseError || parsedPreviewCount === 0}
                  className="btn-primary px-6 py-2.5 text-xs font-black rounded-xl shadow-md disabled:opacity-40"
                >
                  <span>Thực hiện nhập dữ liệu ({parsedPreviewCount || 0} món)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT JSON */}
          {activeTab === 'export' && (
            <div className="space-y-4 animate-pop-in">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Hiện có <strong>{restaurants.length}</strong> món ăn. Bạn có thể sao chép hoặc tải về file JSON để sao lưu hoặc chia sẻ cho người khác.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyJson}
                    className="btn-secondary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="btn-primary px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .json</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <pre className="w-full max-h-72 overflow-y-auto p-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-xs font-mono text-[var(--color-text-primary)] leading-relaxed select-all no-scrollbar">
                  {JSON.stringify(
                    restaurants.map(({ name, address, imageUrl }) => ({
                      name,
                      address,
                      imageUrl,
                    })),
                    null,
                    2
                  )}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: BULK DELETE & RESET */}
          {activeTab === 'bulk-delete' && (
            <div className="space-y-4 animate-pop-in">
              {/* Top controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)]">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={handleSelectAllDelete}
                    className="text-[var(--color-primary)] hover:underline"
                  >
                    Chọn tất cả ({restaurants.length})
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllDelete}
                    className="text-stone-400 hover:underline"
                  >
                    Bỏ chọn
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteBulkDelete}
                  disabled={selectedDeleteIds.length === 0}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa {selectedDeleteIds.length} quán đã chọn</span>
                </button>
              </div>

              {/* Selectable list for batch deletion */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                {restaurants.length > 0 ? (
                  restaurants.map((res) => {
                    const isSelected = selectedDeleteIds.includes(res.id);
                    return (
                      <div
                        key={res.id}
                        onClick={() => handleToggleSelectDelete(res.id)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-rose-50/80 border-rose-400 dark:bg-rose-950/40 dark:border-rose-800 shadow-xs'
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-500 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-stone-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
                              {res.name}
                            </p>
                            <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                              {res.address || 'Chưa có địa chỉ'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 text-xs">
                          {res.isFavorite && <span>❤️</span>}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              res.eaten
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                          >
                            {res.eaten ? 'Đã ăn' : 'Chưa ăn'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-center text-stone-400 py-6">
                    Danh sách quán ăn đang trống.
                  </p>
                )}
              </div>

              {/* Danger Zone / Reset options */}
              <div className="pt-3 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetSampleData}
                  className="px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-subtle)] text-xs font-bold text-[var(--color-text-primary)] flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                  <span>Khôi phục dữ liệu mẫu gốc</span>
                </button>

                {!confirmClearAll ? (
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-black hover:bg-rose-100 transition-colors"
                  >
                    Xóa trắng toàn bộ ({restaurants.length} quán)
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-rose-600 font-bold">Xác nhận xóa hết?</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black shadow-xs hover:bg-rose-700"
                    >
                      Đồng ý xóa sạch
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClearAll(false)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

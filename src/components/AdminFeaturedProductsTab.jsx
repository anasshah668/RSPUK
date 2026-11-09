import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { featuredSignageItems } from '../data/featuredSignageData';
import { featuredSignageMediaService } from '../services/featuredSignageMediaService';
import AdminImageThumb from './AdminImageThumb';
import { ImageHolderSkeleton } from './SmartImage';

const CATEGORIES = featuredSignageItems.map((item) => ({
  slug: item.categorySlug,
  label: item.title || item.heading,
  fallbackImages: item.images || [],
}));

const AdminFeaturedProductsTab = () => {
  const [selectedSlug, setSelectedSlug] = useState(CATEGORIES[0]?.slug || '');
  const [savedImages, setSavedImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [pendingPreviews, setPendingPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedCategory = useMemo(
    () => CATEGORIES.find((c) => c.slug === selectedSlug) || CATEGORIES[0],
    [selectedSlug],
  );

  const displayImages = savedImages.length > 0 ? savedImages : [];
  const usingFallback = savedImages.length === 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedSlug) return;
      try {
        setLoading(true);
        setPendingFiles([]);
        setPendingPreviews((prev) => {
          prev.forEach((url) => URL.revokeObjectURL(url));
          return [];
        });
        const data = await featuredSignageMediaService.getAdminBySlug(selectedSlug);
        if (!cancelled) {
          setSavedImages(Array.isArray(data?.images) ? data.images : []);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err?.message || 'Failed to load featured images');
          setSavedImages([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedSlug]);

  useEffect(
    () => () => {
      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    },
    [pendingPreviews],
  );

  const handlePickFiles = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const nextPreviews = files.map((file) => URL.createObjectURL(file));
    setPendingFiles((prev) => [...prev, ...files]);
    setPendingPreviews((prev) => [...prev, ...nextPreviews]);
    event.target.value = '';
  };

  const removePendingAt = (index) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPendingPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeSavedAt = async (index) => {
    const removed = savedImages[index];
    const next = savedImages.filter((_, i) => i !== index);
    setSavedImages(next);
    try {
      setSaving(true);
      if (next.length === 0) {
        await featuredSignageMediaService.clearAdmin(selectedSlug);
        toast.success('Picture removed. The site will use the default pictures until you add new ones.');
      } else {
        const updated = await featuredSignageMediaService.updateAdmin(
          selectedSlug,
          { existingImages: next },
          [],
        );
        setSavedImages(Array.isArray(updated?.images) ? updated.images : next);
        toast.success('Picture removed');
      }
    } catch (err) {
      setSavedImages((prev) => {
        const copy = [...prev];
        copy.splice(Math.min(index, copy.length), 0, removed);
        return copy;
      });
      toast.error(err?.message || 'Failed to remove picture');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedSlug) return;
    if (savedImages.length === 0 && pendingFiles.length === 0) {
      toast.error('Add at least one image, or reset to use the default public-folder pictures.');
      return;
    }
    try {
      setSaving(true);
      const updated = await featuredSignageMediaService.updateAdmin(
        selectedSlug,
        { existingImages: savedImages },
        pendingFiles,
      );
      setSavedImages(Array.isArray(updated?.images) ? updated.images : []);
      setPendingFiles([]);
      setPendingPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      toast.success('Featured product images saved');
    } catch (err) {
      toast.error(err?.message || 'Failed to save images');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!selectedSlug) return;
    const ok = window.confirm(
      `Clear admin images for “${selectedCategory?.label}”? The site will fall back to the default pictures in the public folder.`,
    );
    if (!ok) return;
    try {
      setSaving(true);
      await featuredSignageMediaService.clearAdmin(selectedSlug);
      setSavedImages([]);
      setPendingFiles([]);
      setPendingPreviews((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      toast.success('Reset to default public-folder images');
    } catch (err) {
      toast.error(err?.message || 'Failed to reset images');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl" data-tour="admin-featured-products">
      <div>
        <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Featured product pictures
        </h2>
        <p className="mt-1 text-sm text-gray-600" style={{ fontFamily: 'Lexend Deca, sans-serif' }}>
          Upload and manage gallery images for each featured signage category. When images are saved
          here, they replace the default pictures from the public folder on the website.
        </p>
      </div>

      <div className="max-w-md">
        <label className="mb-1 block text-xs font-semibold text-gray-700">Featured category</label>
        <select
          value={selectedSlug}
          onChange={(e) => setSelectedSlug(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 h-5 w-48 animate-pulse rounded bg-slate-200" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ImageHolderSkeleton key={`skeleton-${index}`} className="aspect-[4/3] w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-900">{selectedCategory?.label}</h3>
              <p className="text-xs text-gray-500">
                {usingFallback
                  ? 'No admin images yet — site is using default public-folder pictures.'
                  : `${savedImages.length} admin image${savedImages.length === 1 ? '' : 's'} active on the site.`}
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickFiles} />
              Add pictures
            </label>
          </div>

          {usingFallback && selectedCategory?.fallbackImages?.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">
                Current default pictures (public folder)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {selectedCategory.fallbackImages.map((src) => (
                  <div key={src} className="overflow-hidden rounded-lg border border-amber-100">
                    <AdminImageThumb src={src} className="aspect-[4/3] opacity-90" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {displayImages.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Saved admin pictures — click Remove on any photo to delete it
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {displayImages.map((img, index) => (
                  <div
                    key={`${img.url}-${index}`}
                    className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <AdminImageThumb src={img.url} className="aspect-[4/3]" />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => removeSavedAt(index)}
                      className="absolute right-2 top-2 z-20 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition hover:bg-red-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {pendingPreviews.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                New pictures to upload ({pendingPreviews.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {pendingPreviews.map((src, index) => (
                  <div
                    key={src}
                    className="relative aspect-[4/3] overflow-hidden rounded-lg border border-blue-200 bg-blue-50"
                  >
                    <AdminImageThumb src={src} alt="" className="h-full w-full" />
                    <button
                      type="button"
                      onClick={() => removePendingAt(index)}
                      className="absolute right-2 top-2 z-20 rounded-md bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md transition hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (savedImages.length === 0 && pendingFiles.length === 0)}
              className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save pictures'}
            </button>
            <button
              type="button"
              onClick={handleResetToDefaults}
              disabled={saving || (savedImages.length === 0 && pendingFiles.length === 0)}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeaturedProductsTab;

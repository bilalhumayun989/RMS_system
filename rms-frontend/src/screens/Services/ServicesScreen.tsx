import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useOrderStore } from '../../store/useOrderStore';
import { api } from '../../services/api';
import { MenuItem } from '../../types';
import { PageWrapper } from '../../components/layout/PageWrapper';
import {
  UtensilsCrossed, Plus, Pencil, Trash2, X, RefreshCw, Clock, Star, Tag, Upload,
} from 'lucide-react';

const PREDEFINED_CATEGORIES = ['Breakfast', 'Fastfood', 'Seafood', 'Desserts'] as const;

const inputBase =
  'w-full bg-[#F4F2F0] border border-[#1F221D]/12 rounded-xl px-4 py-3 text-sm text-[#1F221D] placeholder-[#555754]/50 focus:outline-none focus:border-[#FF7A10]/50 focus:bg-white transition-all duration-200';

interface MenuFormValues {
  name: string;
  categorySelect: string;
  categoryCustom: string;
  price: string;
  emoji: string;
  prepTime: string;
  description: string;
  discount: string;
  popular: boolean;
  image: string;
}

const defaultForm: MenuFormValues = {
  name: '', categorySelect: '', categoryCustom: '', price: '',
  emoji: '', prepTime: '', description: '', discount: '', popular: false, image: '',
};

const resolveCategory = (form: MenuFormValues): string => {
  if (form.categorySelect === 'custom') return form.categoryCustom.trim();
  return form.categorySelect;
};

interface MenuItemFormPanelProps {
  editItem: MenuItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const MenuItemFormPanel: React.FC<MenuItemFormPanelProps> = ({ editItem, onClose, onSaved }) => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [form, setForm] = useState<MenuFormValues>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editItem) {
      const isCustomCategory =
        editItem.category !== undefined &&
        !PREDEFINED_CATEGORIES.includes(editItem.category as (typeof PREDEFINED_CATEGORIES)[number]);
      setForm({
        name: editItem.name,
        categorySelect: isCustomCategory ? 'custom' : (editItem.category ?? ''),
        categoryCustom: isCustomCategory ? (editItem.category ?? '') : '',
        price: String(editItem.price),
        emoji: editItem.emoji ?? '',
        prepTime: editItem.prepTime ?? '',
        description: editItem.description ?? '',
        discount: editItem.discount !== undefined && editItem.discount !== null ? String(editItem.discount) : '',
        popular: editItem.popular,
        image: editItem.image ?? '',
      });
      setImagePreview(editItem.image ?? '');
    } else {
      setForm(defaultForm);
      setImagePreview('');
    }
  }, [editItem]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
      if (name === 'image') setImagePreview(value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { addNotification('Please select a valid image file.', 'warning'); return; }
    if (file.size > 10 * 1024 * 1024) { addNotification('Image must be under 10 MB.', 'warning'); return; }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX) { height = Math.round((height * MAX) / width); width = MAX; }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      const result = canvas.toDataURL('image/jpeg', 0.75);
      URL.revokeObjectURL(objectUrl);
      setForm((prev) => ({ ...prev, image: result }));
      setImagePreview(result);
    };
    img.src = objectUrl;
  };

  const clearImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
    setImagePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { addNotification('Item name is required.', 'warning'); return; }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum < 0) { addNotification('A valid price (≥ 0) is required.', 'warning'); return; }
    const category = resolveCategory(form);
    const discountNum = form.discount !== '' ? parseFloat(form.discount) : undefined;
    const payload = {
      name: form.name.trim(), category: category || 'Uncategorized', price: priceNum,
      emoji: form.emoji.trim() || undefined, prep_time: form.prepTime.trim() || undefined,
      popular: form.popular, description: form.description.trim() || undefined,
      image: form.image.trim() || undefined,
      discount: discountNum !== undefined && !isNaN(discountNum) ? discountNum : undefined,
    };
    setIsSubmitting(true);
    try {
      if (editItem) { await api.updateMenuItem(editItem.id, payload); addNotification(`"${payload.name}" updated successfully.`, 'success'); }
      else { await api.createMenuItem(payload); addNotification(`"${payload.name}" added to the menu.`, 'success'); }
      useOrderStore.getState().fetchMenuItems();
      onSaved(); onClose();
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Operation failed.', 'error');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
      <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {editItem ? <Pencil className="w-4 h-4 text-[#FF7A10]" /> : <Plus className="w-4 h-4 text-[#FF7A10]" />}
            <h2 className="text-sm font-semibold text-[#1F221D] uppercase tracking-wider">
              {editItem ? 'Edit Item' : 'New Menu Item'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#555754] hover:text-[#1F221D] hover:bg-[#ECEAE7] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Name <span className="text-[#C62828]">*</span></label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Grilled Salmon" className={inputBase} disabled={isSubmitting} maxLength={100} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Category</label>
            <select name="categorySelect" value={form.categorySelect} onChange={handleChange} disabled={isSubmitting} className={inputBase}>
              <option value="">— Select category —</option>
              {PREDEFINED_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              <option value="custom">Custom…</option>
            </select>
            {form.categorySelect === 'custom' && (
              <input type="text" name="categoryCustom" value={form.categoryCustom} onChange={handleChange} placeholder="Type a custom category" className={inputBase} disabled={isSubmitting} maxLength={50} />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Price <span className="text-[#C62828]">*</span></label>
            <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="0.00" min={0} step="0.01" className={inputBase} disabled={isSubmitting} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Emoji</label>
              <input type="text" name="emoji" value={form.emoji} onChange={handleChange} placeholder="🍔" maxLength={10} className={inputBase} disabled={isSubmitting} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Prep Time</label>
              <input type="text" name="prepTime" value={form.prepTime} onChange={handleChange} placeholder="10 min" maxLength={20} className={inputBase} disabled={isSubmitting} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short description…" rows={2} className={`${inputBase} resize-none`} disabled={isSubmitting} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Discount %</label>
            <input type="number" name="discount" value={form.discount} onChange={handleChange} placeholder="0" min={0} max={100} step={1} className={inputBase} disabled={isSubmitting} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#555754] uppercase tracking-wider">Item Image</label>
            {imagePreview ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-[#1F221D]/10 bg-[#ECEAE7]">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" onError={() => setImagePreview('')} />
                <button type="button" onClick={clearImage} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 border border-[#1F221D]/10 flex items-center justify-center text-[#1F221D] hover:bg-white transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-24 rounded-xl border-2 border-dashed border-[#1F221D]/12 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF7A10]/40 hover:bg-[rgba(255,122,16,0.04)] transition-all">
                <Upload className="w-5 h-5 text-[#555754]/50" />
                <p className="text-[11px] text-[#555754]/50">Click to upload image</p>
                <p className="text-[10px] text-[#555754]/30">PNG, JPG, WEBP · max 10 MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={isSubmitting} />
            <input type="url" name="image" value={form.image.startsWith('data:') ? '' : form.image} onChange={handleChange} placeholder="Or paste image URL…" className={inputBase} disabled={isSubmitting} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex-shrink-0">
              <input type="checkbox" name="popular" checked={form.popular} onChange={handleChange} disabled={isSubmitting} className="sr-only peer" />
              <div className="w-10 h-5 rounded-full bg-[#ECEAE7] border border-[#1F221D]/10 peer-checked:bg-[rgba(255,122,16,0.20)] peer-checked:border-[#FF7A10]/40 transition-all" />
              <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#555754]/50 peer-checked:bg-[#FF7A10] peer-checked:translate-x-5 transition-all" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#1F221D]/80">Popular Item</p>
              <p className="text-[10px] text-[#555754]/60">Show star badge on this item</p>
            </div>
          </label>
          <button type="submit" disabled={isSubmitting}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
            {isSubmitting ? (<><RefreshCw className="w-4 h-4 animate-spin" />Saving…</>) :
              editItem ? (<><Pencil className="w-4 h-4" />Save Changes</>) :
              (<><Plus className="w-4 h-4" />Add Item</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  isDeleting: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onEdit, onDelete, isDeleting }) => (
  <div className="bg-white border border-[#1F221D]/10 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:bg-[#F4F2F0]">
    <div className="w-full h-32 bg-[#ECEAE7] flex items-center justify-center overflow-hidden flex-shrink-0 border-b border-[#1F221D]/06">
      {item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <span className="text-4xl select-none">{item.emoji || '🍽️'}</span>
      )}
    </div>
    <div className="p-4 flex flex-col gap-3 flex-1">
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold text-[#1F221D] leading-tight truncate flex-1">{item.name}</p>
        {item.popular && (
          <span className="flex items-center gap-0.5 bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 text-[#FF7A10] text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wide">
            <Star className="w-2.5 h-2.5 fill-current" />Hot
          </span>
        )}
      </div>
      {item.category && (
        <span className="self-start bg-[#ECEAE7] text-[#555754] text-[10px] px-2 py-0.5 rounded-full border border-[#1F221D]/06">
          {item.category}
        </span>
      )}
      <div className="flex items-center gap-3">
        <span className="text-[#FF7A10] font-semibold text-base">PKR {item.price.toFixed(2)}</span>
        {item.discount !== undefined && item.discount > 0 && (
          <span className="flex items-center gap-1 bg-[#C62828]/10 border border-[#C62828]/20 text-[#C62828] text-[10px] font-semibold px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />-{item.discount}%
          </span>
        )}
      </div>
      {item.prepTime && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#555754]/70">
          <Clock className="w-3.5 h-3.5 flex-shrink-0" /><span>{item.prepTime}</span>
        </div>
      )}
      {item.description && <p className="text-xs text-[#555754]/60 line-clamp-2">{item.description}</p>}
      <div className="flex gap-2 mt-auto pt-1">
        <button onClick={() => onEdit(item)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#FF7A10] border border-[#FF7A10]/20 bg-[rgba(255,122,16,0.08)] hover:bg-[rgba(255,122,16,0.12)] hover:border-[#FF7A10]/40 active:scale-[0.98] transition-all duration-200">
          <Pencil className="w-3.5 h-3.5" />Edit
        </button>
        <button onClick={() => onDelete(item)} disabled={isDeleting}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[#C62828] border border-[#C62828]/20 bg-[#C62828]/10 hover:bg-[#C62828]/15 hover:border-[#C62828]/40 active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
          {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Delete
        </button>
      </div>
    </div>
  </div>
);

export const ServicesScreen: React.FC = () => {
  const addNotification = useAppStore((s) => s.addNotification);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try { const data = await api.getMenuItems(); setMenuItems(data); }
    catch (err) { addNotification(err instanceof Error ? err.message : 'Failed to load menu items.', 'error'); }
    finally { setIsLoading(false); }
  }, [addNotification]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const categories = ['All', ...Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean) as string[]))];
  const filteredItems = activeCategory === 'All' ? menuItems : menuItems.filter((i) => i.category === activeCategory);

  const openAdd = () => { setEditItem(null); setShowPanel(true); };
  const openEdit = (item: MenuItem) => { setEditItem(item); setShowPanel(true); };
  const closePanel = () => { setShowPanel(false); setEditItem(null); };
  const handleSaved = () => { loadItems(); };

  const handleDelete = async (item: MenuItem) => {
    setDeletingId(item.id);
    try {
      await api.deleteMenuItem(item.id);
      addNotification(`"${item.name}" removed from the menu.`, 'info');
      useOrderStore.getState().fetchMenuItems();
      setMenuItems((prev) => prev.filter((m) => m.id !== item.id));
    } catch (err) {
      addNotification(err instanceof Error ? err.message : 'Failed to delete item.', 'error');
    } finally { setDeletingId(null); }
  };

  return (
    <PageWrapper className="h-full overflow-y-auto p-6 pb-24 md:pb-6 scrollbar-none bg-[#F4F2F0]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(255,122,16,0.08)] border border-[#FF7A10]/20 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-[#FF7A10]" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#1F221D] tracking-tight">Menu Management</h1>
            <p className="text-xs text-[#555754] font-medium mt-0.5">{menuItems.length} item{menuItems.length !== 1 ? 's' : ''} on the menu</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => loadItems()} disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#555754] border border-[#1F221D]/10 bg-white hover:bg-[#ECEAE7] hover:text-[#1F221D] transition-all active:scale-95 cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#FF7A10] text-white hover:bg-[#E86000] active:scale-[0.98] transition-all duration-200">
            <Plus className="w-4 h-4" /><span>Add Item</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {showPanel && <MenuItemFormPanel editItem={editItem} onClose={closePanel} onSaved={handleSaved} />}
        <div className="flex-1 min-w-0">
          {menuItems.length > 0 && (
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${activeCategory === cat ? 'bg-[#FF7A10] text-white border-[#FF7A10]' : 'bg-white text-[#555754] border-[#1F221D]/10 hover:text-[#1F221D] hover:bg-[#ECEAE7]'}`}>
                  {cat}
                </button>
              ))}
            </div>
          )}
          {isLoading && menuItems.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center gap-3">
              <RefreshCw className="w-7 h-7 text-[#555754]/40 animate-spin" />
              <p className="text-sm font-semibold text-[#1F221D]/60">Loading menu items…</p>
            </div>
          )}
          {!isLoading && menuItems.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#ECEAE7] border border-[#1F221D]/10 flex items-center justify-center mb-1">
                <UtensilsCrossed className="w-7 h-7 text-[#555754]/40" />
              </div>
              <p className="text-sm font-semibold text-[#1F221D]/60">No menu items yet</p>
              <p className="text-xs text-[#555754]/50 max-w-xs">Click "Add Item" to start building your menu.</p>
            </div>
          )}
          {!isLoading && menuItems.length > 0 && filteredItems.length === 0 && (
            <div className="bg-white border border-[#1F221D]/10 rounded-2xl p-8 flex flex-col items-center gap-2 text-center">
              <p className="text-sm font-semibold text-[#1F221D]/60">No items in "{activeCategory}"</p>
              <p className="text-xs text-[#555754]/50">Try a different category or add a new item.</p>
            </div>
          )}
          {filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} isDeleting={deletingId === item.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ServicesScreen;

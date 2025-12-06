import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { PartnerLink, UserRole } from '../../types';
import { Modal } from '../../components/Modal';
import { useConfig } from '../../services/configService';
import { OptionManager } from '../../components/OptionManager';
import { linkApi } from '../../services/api';
import { Search, Plus, Edit2, Trash2, CheckCircle, XCircle, ExternalLink, Globe, Settings2, GripVertical } from 'lucide-react';

export const ManageLinks: React.FC = () => {
  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLink, setEditingLink] = useState<Partial<PartnerLink> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { linkCategories, updateLinkCategories } = useConfig();

  const loadLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await linkApi.list();
      setLinks(data);
    } catch (e: any) {
      setError(e?.message || '無法載入連結列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const filteredLinks = links.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (link: PartnerLink) => {
    setEditingLink({ ...link });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingLink({
      title: '',
      description: '',
      url: 'https://',
      category: linkCategories[0] || '',
      visibleTo: [UserRole.ADMIN, UserRole.STAFF],
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確認要刪除這個連結嗎？')) return;
    try {
      await linkApi.remove(id);
      setLinks(prev => prev.filter(l => l.id !== id));
    } catch (e: any) {
      alert(e?.message || '刪除失敗');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;
    setSaving(true);
    try {
      if (editingLink.id) {
        const updated = await linkApi.update(editingLink.id, editingLink);
        setLinks(prev => prev.map(l => l.id === updated.id ? updated : l));
      } else {
        const created = await linkApi.create(editingLink);
        setLinks(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  // Drag & Drop reordering
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const onDragStart = (id: string) => setDraggingId(id);
  const onDragOver = (e: React.DragEvent<HTMLTableRowElement>, id: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === id) return;
    setLinks(prev => {
      const currentIdx = prev.findIndex(l => l.id === draggingId);
      const targetIdx = prev.findIndex(l => l.id === id);
      if (currentIdx === -1 || targetIdx === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIdx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };
  const onDrop = async () => {
    if (!draggingId) return;
    setDraggingId(null);
    try {
      await linkApi.reorder(links.map(l => l.id));
    } catch (err) {
      // ignore
    }
  };

  const toggleRole = (role: UserRole) => {
    if (!editingLink) return;
    const currentRoles = editingLink.visibleTo || [];
    if (currentRoles.includes(role)) {
      setEditingLink({ ...editingLink, visibleTo: currentRoles.filter(r => r !== role) });
    } else {
      setEditingLink({ ...editingLink, visibleTo: [...currentRoles, role] });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">異業合作連結管理</h1>
          <p className="text-slate-400">設定外部系統入口與可見角色。</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 新增連結
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex flex-col gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋標題或分類.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          {error && <div className="text-sm text-red-400">{error}</div>}
        </div>

        {loading ? (
          <div className="p-6 text-slate-400">載入中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="bg-slate-900/80 text-xs uppercase font-medium text-slate-500">
                <tr>
                  <th className="px-4 py-4 w-10">拖曳</th>
                  <th className="px-6 py-4">標題 / 描述</th>
                  <th className="px-6 py-4">分類</th>
                  <th className="px-6 py-4">目標連結</th>
                  <th className="px-6 py-4">可見角色</th>
                  <th className="px-6 py-4">狀態</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLinks.map(link => (
                  <tr
                    key={link.id}
                    className="hover:bg-white/5 transition-colors"
                    draggable
                    onDragStart={() => onDragStart(link.id)}
                    onDragOver={(e) => onDragOver(e, link.id)}
                    onDrop={onDrop}
                  >
                    <td className="px-4 py-4 cursor-grab text-slate-500">
                      <GripVertical className="w-4 h-4" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{link.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{link.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-800 px-2 py-1 rounded border border-slate-700 text-slate-300">
                        {link.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:underline max-w-[150px] truncate">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {link.visibleTo.map(role => (
                          <span key={role} className={`text-[10px] px-1.5 py-0.5 rounded border ${
                            role === UserRole.ADMIN ? 'border-purple-500/30 text-purple-400' :
                            role === UserRole.STAFF ? 'border-blue-500/30 text-blue-400' :
                            'border-orange-500/30 text-orange-400'
                          }`}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {link.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> 啟用
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-3.5 h-3.5" /> 停用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(link)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLinks.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-slate-500">目前沒有資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLink?.id ? '編輯連結' : '新增連結'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">顯示標題</label>
            <input
              type="text"
              required
              value={editingLink?.title || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, title: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">目標 URL</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ExternalLink className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="url"
                required
                value={editingLink?.url || ''}
                onChange={e => setEditingLink(prev => ({ ...prev!, url: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center justify-between text-sm font-medium text-slate-400 mb-1">
                分類
                <button
                  type="button"
                  onClick={() => setIsManagingCategories(true)}
                  className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Settings2 className="w-3 h-3" /> 管理選項
                </button>
              </label>
              <select
                value={editingLink?.category || ''}
                onChange={e => setEditingLink(prev => ({ ...prev!, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              >
                {linkCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${editingLink?.isActive ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${editingLink?.isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={editingLink?.isActive || false}
                  onChange={e => setEditingLink(prev => ({ ...prev!, isActive: e.target.checked }))}
                />
                <span className="text-sm text-slate-300">啟用連結</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">簡短描述</label>
            <textarea
              rows={2}
              required
              value={editingLink?.description || ''}
              onChange={e => setEditingLink(prev => ({ ...prev!, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">可見角色 (多選)</label>
            <div className="flex gap-4">
              {[UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER].map(role => (
                <label key={role} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    editingLink?.visibleTo?.includes(role)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-600 bg-slate-950 group-hover:border-indigo-500'
                  }`}>
                    {editingLink?.visibleTo?.includes(role) && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={editingLink?.visibleTo?.includes(role)}
                    onChange={() => toggleRole(role)}
                  />
                  <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 disabled:opacity-60"
            >
              {saving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </form>
      </Modal>

      {isManagingCategories && (
        <Modal
          isOpen={isManagingCategories}
          onClose={() => setIsManagingCategories(false)}
          title="管理分類選項"
          size="md"
        >
          <OptionManager
            items={linkCategories}
            title="分類"
            onSave={(newItems) => {
              updateLinkCategories(newItems);
              setIsManagingCategories(false);
            }}
            onCancel={() => setIsManagingCategories(false)}
          />
        </Modal>
      )}
    </div>
  );
};

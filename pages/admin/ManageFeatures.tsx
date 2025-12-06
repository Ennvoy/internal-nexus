import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Feature } from '../../types';
import { Modal } from '../../components/Modal';
import { useConfig } from '../../services/configService';
import { OptionManager } from '../../components/OptionManager';
import { featureApi } from '../../services/api';
import { Search, Plus, Edit2, Trash2, CheckCircle, PlayCircle, FileText, Settings2 } from 'lucide-react';

export const ManageFeatures: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingFeature, setEditingFeature] = useState<Partial<Feature> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optionModalType, setOptionModalType] = useState<'CATEGORY' | 'AUDIENCE' | null>(null);
  const [tagInput, setTagInput] = useState('');

  const { featureCategories, featureAudiences, updateFeatureCategories, updateFeatureAudiences } = useConfig();

  const loadFeatures = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await featureApi.list();
      setFeatures(data);
    } catch (e: any) {
      setError(e?.message || '無法載入功能列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const filteredFeatures = features.filter(f =>
    f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (feature: Feature) => {
    setEditingFeature({ ...feature });
    setTagInput(feature.tags.join(', '));
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingFeature({
      title: '',
      description: '',
      category: featureCategories[0] || '',
      tags: [],
      targetAudience: [],
      status: 'TESTING',
      videoUrl: '',
      docContent: '',
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('確認要刪除這個功能嗎？')) return;
    try {
      await featureApi.remove(id);
      setFeatures(prev => prev.filter(f => f.id !== id));
    } catch (e: any) {
      alert(e?.message || '刪除失敗');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFeature) return;
    setSaving(true);

    const processedTags = tagInput.split(',').map(t => t.trim()).filter(t => t);
    const featureToSave = {
      ...editingFeature,
      tags: processedTags,
      updatedAt: new Date().toISOString().split('T')[0],
    } as Feature;

    try {
      if (editingFeature.id) {
        const updated = await featureApi.update(editingFeature.id, featureToSave);
        setFeatures(prev => prev.map(f => f.id === updated.id ? updated : f));
      } else {
        const created = await featureApi.create(featureToSave);
        setFeatures(prev => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const handleAudienceChange = (audience: string) => {
    if (!editingFeature) return;
    const currentList = editingFeature.targetAudience || [];
    if (currentList.includes(audience)) {
      setEditingFeature({ ...editingFeature, targetAudience: currentList.filter(a => a !== audience) });
    } else {
      setEditingFeature({ ...editingFeature, targetAudience: [...currentList, audience] });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !editingFeature) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditingFeature(prev => ({
        ...prev!,
        docFile: { name: file.name, dataUrl: reader.result as string, mime: file.type }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    if (!editingFeature) return;
    setEditingFeature(prev => ({ ...prev!, docFile: undefined }));
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">功能內容管理</h1>
          <p className="text-slate-400">新增或編輯系統功能卡、教學影片與說明文件。</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 新增功能
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex flex-col gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋功能名稱或分類.."
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
                  <th className="px-6 py-4">功能名稱</th>
                  <th className="px-6 py-4">分類 / 標籤</th>
                  <th className="px-6 py-4">適用對象</th>
                  <th className="px-6 py-4">狀態</th>
                  <th className="px-6 py-4">資源</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredFeatures.map(feature => (
                  <tr key={feature.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{feature.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{feature.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-indigo-400">{feature.category}</span>
                        <div className="flex gap-1 flex-wrap">
                          {feature.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {feature.targetAudience.map(aud => (
                          <span key={aud} className="text-xs text-slate-300">{aud}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        feature.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        feature.status === 'TESTING' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {feature.status === 'ONLINE' ? '正式上線' : feature.status === 'TESTING' ? '測試中' : '已下架'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 text-slate-500">
                        {feature.videoUrl && (
                          <span title="影片">
                            <PlayCircle className="w-4 h-4 text-indigo-400" />
                          </span>
                        )}
                        {feature.docContent && (
                          <span title="說明">
                            <FileText className="w-4 h-4 text-emerald-400" />
                          </span>
                        )}
                        {!feature.videoUrl && !feature.docContent && <span>-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(feature)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(feature.id)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredFeatures.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-6 text-center text-slate-500">目前沒有資料</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Feature Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFeature?.id ? '編輯功能' : '新增功能'}
        size="lg"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">功能名稱</label>
                <input
                  type="text"
                  required
                  value={editingFeature?.title || ''}
                  onChange={e => setEditingFeature(prev => ({ ...prev!, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-400 mb-1">
                  分類
                  <button
                    type="button"
                    onClick={() => setOptionModalType('CATEGORY')}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Settings2 className="w-3 h-3" /> 管理選項
                  </button>
                </label>
                <select
                  value={editingFeature?.category || ''}
                  onChange={e => setEditingFeature(prev => ({ ...prev!, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  {featureCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">狀態</label>
                <select
                  value={editingFeature?.status || 'TESTING'}
                  onChange={e => setEditingFeature(prev => ({ ...prev!, status: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ONLINE">正式上線</option>
                  <option value="TESTING">測試中</option>
                  <option value="OFFLINE">已下架</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">標籤 (以逗號分隔)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="範例: 報表, 自動化, 客服"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">簡短描述</label>
                <textarea
                  rows={3}
                  required
                  value={editingFeature?.description || ''}
                  onChange={e => setEditingFeature(prev => ({ ...prev!, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-medium text-slate-400 mb-2">
                  適用對象
                  <button
                    type="button"
                    onClick={() => setOptionModalType('AUDIENCE')}
                    className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <Settings2 className="w-3 h-3" /> 管理選項
                  </button>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-700 max-h-40 overflow-y-auto custom-scrollbar">
                  {featureAudiences.map(dept => (
                    <label key={dept} className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        editingFeature?.targetAudience?.includes(dept)
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-slate-600 bg-slate-950 group-hover:border-indigo-500'
                      }`}>
                        {editingFeature?.targetAudience?.includes(dept) && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={editingFeature?.targetAudience?.includes(dept) || false}
                        onChange={() => handleAudienceChange(dept)}
                      />
                      <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{dept}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4" /> 教學與文件
            </h4>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">展示影片 (URL)</label>
              <input
                type="url"
                value={editingFeature?.videoUrl || ''}
                onChange={e => setEditingFeature(prev => ({ ...prev!, videoUrl: e.target.value }))}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">說明內容 (Markdown / Text)</label>
              <textarea
                rows={6}
                value={editingFeature?.docContent || ''}
                onChange={e => setEditingFeature(prev => ({ ...prev!, docContent: e.target.value }))}
                placeholder="可貼上 Markdown 語法，例如: # 標題, - 列表"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">上傳說明檔案 (選填，例如 PDF / Markdown)</label>
              <div className="flex items-center gap-3">
                <input type="file" accept=".pdf,.md,.txt,.doc,.docx" onChange={handleFileChange} className="text-sm text-slate-300" />
                {editingFeature?.docFile && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300">{editingFeature.docFile.name}</span>
                    <button type="button" onClick={handleRemoveFile} className="text-xs px-2 py-1 bg-red-600/20 text-red-300 rounded">移除</button>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">檔案內容將存入資料庫。</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              {saving ? '儲存中...' : '儲存更新'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Option Manager Modal */}
      {optionModalType && (
        <Modal
          isOpen={!!optionModalType}
          onClose={() => setOptionModalType(null)}
          title={`管理${optionModalType === 'CATEGORY' ? '分類' : '適用對象'}選項`}
          size="md"
        >
          <OptionManager
            items={optionModalType === 'CATEGORY' ? featureCategories : featureAudiences}
            title={optionModalType === 'CATEGORY' ? '分類' : '對象'}
            onSave={(newItems) => {
              if (optionModalType === 'CATEGORY') updateFeatureCategories(newItems);
              else updateFeatureAudiences(newItems);
              setOptionModalType(null);
            }}
            onCancel={() => setOptionModalType(null)}
          />
        </Modal>
      )}
    </div>
  );
};

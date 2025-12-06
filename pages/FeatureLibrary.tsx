import React, { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { Feature } from '../types';
import { featureApi } from '../services/api';
import { Search, Filter, PlayCircle, BookOpen, Tag, Download } from 'lucide-react';

export const FeatureLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const categories = ['ALL', ...Array.from(new Set(features.map(f => f.category)))];

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchTerm.toLowerCase()) || f.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getEmbedUrl = (url: string) => {
    if (!url) return url;
    try {
      if (url.includes('youtube.com/watch')) return url.replace('watch?v=', 'embed/');
      if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'www.youtube.com/embed/');
      return url;
    } catch (e) {
      return url;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">功能展示區</h1>
        <p className="text-slate-400">快速瀏覽可用功能與教學資源。</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="搜尋功能名稱或描述.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Filter className="w-5 h-5 text-slate-500 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat === 'ALL' ? '全部' : cat}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-sm text-red-400 mb-4">{error}</div>}
      {loading && <div className="text-slate-400">載入中...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredFeatures.map(feature => (
            <Card key={feature.id} className="flex flex-col h-full hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-slate-700/50">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                    feature.status === 'ONLINE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {feature.status === 'ONLINE' ? '正式上線' : '測試中'}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded border border-white/5">
                    {feature.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3">{feature.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {feature.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-xs text-slate-500">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 pt-0 mt-auto flex gap-3">
                <button
                  onClick={() => setSelectedFeature(feature)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors shadow-lg shadow-indigo-900/20"
                >
                  <BookOpen className="w-4 h-4" />
                  查看詳情
                </button>
              </div>
            </Card>
          ))}

          {filteredFeatures.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500">
              沒有符合條件的功能。
            </div>
          )}
        </div>
      )}

      {selectedFeature && (
        <Modal
          isOpen={!!selectedFeature}
          onClose={() => setSelectedFeature(null)}
          title={selectedFeature.title}
          size="xl"
        >
          <div className="space-y-8">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2">使用說明</h4>
              <p className="text-slate-300">{selectedFeature.description}</p>
              <div className="mt-4 flex gap-4 text-sm text-slate-500">
                <span>適用對象: {selectedFeature.targetAudience.join(', ')}</span>
                <span>最近更新: {selectedFeature.updatedAt}</span>
              </div>
            </div>

            {selectedFeature.videoUrl && (
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <PlayCircle className="text-indigo-400" /> 影片展示
                </h4>
                <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-700">
                  <iframe
                    src={getEmbedUrl(selectedFeature.videoUrl)}
                    title={`${selectedFeature.title} 影片`}
                    className="w-full h-full"
                    frameBorder={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div>
              <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                <BookOpen className="text-emerald-400" /> 使用說明文件
              </h4>
              <div className="prose prose-invert prose-slate max-w-none bg-slate-900/50 p-6 rounded-xl border border-white/5">
                <pre className="whitespace-pre-wrap font-sans text-slate-300">
                  {selectedFeature.docContent || '尚無說明內容'}
                </pre>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              {selectedFeature.docFile && (
                <a
                  href={selectedFeature.docFile.dataUrl}
                  download={selectedFeature.docFile.name}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 flex items-center gap-2"
                >
                  下載檔案 <Download className="w-4 h-4" />
                </a>
              )}
              <button
                onClick={() => setSelectedFeature(null)}
                className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                關閉
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

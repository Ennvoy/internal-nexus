import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { ArrowRight, Star, ExternalLink, Activity, Info, Edit2 } from 'lucide-react';
import { UserRole } from '../types';
import { featureApi, linkApi } from '../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [features, setFeatures] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboardInfo, setDashboardInfo] = useState(() => {
    try {
      const raw = localStorage.getItem('app_dashboard_info');
      if (raw) return JSON.parse(raw);
    } catch (err) { /* ignore */ }
    return {
      systemStatus: '正常',
      noticeTitle: '系統維護通知',
      noticeBody: '預計於本週末 02:00 - 04:00 進行例行維護，期間將無法使用部分功能。',
      supportEmail: 'it_support@company.com',
      supportPhone: '分機 #1234',
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingInfo, setEditingInfo] = useState(dashboardInfo);

  useEffect(() => {
    try {
      localStorage.setItem('app_dashboard_info', JSON.stringify(dashboardInfo));
    } catch (err) { /* ignore */ }
  }, [dashboardInfo]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [feat, lnks] = await Promise.all([featureApi.list(), linkApi.list()]);
      setFeatures(feat);
      setLinks(lnks);
    } catch (e: any) {
      setError(e?.message || '無法載入資料');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = [
    { label: '可用工具', value: features.length, icon: Star, color: 'text-yellow-400' },
    { label: '異業入口', value: links.length, icon: ExternalLink, color: 'text-emerald-400' },
    { label: '系統狀態', value: dashboardInfo.systemStatus || '正常', icon: Activity, color: 'text-indigo-400' },
  ];

  const recentFeatures = features.slice(0, 2);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">歡迎，{user?.name}</h1>
          <p className="text-slate-400">Nexus 內部工具入口。</p>
        </div>
        <div className="flex gap-3">
          <Link to="/features" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm font-medium">
            查看功能
          </Link>
          <Link to="/links" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-colors text-sm font-medium">
            進入連結
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color} border border-white/5`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {error && <div className="text-sm text-red-400">{error}</div>}
      {loading && <div className="text-slate-400">載入中...</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">最新功能</h2>
            <Link to="/features" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              查看全部 <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {recentFeatures.map(feature => (
              <Card key={feature.id} hoverEffect className="p-0 group">
                <div className="p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-slate-900 rounded-lg flex items-center justify-center border border-white/5 shrink-0 group-hover:border-indigo-500/30 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                      <Star className="w-6 h-6 text-indigo-500" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          feature.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {feature.status === 'ONLINE' ? '正式上線' : '測試中'}
                        </span>
                        <span className="text-xs text-slate-500">{feature.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{feature.description}</p>
                    </div>
                    <div className="mt-4 md:mt-0 pt-2 flex items-center gap-2 text-xs text-slate-500">
                      <span>適用對象: {feature.targetAudience.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {recentFeatures.length === 0 && !loading && (
              <div className="p-6 text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
                尚無功能資料。
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">系統公告 & 聯絡</h2>
            {user?.role === UserRole.ADMIN && (
              <button
                onClick={() => { setEditingInfo(dashboardInfo); setIsEditing(true); }}
                className="text-slate-400 hover:text-white p-1 rounded-md"
                title="編輯"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-white text-sm">{dashboardInfo.noticeTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">{dashboardInfo.noticeBody}</p>
              </div>
            </div>

            <div className="h-px bg-white/5 my-2" />

            <div>
              <h4 className="font-medium text-white text-sm mb-3">聯絡資訊</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500">支援信箱</span>
                  <a href={`mailto:${dashboardInfo.supportEmail}`} className="text-indigo-400 hover:underline">{dashboardInfo.supportEmail}</a>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">聯絡電話/分機</span>
                  <span className="text-slate-300">{dashboardInfo.supportPhone}</span>
                </li>
              </ul>
            </div>
          </Card>

          <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="編輯系統公告">
            <form onSubmit={(e) => { e.preventDefault(); setDashboardInfo(editingInfo); setIsEditing(false); }} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">系統狀態(例如：正常/維護中)</label>
                <input className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white" value={editingInfo.systemStatus} onChange={(e) => setEditingInfo(prev => ({ ...prev, systemStatus: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">公告標題</label>
                <input className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white" value={editingInfo.noticeTitle} onChange={(e) => setEditingInfo(prev => ({ ...prev, noticeTitle: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">公告內容</label>
                <textarea rows={3} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white" value={editingInfo.noticeBody} onChange={(e) => setEditingInfo(prev => ({ ...prev, noticeBody: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">聯絡 Email</label>
                  <input className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white" value={editingInfo.supportEmail} onChange={(e) => setEditingInfo(prev => ({ ...prev, supportEmail: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">聯絡 電話/分機</label>
                  <input className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-white" value={editingInfo.supportPhone} onChange={(e) => setEditingInfo(prev => ({ ...prev, supportPhone: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">取消</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">儲存</button>
              </div>
            </form>
          </Modal>
        </div>
      </div>
    </div>
  );
};

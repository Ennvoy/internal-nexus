import React, { useMemo, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { useAuth } from '../services/authService';
import { UserRole, PartnerLink } from '../types';
import { ExternalLink, Shield } from 'lucide-react';
import { linkApi } from '../services/api';

export const PartnerLinks: React.FC = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<PartnerLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await linkApi.list();
      setLinks(data);
    } catch (e: any) {
      setError(e?.message || '無法載入連結');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLinks();
  }, []);

  const visibleLinks = useMemo(() => {
    return links.filter(link => {
      if (!link.isActive) return false;
      if (!user) return false;
      return link.visibleTo.includes(user.role);
    });
  }, [links, user]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">異業合作連結</h1>
        <p className="text-slate-400">快速進入合作系統與表單入口。</p>
      </div>

      {error && <div className="text-sm text-red-400 mb-4">{error}</div>}
      {loading && <div className="text-slate-400">載入中...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleLinks.map(link => (
            <Card key={link.id} hoverEffect className="group">
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">
                    {link.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                  {link.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6 flex-1">
                  {link.description}
                </p>

                <div className="mt-auto">
                  {user?.role === UserRole.ADMIN && (
                    <div className="mb-3 flex gap-1">
                      <Shield className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-600">可見角色: {link.visibleTo.join(', ')}</span>
                    </div>
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-lg bg-slate-700/50 hover:bg-indigo-600 text-slate-200 hover:text-white font-medium transition-all duration-300"
                  >
                    前往
                  </a>
                </div>
              </div>
            </Card>
          ))}

          {visibleLinks.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 border border-dashed border-slate-700 rounded-xl bg-slate-900/30">
              目前沒有符合您權限的連結。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

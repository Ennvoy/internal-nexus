import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { User, UserRole } from '../../types';
import { Modal } from '../../components/Modal';
import { Search, Plus, Edit2, UserX, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../services/authService';
import { userApi } from '../../services/api';
import { Key } from 'lucide-react';

export const ManageUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser, logout } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.list();
      setUsers(data);
    } catch (e: any) {
      setError(e?.message || '無法載入使用者列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingUser({
      name: '',
      email: '',
      role: UserRole.STAFF,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      if (editingUser.id) {
        const updated = await userApi.update(editingUser.id, editingUser);
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      } else {
        const newUser = await userApi.create({
          ...editingUser,
          password: '123456',
          createdAt: new Date().toISOString(),
        });
        setUsers(prev => [...prev, newUser]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err?.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id: string) => {
    const target = users.find(u => u.id === id);
    if (!target) return;
    try {
      const updated = await userApi.update(id, { ...target, isActive: !target.isActive });
      setUsers(prev => prev.map(u => u.id === id ? updated : u));
    } catch (e: any) {
      alert(e?.message || '更新失敗');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('確認要將密碼重設為 123456 嗎？')) return;
    try {
      await userApi.resetPassword(userId);
      alert('已重設密碼為 123456');
    } catch (e: any) {
      alert(e?.message || '重設失敗');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('確認要刪除這個使用者嗎？此動作無法復原')) return;
    try {
      await userApi.remove(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      if (currentUser && currentUser.id === userId) {
        logout();
        alert('已刪除目前登入帳號，系統將登出');
      }
    } catch (e: any) {
      alert(e?.message || '刪除失敗');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">使用者管理</h1>
          <p className="text-slate-400">維護系統帳號、角色與啟用狀態。</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 新增使用者
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-slate-900/50 flex flex-col gap-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜尋姓名或 Email..."
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
                  <th className="px-6 py-4">使用者</th>
                  <th className="px-6 py-4">角色</th>
                  <th className="px-6 py-4">狀態</th>
                  <th className="px-6 py-4">建立日期</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700" />
                        <div>
                          <div className="font-medium text-white">{user.name}</div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        user.role === UserRole.ADMIN ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        user.role === UserRole.STAFF ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" /> 啟用中
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <XCircle className="w-3.5 h-3.5" /> 已停用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">{user.createdAt}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          title="編輯"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                          title="重設密碼"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          className={`p-1.5 hover:bg-slate-700 rounded ${user.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                          title={user.isActive ? '停用' : '啟用'}
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1.5 hover:bg-slate-700 rounded text-red-400 hover:text-red-300"
                          title="刪除使用者"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-6 text-center text-slate-500">目前沒有資料</td>
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
        title={editingUser?.id ? '編輯使用者' : '新增使用者'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">姓名</label>
            <input
              type="text"
              required
              value={editingUser?.name || ''}
              onChange={e => setEditingUser(prev => ({ ...prev!, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email / 帳號</label>
            <input
              type="email"
              required
              value={editingUser?.email || ''}
              onChange={e => setEditingUser(prev => ({ ...prev!, email: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">角色</label>
            <select
              value={editingUser?.role || UserRole.STAFF}
              onChange={e => setEditingUser(prev => ({ ...prev!, role: e.target.value as UserRole }))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value={UserRole.ADMIN}>ADMIN (系統管理員)</option>
              <option value={UserRole.STAFF}>STAFF (內部同仁)</option>
              <option value={UserRole.PARTNER}>PARTNER (外部合作夥伴)</option>
            </select>
          </div>

          {!editingUser?.id && (
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">預設密碼</label>
              <input
                type="password"
                disabled
                value="123456"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-500 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">新增時預設密碼為 123456</p>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={editingUser?.isActive ?? true}
              onChange={e => setEditingUser(prev => ({ ...prev!, isActive: e.target.checked }))}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="text-sm text-slate-300">帳號啟用</label>
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
    </div>
  );
};

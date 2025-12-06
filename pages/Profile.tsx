import React, { useState } from 'react';
import { useAuth } from '../services/authService';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (newPass.length < 4) {
      setMessage('新密碼至少 4 個字元');
      return;
    }
    if (newPass !== confirmPass) {
      setMessage('密碼與確認密碼不相符');
      return;
    }

    try {
      const raw = localStorage.getItem('app_passwords') || '{}';
      const pwMap = JSON.parse(raw);
      // Optional: check current password if exists
      const expected = pwMap[user.id] ?? '123456';
      if (current !== expected) {
        setMessage('舊密碼錯誤');
        return;
      }
      pwMap[user.id] = newPass;
      localStorage.setItem('app_passwords', JSON.stringify(pwMap));
      setMessage('密碼更新成功');
      setCurrent('');
      setNewPass('');
      setConfirmPass('');
    } catch (e) {
      setMessage('發生錯誤，無法更新密碼');
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">個人資料 / 修改密碼</h2>
      <form onSubmit={handleChange} className="space-y-4 bg-slate-900/50 p-6 rounded-lg border border-white/5">
        <div>
          <label className="block text-sm text-slate-400 mb-1">顯示名稱</label>
          <div className="text-white font-medium">{user.name}</div>
          <div className="text-xs text-slate-500">{user.email}</div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">目前密碼</label>
          <input type="password" value={current} onChange={e => setCurrent(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">新密碼</label>
          <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1">確認新密碼</label>
          <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
        </div>

        {message && (
          <div className="text-sm text-slate-300 bg-white/5 p-2 rounded">{message}</div>
        )}

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 bg-indigo-600 rounded text-white">更新密碼</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

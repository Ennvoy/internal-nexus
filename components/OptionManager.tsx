import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

interface OptionManagerProps {
  items: string[];
  onSave: (items: string[]) => void;
  onCancel: () => void;
  title: string;
}

export const OptionManager: React.FC<OptionManagerProps> = ({ items, onSave, onCancel, title }) => {
  const [list, setList] = useState<string[]>([]);
  const [newItem, setNewItem] = useState('');

  // Initialize local state
  useEffect(() => {
    setList([...items]);
  }, [items]);

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (trimmed && !list.includes(trimmed)) {
      setList([...list, trimmed]);
      setNewItem('');
    }
  };

  const handleDelete = (item: string) => {
    setList(list.filter(i => i !== item));
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const copy = [...list];
    const tmp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = tmp;
    setList(copy);
  };

  const moveDown = (index: number) => {
    if (index >= list.length - 1) return;
    const copy = [...list];
    const tmp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = tmp;
    setList(copy);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
        <label className="block text-sm font-medium text-slate-400 mb-2">新增{title}</label>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={newItem}
            onChange={e => setNewItem(e.target.value)}
            placeholder={`輸入新的${title}...`}
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          />
          <button 
            type="button"
            onClick={handleAdd}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">現有列表 ({list.length})</label>
        <div className="bg-slate-950 rounded-xl border border-slate-700 max-h-60 overflow-y-auto custom-scrollbar">
          {list.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">暫無選項</div>
          ) : (
            <div className="divide-y divide-white/5">
              {list.map((item, idx) => (
                <div key={item} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group">
                   <span className="text-slate-200 text-sm">{item}</span>
                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={() => moveUp(idx)}
                       disabled={idx === 0}
                       className="p-1 rounded hover:bg-white/5 text-slate-400 disabled:opacity-30"
                       title="上移"
                     >
                       <ChevronUp className="w-4 h-4" />
                     </button>
                     <button
                       type="button"
                       onClick={() => moveDown(idx)}
                       disabled={idx === list.length - 1}
                       className="p-1 rounded hover:bg-white/5 text-slate-400 disabled:opacity-30"
                       title="下移"
                     >
                       <ChevronDown className="w-4 h-4" />
                     </button>
                     <button 
                       type="button"
                       onClick={() => handleDelete(item)}
                       className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-white/5 opacity-50 group-hover:opacity-100 transition-all"
                       title="刪除"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button 
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
        >
          取消
        </button>
        <button 
          type="button"
          onClick={() => onSave(list)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg shadow-indigo-600/20 transition-colors"
        >
          儲存變更
        </button>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Task, User, StatusOption } from '../types';
import { CheckCircle2, Circle, Clock, Plus, Trash2, Edit2, Search } from 'lucide-react';

interface FunctionalityViewProps {
  features: Task[]; // Reusing Task type
  users: User[];
  statuses: StatusOption[];
  onUpdateFeature: (id: string, updates: Partial<Task>) => void;
  onDeleteFeature: (id: string) => void;
  onOpenFeature: (feature: Task) => void;
  onCreateFeature: () => void;
}

const FunctionalityView: React.FC<FunctionalityViewProps> = ({ 
    features, 
    users, 
    statuses,
    onUpdateFeature, 
    onDeleteFeature, 
    onOpenFeature,
    onCreateFeature
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeatures = features.filter(f => f.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Calculate Progress
  const total = features.length;
  // Assuming 'Done', 'Выполнено', 'Completed' etc are final statuses. 
  // Better to check if status color includes 'green'.
  const completed = features.filter(f => {
      const s = statuses.find(st => st.name === f.status);
      return s?.color.includes('green');
  }).length;
  
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getStatusBadge = (statusName: string) => {
      const s = statuses.find(st => st.name === statusName);
      const color = s?.color || 'bg-gray-100 text-gray-600';
      
      return (
          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border border-transparent ${color}`}>
              {statusName}
          </span>
      );
  };

  return (
    <div className="pt-6 px-6 pb-20 h-full flex flex-col">
        {/* Header Stats */}
        <div className="mb-8 bg-white dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Карта функционала</h1>
                <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{progress}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Готовность системы</div>
                </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-[#333] rounded-full h-3 overflow-hidden">
                <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <span>0%</span>
                <span>{completed} из {total} функций готово</span>
                <span>100%</span>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-4">
            <div className="relative max-w-xs w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input 
                    type="text" 
                    placeholder="Найти функцию..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
                />
            </div>
            <button 
                onClick={onCreateFeature}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm"
            >
                <Plus size={18} /> Добавить функцию
            </button>
        </div>

        {/* Features List */}
        <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#202020] border-b border-gray-200 dark:border-[#333]">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 w-1/2">Функциональный блок / Задача</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 w-48">Статус</th>
                        <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Ответственный</th>
                        <th className="px-6 py-4 w-20"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                    {filteredFeatures.map(feature => {
                        const assignee = users.find(u => u.id === feature.assigneeId);
                        
                        return (
                            <tr key={feature.id} className="hover:bg-gray-50 dark:hover:bg-[#303030] group transition-colors">
                                <td className="px-6 py-4">
                                    <div 
                                        onClick={() => onOpenFeature(feature)}
                                        className="font-medium text-gray-800 dark:text-gray-200 text-base cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        {feature.title}
                                    </div>
                                    {feature.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{feature.description}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={feature.status}
                                        onChange={(e) => onUpdateFeature(feature.id, { status: e.target.value })}
                                        className="bg-transparent border-none text-sm font-medium cursor-pointer focus:ring-0 p-0 outline-none w-full"
                                    >
                                        {statuses.map(s => (
                                            <option key={s.id} value={s.name} className="dark:bg-[#333]">{s.name}</option>
                                        ))}
                                    </select>
                                    <div className="mt-1">{getStatusBadge(feature.status)}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {assignee ? (
                                            <>
                                                <img src={assignee.avatar} className="w-6 h-6 rounded-full" alt=""/>
                                                <span className="text-gray-700 dark:text-gray-300">{assignee.name}</span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 italic">Не назначено</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onOpenFeature(feature)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"><Edit2 size={16}/></button>
                                        <button onClick={() => onDeleteFeature(feature.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredFeatures.length === 0 && (
                        <tr>
                            <td colSpan={4} className="text-center py-12 text-gray-400 dark:text-gray-500">
                                Список функционала пуст. Добавьте первую функцию!
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default FunctionalityView;

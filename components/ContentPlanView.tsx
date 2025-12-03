
import React, { useState, useEffect } from 'react';
import { ContentPost, Task, TableCollection } from '../types';
import { Calendar, Plus, X, FileText as FileTextIcon, Send, Youtube, Video, Image, FileText, Clock, List, LayoutGrid, KanbanSquare, Linkedin, Check, CheckSquare, ChevronLeft, ChevronRight, Trash2, Edit2, Instagram } from 'lucide-react';
import { DynamicIcon } from './AppIcons';

interface ContentPlanViewProps {
  posts: ContentPost[];
  tableId: string;
  tasks?: Task[];
  activeTable?: TableCollection;
  onSavePost: (post: ContentPost) => void;
  onDeletePost: (id: string) => void;
  onOpenTask?: (task: Task) => void;
  onCreateTask?: (task: Partial<Task>) => void;
}

const ContentPlanView: React.FC<ContentPlanViewProps> = ({ 
    posts, tableId, tasks = [], 
    activeTable,
    onSavePost, onDeletePost, 
    onOpenTask, onCreateTask 
}) => {
  // Получаем цвет для кнопки из цвета таблицы
  const getButtonColor = () => {
    if (!activeTable?.color) return 'bg-blue-600 hover:bg-blue-700';
    // Извлекаем основной цвет из класса
    const bgMatch = activeTable.color.match(/bg-(\w+)-(\d+)/);
    if (bgMatch) {
      const colorName = bgMatch[1];
      return `bg-${colorName}-600 hover:bg-${colorName}-700`;
    }
    // Fallback
    if (activeTable.color.includes('blue')) return 'bg-blue-600 hover:bg-blue-700';
    if (activeTable.color.includes('green') || activeTable.color.includes('emerald')) return 'bg-emerald-600 hover:bg-emerald-700';
    if (activeTable.color.includes('red') || activeTable.color.includes('rose')) return 'bg-rose-600 hover:bg-rose-700';
    if (activeTable.color.includes('yellow') || activeTable.color.includes('amber')) return 'bg-amber-600 hover:bg-amber-700';
    if (activeTable.color.includes('purple') || activeTable.color.includes('violet')) return 'bg-violet-600 hover:bg-violet-700';
    if (activeTable.color.includes('pink')) return 'bg-pink-600 hover:bg-pink-700';
    if (activeTable.color.includes('orange')) return 'bg-orange-600 hover:bg-orange-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  // Получаем цвет для иконки из цвета таблицы
  const getIconBgColor = () => {
    if (!activeTable?.color) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    // Если цвет уже содержит bg- и text-, используем его
    if (activeTable.color.includes('bg-') && activeTable.color.includes('text-')) {
      return activeTable.color;
    }
    // Иначе извлекаем цвет
    const bgMatch = activeTable.color.match(/bg-(\w+)-(\d+)/);
    if (bgMatch) {
      const colorName = bgMatch[1];
      return `bg-${colorName}-100 dark:bg-${colorName}-900/30 text-${colorName}-600 dark:text-${colorName}-400`;
    }
    return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
  };
  const [viewMode, setViewMode] = useState<'calendar' | 'table' | 'kanban' | 'gantt'>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<ContentPost | null>(null);
  
  // Calendar Navigation State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Form State
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [platform, setPlatform] = useState<string[]>(['instagram']);
  const [format, setFormat] = useState<ContentPost['format']>('post');
  const [status, setStatus] = useState<ContentPost['status']>('idea');
  const [copy, setCopy] = useState('');

  // Initialize date for form
  useEffect(() => {
      if (!date) setDate(new Date().toISOString().split('T')[0]);
  }, []);

  // DnD State
  const [draggedPostId, setDraggedPostId] = useState<string | null>(null);

  // Filter posts strictly by current table ID
  const filteredPosts = posts.filter(p => p.tableId === tableId).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleOpenCreate = () => {
      setEditingPost(null);
      setTopic('');
      setDate(new Date().toISOString().split('T')[0]);
      setPlatform(['instagram']);
      setFormat('post');
      setStatus('idea');
      setCopy('');
      setIsModalOpen(true);
  };

  const handleOpenEdit = (post: ContentPost) => {
      setEditingPost(post);
      setTopic(post.topic);
      setDate(post.date);
      setPlatform(Array.isArray(post.platform) ? post.platform : [post.platform as any]);
      setFormat(post.format);
      setStatus(post.status);
      setCopy(post.copy || '');
      setIsModalOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (platform.length === 0) return alert("Выберите хотя бы одну площадку");
      if (!date) return alert("Выберите дату");
      
      const newPost: ContentPost = {
          id: editingPost ? editingPost.id : `cp-${Date.now()}`,
          tableId,
          topic,
          date,
          platform,
          format,
          status,
          copy
      };
      onSavePost(newPost);
      setIsModalOpen(false);
  };

  const handleDelete = () => {
      if (editingPost) {
          onDeletePost(editingPost.id);
          setIsModalOpen(false);
      }
  };

  const handleCreateLinkedTask = () => {
      if (onCreateTask && editingPost) {
          onCreateTask({
              title: `Контент: ${editingPost.topic}`,
              contentPostId: editingPost.id
          });
      }
  };

  const togglePlatform = (p: string) => {
      if (platform.includes(p)) {
          setPlatform(platform.filter(item => item !== p));
      } else {
          setPlatform([...platform, p]);
      }
  };

  // DnD Handlers
  const onDragStart = (e: React.DragEvent, postId: string) => { setDraggedPostId(postId); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent, targetValue: string, type: 'date' | 'status') => { 
      e.preventDefault(); 
      if (draggedPostId) { 
          const post = posts.find(p => p.id === draggedPostId); 
          if (post) { 
              if (type === 'date' && post.date !== targetValue) onSavePost({ ...post, date: targetValue }); 
              else if (type === 'status' && post.status !== targetValue) onSavePost({ ...post, status: targetValue as any }); 
          } 
          setDraggedPostId(null); 
      } 
  };
  
  const getPlatformIcon = (p: string) => {
      switch (p) {
          case 'instagram': return <Instagram size={14} className="text-pink-600 dark:text-pink-400"/>;
          case 'telegram': return <Send size={14} className="text-blue-500 dark:text-blue-400"/>;
          case 'youtube': return <Youtube size={14} className="text-red-600 dark:text-red-400"/>;
          case 'vk': return <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">VK</span>;
          case 'linkedin': return <Linkedin size={14} className="text-blue-700 dark:text-blue-400"/>;
          default: return <Send size={14}/>;
      }
  };
  
  const renderPlatformIcons = (platforms: string | string[]) => { 
      const arr = Array.isArray(platforms) ? platforms : [platforms]; 
      return (<div className="flex -space-x-1">{arr.map(p => (<div key={p} className="bg-white dark:bg-[#303030] rounded-full p-0.5 border border-gray-100 dark:border-gray-600">{getPlatformIcon(p)}</div>))}</div>); 
  };
  
  const getFormatLabel = (f: string) => { switch (f) { case 'reel': return 'Reels'; case 'post': return 'Пост'; case 'story': return 'Stories'; default: return f; } };
  const getStatusColor = (s: string) => { switch (s) { case 'idea': return 'border-gray-200 bg-gray-50 dark:bg-[#2a2a2a] dark:border-[#444]'; case 'published': return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'; default: return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'; } };
  const getStatusLabel = (s: string) => { switch (s) { case 'idea': return 'Идея'; case 'copywriting': return 'Копирайтинг'; case 'design': return 'Дизайн'; case 'approval': return 'Согласование'; case 'scheduled': return 'План'; case 'published': return 'Готово'; default: return s; } };

  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if (window.confirm("Сохранить изменения перед закрытием?")) { handleSubmit(); } else { setIsModalOpen(false); }
      }
  };

  const changeMonth = (delta: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(newDate.getMonth() + delta);
      setCurrentDate(newDate);
  };

  // --- GANTT RENDERER ---
  const renderGantt = () => {
      const timestamps = filteredPosts.map(p => new Date(p.date).getTime()).filter(t => !isNaN(t));
      let minTime = timestamps.length ? Math.min(...timestamps) : new Date().getTime();
      let maxTime = timestamps.length ? Math.max(...timestamps) : new Date().getTime();
      
      // Add buffer
      minTime -= 7 * 24 * 60 * 60 * 1000;
      maxTime += 14 * 24 * 60 * 60 * 1000;
      
      const startDate = new Date(minTime);
      const endDate = new Date(maxTime);
      const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);

      const months = [];
      const curr = new Date(startDate);
      curr.setDate(1);
      while (curr < endDate) {
          months.push({ name: curr.toLocaleString('ru-RU', { month: 'short' }), year: curr.getFullYear() });
          curr.setMonth(curr.getMonth() + 1);
      }

      const getPosition = (dateStr: string) => {
          const d = new Date(dateStr);
          const diff = (d.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
          return Math.max(0, Math.min(100, (diff / totalDays) * 100));
      };

      const platforms = ['instagram', 'telegram', 'vk', 'youtube', 'linkedin'];
      const groupedPosts = platforms.map(plat => ({
          platform: plat,
          posts: filteredPosts.filter(p => p.platform.includes(plat))
      })).filter(g => g.posts.length > 0);

      return (
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-gray-200 dark:border-[#333] h-10 bg-gray-50 dark:bg-[#252525] shrink-0">
                <div className="w-48 border-r border-gray-200 dark:border-[#333] shrink-0 p-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center bg-gray-50 dark:bg-[#252525] z-20">
                    Площадка
                </div>
                <div className="flex-1 flex relative overflow-hidden">
                    {months.map((m, i) => (
                        <div key={i} className="flex-1 border-l border-gray-200 dark:border-[#333] text-xs text-gray-500 dark:text-gray-400 p-2 font-medium text-center uppercase">
                            {m.name} {m.year}
                        </div>
                    ))}
                </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-20 custom-scrollbar relative">
                <div className="absolute inset-0 flex pointer-events-none pl-48">
                    {months.map((_, i) => (
                        <div key={i} className="flex-1 border-l border-dashed border-gray-100 dark:border-[#2a2a2a] h-full"></div>
                    ))}
                </div>

                {groupedPosts.map(group => (
                    <div key={group.platform} className="relative">
                        <div className="bg-gray-50/90 dark:bg-[#252525]/90 backdrop-blur px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 sticky top-0 border-b border-gray-100 dark:border-[#333] z-10 flex items-center gap-2">
                            {getPlatformIcon(group.platform)} {group.platform}
                        </div>
                        {group.posts.map(post => {
                            const left = getPosition(post.date);
                            const width = 2; 
                            return (
                                <div key={post.id} className="flex h-8 hover:bg-blue-50/30 dark:hover:bg-[#2a2a2a] border-b border-gray-50 dark:border-[#2a2a2a] group relative">
                                    <div 
                                        className="w-48 border-r border-gray-200 dark:border-[#333] shrink-0 px-3 text-xs truncate text-gray-700 dark:text-gray-300 flex items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-[#1e1e1e] z-10"
                                        onClick={() => handleOpenEdit(post)}
                                    >
                                        {post.topic}
                                    </div>
                                    <div className="flex-1 relative flex items-center my-1 pr-4">
                                        <div 
                                            onClick={() => handleOpenEdit(post)}
                                            className={`absolute h-5 rounded-md border cursor-pointer transition-all shadow-sm flex items-center justify-center z-0 ${getStatusColor(post.status)}`}
                                            style={{ left: `${left}%`, width: `${width}%`, minWidth: '24px' }}
                                            title={`${post.topic} (${post.date})`}
                                        >
                                           <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                        </div>
                                        <div style={{ left: `calc(${left}% + 30px)` }} className="absolute text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px] pointer-events-none">
                                            {post.topic}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
                
                {filteredPosts.length === 0 && (
                    <div className="p-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                        Нет постов для отображения на таймлайне
                    </div>
                )}
            </div>
        </div>
      );
  };

  const renderCalendar = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); 
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1; 
    
    const calendarCells = [];
    for (let i = 0; i < startOffset; i++) calendarCells.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarCells.push(i);

    return (
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="bg-gray-50 dark:bg-[#252525] p-3 border-b border-gray-200 dark:border-[#333] flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                     <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-200 dark:hover:bg-[#333] rounded"><ChevronLeft size={20} className="text-gray-600 dark:text-gray-400"/></button>
                     <h2 className="font-bold text-gray-800 dark:text-white uppercase tracking-wide text-sm text-center">
                         {currentDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                     </h2>
                     <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-200 dark:hover:bg-[#333] rounded"><ChevronRight size={20} className="text-gray-600 dark:text-gray-400"/></button>
                 </div>
                 <button onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-blue-600 hover:underline">Сегодня</button>
            </div>

            <div className="grid grid-cols-7 bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#333] text-center text-xs font-bold text-gray-500 dark:text-gray-400 py-2 shrink-0">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 bg-white dark:bg-[#1e1e1e] flex-1 overflow-y-auto custom-scrollbar">
                {calendarCells.map((day, idx) => {
                    let dateString = '';
                    if (day) {
                        const m = (currentMonth + 1).toString().padStart(2, '0');
                        const d = day.toString().padStart(2, '0');
                        dateString = `${currentYear}-${m}-${d}`;
                    }

                    const dayPosts = day ? filteredPosts.filter(p => p.date === dateString) : [];

                    return (
                        <div key={idx} className={`min-h-[100px] border-r border-b border-gray-100 dark:border-[#333] p-1 transition-colors ${!day ? 'bg-gray-50/30 dark:bg-[#151515]' : 'hover:bg-gray-50 dark:hover:bg-[#252525]'}`}>
                            {day && (
                                <>
                                  <div className="text-right text-xs text-gray-400 mb-1 mr-1">{day}</div>
                                  <div className="space-y-1">
                                      {dayPosts.map(post => (
                                          <div 
                                            key={post.id} 
                                            onClick={() => handleOpenEdit(post)} 
                                            className={`p-1.5 rounded border text-[10px] cursor-pointer shadow-sm hover:shadow-md transition-all ${getStatusColor(post.status)}`}
                                          >
                                              <div className="flex items-center justify-between mb-1">
                                                  <div className="flex items-center gap-1">
                                                      {renderPlatformIcons(post.platform)}
                                                      <span className="font-bold opacity-80 text-gray-700 dark:text-gray-300">{getFormatLabel(post.format)}</span>
                                                  </div>
                                              </div>
                                              <div className="line-clamp-2 leading-tight font-medium text-gray-800 dark:text-gray-200">{post.topic}</div>
                                          </div>
                                      ))}
                                  </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderTable = () => (
      <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-[#252525] border-b border-gray-200 dark:border-[#333] sticky top-0 z-10">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-32">Дата</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Тема</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-32">Площадка</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-24">Формат</th>
                        <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-32">Статус</th>
                        <th className="px-4 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                    {filteredPosts.map(post => (
                        <tr key={post.id} onClick={() => handleOpenEdit(post)} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer group transition-colors">
                            <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{post.date}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{post.topic}</td>
                            <td className="px-4 py-3">{renderPlatformIcons(post.platform)}</td>
                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">{getFormatLabel(post.format)}</td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border ${getStatusColor(post.status)}`}>{getStatusLabel(post.status)}</span></td>
                            <td className="px-4 py-3 text-right">
                                <button onClick={(e) => { e.stopPropagation(); onDeletePost(post.id); }} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                            </td>
                        </tr>
                    ))}
                    {filteredPosts.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400 dark:text-gray-500">Постов нет</td></tr>}
                </tbody>
            </table>
          </div>
      </div>
  );

  const renderKanban = () => {
      const statuses: ContentPost['status'][] = ['idea', 'copywriting', 'design', 'approval', 'scheduled', 'published'];
      return (
        <div className="flex h-full overflow-x-auto gap-4 pb-4">
            {statuses.map(s => (
                <div key={s} className="w-72 flex-shrink-0 flex flex-col bg-gray-50/50 dark:bg-[#1e1e1e] rounded-lg border border-gray-200 dark:border-[#333]">
                    <div className="p-3 font-bold text-sm text-gray-700 dark:text-gray-200 uppercase flex justify-between">
                        {getStatusLabel(s)} 
                        <span className="bg-gray-200 dark:bg-[#333] px-2 rounded text-xs">{filteredPosts.filter(p => p.status === s).length}</span>
                    </div>
                    <div className="p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                        {filteredPosts.filter(p => p.status === s).map(post => (
                            <div key={post.id} onClick={() => handleOpenEdit(post)} className={`p-3 rounded shadow-sm border cursor-pointer hover:shadow-md transition-all bg-white dark:bg-[#2b2b2b] border-gray-200 dark:border-[#3a3a3a]`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-[10px] font-bold opacity-60 text-gray-500">{post.date}</div>
                                    {renderPlatformIcons(post.platform)}
                                </div>
                                <div className="font-medium text-sm text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">{post.topic}</div>
                                <div className="text-[10px] bg-gray-100 dark:bg-[#333] text-gray-500 px-1.5 py-0.5 rounded w-fit font-medium">{getFormatLabel(post.format)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
      );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full pt-8 px-6 flex-shrink-0">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className={`${getIconBgColor()} p-2 rounded-lg`}>
                <DynamicIcon name={activeTable?.icon || 'FileText'} className={activeTable?.color || 'text-blue-600'} size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{activeTable?.name || 'Контент-план'}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Планирование и управление контентом
                </p>
              </div>
            </div>
            <button onClick={handleOpenCreate} className={`px-4 py-2 rounded-lg ${getButtonColor()} text-white text-sm font-medium flex items-center gap-2 shadow-sm`}>
              <Plus size={18} /> Создать
            </button>
          </div>
          
          {/* View Mode Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-full p-1 text-xs">
            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'calendar' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <LayoutGrid size={14} /> Календарь
            </button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'table' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <List size={14} /> Список
            </button>
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'kanban' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <KanbanSquare size={14} /> Доска
            </button>
            <button onClick={() => setViewMode('gantt')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${viewMode === 'gantt' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>
              <Clock size={14} /> Таймлайн
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="max-w-7xl mx-auto w-full px-6 pb-20">
          {viewMode === 'calendar' && renderCalendar()}
          {viewMode === 'table' && renderTable()}
          {viewMode === 'kanban' && renderKanban()}
          {viewMode === 'gantt' && renderGantt()}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-4" onClick={(e) => { if(e.target === e.currentTarget) setIsModalOpen(false) }}>
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-gray-200 dark:border-[#333]">
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#1e1e1e] shrink-0">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{editingPost ? 'Редактировать пост' : 'Новый пост'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={20} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                    {/* Date Input - First Field */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Дата публикации</label>
                        <div className="relative">
                            <input 
                                required 
                                type="date" 
                                value={date} 
                                onChange={e => setDate(e.target.value)} 
                                className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={16}/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Тема / Заголовок</label>
                        <input required value={topic} onChange={e => setTopic(e.target.value)} className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="О чем пост?"/>
                    </div>
                    
                    {/* TASKS SECTION */}
                    {editingPost && (
                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase flex items-center gap-2"><CheckSquare size={14}/> Задачи по контенту</label>
                                <button type="button" onClick={handleCreateLinkedTask} className="text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline">+ Добавить задачу</button>
                            </div>
                            <div className="space-y-1">
                                {tasks.filter(t => t.contentPostId === editingPost.id).length === 0 ? (
                                    <div className="text-xs text-blue-400 dark:text-blue-500 italic">Нет задач</div>
                                ) : (
                                    tasks.filter(t => t.contentPostId === editingPost.id).map(t => (
                                        <div key={t.id} onClick={() => onOpenTask && onOpenTask(t)} className="flex items-center gap-2 bg-white dark:bg-[#252525] p-2 rounded border border-blue-100 dark:border-blue-900/30 cursor-pointer hover:border-blue-300 group">
                                            <div className={`w-3 h-3 rounded-full border ${t.status === 'Выполнено' ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}></div>
                                            <span className={`text-xs text-gray-700 dark:text-gray-300 ${t.status === 'Выполнено' ? 'line-through opacity-50' : ''}`}>{t.title}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Площадки</label>
                            <div className="flex gap-2 flex-wrap">
                                {['instagram', 'telegram', 'vk', 'youtube'].map(p => { 
                                    const isSelected = platform.includes(p); 
                                    return (
                                        <div key={p} onClick={() => togglePlatform(p)} className={`p-2 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-200 dark:border-[#444] hover:bg-gray-50 dark:hover:bg-[#252525]'}`}>
                                            {getPlatformIcon(p)}
                                        </div>
                                    ); 
                                })}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Формат</label>
                            <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                                <option value="post">Пост</option>
                                <option value="reel">Reels</option>
                                <option value="story">Stories</option>
                                <option value="article">Статья</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Статус</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer">
                            <option value="idea">Идея</option>
                            <option value="copywriting">Копирайтинг</option>
                            <option value="design">Дизайн</option>
                            <option value="approval">Согласование</option>
                            <option value="scheduled">В плане</option>
                            <option value="published">Опубликовано</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase">Текст поста</label>
                        <textarea value={copy} onChange={e => setCopy(e.target.value)} className="w-full h-32 bg-gray-50 dark:bg-[#252525] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-[#444] rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Текст..."/>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-[#333] mt-4">
                         {editingPost && (<button type="button" onClick={handleDelete} className="text-red-500 text-xs font-bold hover:underline uppercase flex items-center gap-1"><Trash2 size={14}/> Удалить пост</button>)}
                         <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                            <button type="submit" className="px-6 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Сохранить</button>
                         </div>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ContentPlanView;


import React from 'react';
import { Task, User, ActivityLog, Meeting, FinancePlan, PurchaseRequest, Deal, ContentPost, Role } from '../types';
import { CheckCircle2, Clock, Calendar, ArrowRight, Wallet, TrendingUp, Instagram, AlertCircle, Briefcase, Zap, Plus } from 'lucide-react';

interface HomeViewProps {
  currentUser: User;
  tasks: Task[];
  recentActivity: ActivityLog[];
  meetings?: Meeting[];
  financePlan?: FinancePlan | null;
  purchaseRequests?: PurchaseRequest[];
  deals?: Deal[];
  contentPosts?: ContentPost[];
  onOpenTask: (task: Task) => void;
  onNavigateToInbox: () => void;
  onQuickCreateTask: () => void;
  onQuickCreateProcess: () => void;
  onQuickCreateDeal: () => void;
}

interface ActionItem {
    id: string;
    type: 'task' | 'meeting' | 'request' | 'deal' | 'content';
    title: string;
    subtitle?: string;
    time?: string;
    priority?: 'high' | 'medium' | 'low';
    status: string;
    onClick?: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ 
    currentUser, tasks, recentActivity, meetings = [], financePlan, purchaseRequests = [], deals = [], contentPosts = [],
    onOpenTask, onNavigateToInbox, onQuickCreateTask, onQuickCreateProcess, onQuickCreateDeal
}) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер';
  const todayStr = new Date().toISOString().split('T')[0];

  const actionItems: ActionItem[] = [];

  if (currentUser.role === Role.ADMIN) {
      purchaseRequests.filter(r => r.status === 'pending').forEach(r => {
          actionItems.push({ id: r.id, type: 'request', title: `Заявка: ${r.amount.toLocaleString()} UZS`, subtitle: r.description, priority: 'high', status: 'На согласовании', time: new Date(r.date).toLocaleDateString() });
      });
  }

  tasks.filter(t => (t.assigneeId === currentUser.id || (t.assigneeIds && t.assigneeIds.includes(currentUser.id))) && !['Выполнено', 'Done', 'Завершено'].includes(t.status) && (t.endDate <= todayStr)).forEach(t => {
      actionItems.push({ id: t.id, type: 'task', title: t.title, subtitle: t.projectId ? 'Проектная задача' : undefined, priority: t.priority === 'Высокий' ? 'high' : 'medium', status: t.status, time: t.endDate === todayStr ? 'Сегодня' : 'Просрочено', onClick: () => onOpenTask(t) });
  });

  const todayMeetings = meetings.filter(m => m.date === todayStr && (m.participantIds?.includes(currentUser.id) || !m.participantIds || m.participantIds.length === 0));
  todayMeetings.forEach(m => {
      actionItems.push({ id: m.id, type: 'meeting', title: `Встреча: ${m.title}`, subtitle: m.time, time: m.time, status: 'Запланировано', priority: 'medium' });
  });

  actionItems.sort((a, b) => { if (a.priority === 'high' && b.priority !== 'high') return -1; if (b.priority === 'high' && a.priority !== 'high') return 1; return 0; });

  const totalRevenue = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.amount, 0); 
  const planPercent = financePlan && financePlan.salesPlan > 0 ? Math.round((financePlan.currentIncome / financePlan.salesPlan) * 100) : 0;
  const myDeals = deals.filter(d => d.assigneeId === currentUser.id && d.stage !== 'won' && d.stage !== 'lost');

  return (
    <div className="max-w-[1920px] mx-auto w-full pt-6 px-4 pb-20 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-end mb-4 shrink-0">
        <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{greeting}, {currentUser.name}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Командный центр</p>
        </div>
        <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-800 dark:text-white">{new Date().toLocaleDateString('ru-RU', { weekday: 'long' })}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-0">
            {/* ACTION CENTER */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm flex flex-col h-full overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-[#333] bg-gray-50/50 dark:bg-[#252525] flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-sm text-gray-800 dark:text-white flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-500"/> Требует внимания / Уведомления
                    </h2>
                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{actionItems.length}</span>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {actionItems.length === 0 ? <div className="p-8 text-center text-xs text-gray-400">Всё спокойно.</div> : actionItems.map(item => (
                        <div key={`${item.type}-${item.id}`} onClick={item.onClick} className="group p-2 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-[#444] hover:bg-gray-50 dark:hover:bg-[#2b2b2b] transition-all cursor-pointer flex items-center gap-3">
                            <div className={`p-1.5 rounded-md shrink-0 ${item.type === 'task' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-100 dark:bg-[#333] text-gray-500'}`}>
                                {item.type === 'task' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline"><h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>{item.time && <span className="text-[10px] text-red-500">{item.time}</span>}</div>
                                <div className="flex items-center gap-2 mt-0.5"><span className="text-[9px] px-1 rounded border bg-gray-50 dark:bg-[#333] border-gray-100 dark:border-[#444] text-gray-500">{item.status}</span>{item.subtitle && <span className="text-[10px] text-gray-400 truncate">{item.subtitle}</span>}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AGENDA */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-xl border border-gray-200 dark:border-[#333] shadow-sm p-4 flex flex-col h-full overflow-hidden">
                <h3 className="font-bold text-sm text-gray-800 dark:text-white mb-4 flex items-center gap-2 shrink-0"><Calendar size={16} className="text-blue-500"/> Расписание на сегодня</h3>
                <div className="space-y-3 relative pl-3 border-l border-gray-100 dark:border-[#333] overflow-y-auto custom-scrollbar">
                    {todayMeetings.map(m => (
                        <div key={m.id} className="relative pl-4">
                            <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-purple-500 ring-2 ring-white dark:ring-[#1e1e1e]"></div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white uppercase">{m.time} <span className="text-gray-400 font-normal normal-case">ВСТРЕЧА</span></div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{m.title}</div>
                        </div>
                    ))}
                    {actionItems.filter(i => i.type === 'task').map(t => (
                        <div key={t.id} className="relative pl-4 group">
                            <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-white dark:ring-[#1e1e1e]"></div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white uppercase">В ТЕЧЕНИЕ ДНЯ</div>
                            <div className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500 truncate" onClick={t.onClick}>{t.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4 h-full flex flex-col overflow-y-auto custom-scrollbar">
            {/* QUICK ACTIONS */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm p-4 shrink-0">
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={onQuickCreateTask} className="p-3 bg-white dark:bg-[#252525] text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:shadow-md transition-all flex flex-col items-center gap-1 shadow-sm border border-blue-100 dark:border-blue-900/30">
                        <CheckCircle2 size={20}/> Задача
                    </button>
                    <button onClick={onQuickCreateDeal} className="p-3 bg-white dark:bg-[#252525] text-green-600 dark:text-green-400 rounded-lg text-xs font-bold hover:shadow-md transition-all flex flex-col items-center gap-1 shadow-sm border border-green-100 dark:border-green-900/30">
                        <Briefcase size={20}/> Сделка
                    </button>
                    <button onClick={onQuickCreateProcess} className="p-3 bg-white dark:bg-[#252525] text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold hover:shadow-md transition-all flex flex-col items-center gap-1 shadow-sm border border-purple-100 dark:border-purple-900/30 col-span-2">
                        <Zap size={20}/> Запустить процесс
                    </button>
                </div>
            </div>

            {/* FINANCE */}
            {currentUser.role === Role.ADMIN && financePlan && (
                <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl p-4 shadow-sm shrink-0">
                    <div className="flex justify-between items-start mb-3">
                        <div className="bg-gray-100 dark:bg-[#333] p-1.5 rounded-lg text-gray-500 dark:text-gray-400"><Wallet size={16}/></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">ФИНАНСЫ</span>
                    </div>
                    <div className="mb-2">
                        <div className="text-xl font-bold text-gray-900 dark:text-white">{financePlan.currentIncome.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Текущий доход</div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-[#333] h-1 rounded-full overflow-hidden mb-1">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${Math.min(100, planPercent)}%` }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span>{planPercent}%</span>
                        <span>План: {financePlan.salesPlan.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default HomeView;

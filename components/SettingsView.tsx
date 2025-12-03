
import React, { useState, useEffect } from 'react';
import { Project, Role, Task, User, StatusOption, PriorityOption, NotificationPreferences, AutomationRule, TableCollection, Deal } from '../types';
import { User as UserIcon, Briefcase, Bot, Archive, List, BarChart2, Layout, Bell, Zap, Link, Server, Users } from 'lucide-react';
import { ProfileSettings } from './settings/ProfileSettings';
import { SpaceSettings } from './settings/SpaceSettings';
import { AutomationSettings } from './settings/AutomationSettings';
import { IntegrationSettings } from './settings/IntegrationSettings';
import { storageService } from '../services/storageService';

interface SettingsViewProps {
  // Data
  users: User[];
  projects: Project[];
  tasks?: Task[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  tables?: TableCollection[];
  automationRules?: AutomationRule[];
  currentUser?: User;
  
  // Actions
  onUpdateTable?: (table: TableCollection) => void;
  onCreateTable?: () => void;
  onDeleteTable?: (id: string) => void;
  onUpdateUsers: (users: User[]) => void;
  onUpdateProjects: (projects: Project[]) => void;
  onUpdateStatuses: (statuses: StatusOption[]) => void;
  onUpdatePriorities: (priorities: PriorityOption[]) => void;
  onRestoreTask?: (taskId: string) => void;
  onPermanentDelete?: (taskId: string) => void; 
  onClose: () => void;
  onUpdateNotificationPrefs: (prefs: NotificationPreferences) => void;
  onSaveAutomationRule?: (rule: AutomationRule) => void;
  onDeleteAutomationRule?: (id: string) => void;
  onUpdateProfile?: (user: User) => void;
  onSaveDeal?: (deal: Deal) => void;
  
  initialTab?: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ 
  users, projects, tasks = [], statuses, priorities, tables = [],
  onUpdateTable, onCreateTable, onDeleteTable,
  onUpdateUsers, onUpdateProjects, onUpdateStatuses, onUpdatePriorities,
  onRestoreTask, onPermanentDelete,
  onUpdateNotificationPrefs, automationRules = [], onSaveAutomationRule, onDeleteAutomationRule,
  currentUser, onUpdateProfile, initialTab = 'users',
  onSaveDeal
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  
  useEffect(() => {
      setActiveTab(initialTab);
  }, [initialTab]);

  const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left whitespace-nowrap ${activeTab === id ? 'bg-white dark:bg-[#303030] text-blue-600 shadow-sm border border-gray-200 dark:border-gray-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#252525]'}`}>
        {icon} {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col md:flex-row bg-white dark:bg-[#191919]">
        {/* Mobile Header for Settings */}
        <div className="md:hidden flex items-center p-4 border-b border-gray-100 dark:border-[#333]">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Настройки</h2>
        </div>

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-[#202020] border-b md:border-b-0 md:border-r border-gray-100 dark:border-[#333] p-4 flex md:flex-col gap-1 shrink-0 overflow-x-auto md:overflow-y-auto custom-scrollbar">
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-1 mb-2 uppercase">Личные</div>
            <TabButton id="profile" label="Мой профиль" icon={<UserIcon size={16}/>} />
            
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-6 mb-2 uppercase">Система</div>
            <TabButton id="users" label="Пользователи" icon={<Users size={16}/>} />
            <TabButton id="pages" label="Страницы" icon={<Layout size={16}/>} />
            <TabButton id="projects" label="Модули" icon={<Briefcase size={16}/>} />
            
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-6 mb-2 uppercase">Задачи</div>
            <TabButton id="statuses" label="Статусы" icon={<List size={16}/>} />
            <TabButton id="priorities" label="Приоритеты" icon={<BarChart2 size={16}/>} />
            
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-6 mb-2 uppercase">Автоматизация</div>
            <TabButton id="notifications" label="Уведомления" icon={<Bell size={16}/>} />
            <TabButton id="automation" label="Роботы" icon={<Zap size={16}/>} />
            
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-6 mb-2 uppercase">Интеграции</div>
            <TabButton id="integrations" label="Боты" icon={<Bot size={16}/>} />
            <TabButton id="leads" label="Лиды" icon={<Link size={16}/>} />
            <TabButton id="meta" label="Meta" icon={<Server size={16}/>} />
            
            <div className="md:block hidden text-xs font-bold text-gray-400 dark:text-gray-600 px-3 mt-6 mb-2 uppercase">Разное</div>
            <TabButton id="archive" label="Архив" icon={<Archive size={16}/>} />
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-white dark:bg-[#191919] custom-scrollbar">
            {/* Profile & Users */}
            {(activeTab === 'profile' || activeTab === 'users') && currentUser && (
                <ProfileSettings 
                    activeTab={activeTab} 
                    currentUser={currentUser} 
                    users={users} 
                    onUpdateProfile={onUpdateProfile || (() => {})} 
                    onUpdateUsers={onUpdateUsers} 
                />
            )}

            {/* Space (Pages, Projects, Statuses, Priorities) */}
            {['pages', 'projects', 'statuses', 'priorities'].includes(activeTab) && (
                <SpaceSettings 
                    activeTab={activeTab}
                    tables={tables} projects={projects} statuses={statuses} priorities={priorities}
                    onUpdateTable={onUpdateTable || (() => {})} onCreateTable={onCreateTable || (() => {})} onDeleteTable={onDeleteTable || (() => {})}
                    onUpdateProjects={onUpdateProjects} onUpdateStatuses={onUpdateStatuses} onUpdatePriorities={onUpdatePriorities}
                />
            )}

            {/* Automation & Notifications */}
            {['automation', 'notifications'].includes(activeTab) && (
                <AutomationSettings 
                    activeTab={activeTab}
                    automationRules={automationRules || []}
                    notificationPrefs={storageService.getNotificationPrefs()}
                    statuses={statuses}
                    onSaveRule={onSaveAutomationRule || (() => {})}
                    onDeleteRule={onDeleteAutomationRule || (() => {})}
                    onUpdatePrefs={onUpdateNotificationPrefs}
                />
            )}

            {/* Integrations */}
            {['integrations', 'leads', 'meta'].includes(activeTab) && (
                <IntegrationSettings 
                    activeTab={activeTab} 
                    currentUser={currentUser} 
                    onSaveDeal={onSaveDeal}
                />
            )}

            {/* Archive (Simple list) */}
            {activeTab === 'archive' && (
                <div className="space-y-4 max-w-3xl">
                    <h3 className="font-bold text-gray-800 dark:text-white">Архив задач</h3>
                    {tasks.filter(t => t.isArchived).length === 0 ? (
                        <p className="text-gray-500">Архив пуст</p>
                    ) : (
                        tasks.filter(t => t.isArchived).map(t => (
                            <div key={t.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-[#333] rounded-lg">
                                <span className="text-sm text-gray-600 dark:text-gray-300">{t.title}</span>
                                <div className="flex gap-2">
                                    {onRestoreTask && <button onClick={() => onRestoreTask(t.id)} className="text-blue-600 hover:underline text-xs">Восстановить</button>}
                                    {onPermanentDelete && <button onClick={() => { if(confirm('Удалить навсегда?')) onPermanentDelete(t.id) }} className="text-red-500 hover:underline text-xs">Удалить</button>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    </div>
  );
};

export default SettingsView;

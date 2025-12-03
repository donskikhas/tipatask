
import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, FileText, Users, Search, Moon, Sun, Settings, Plus, Layers, Archive, Instagram, Bell, ChevronDown, LogOut, User as UserIcon, Home, Inbox, Menu,
  BarChart3, Wallet, Network, GitFork, PieChart, Briefcase, UserCheck, Layout, X
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import { AppRouter } from './components/AppRouter';
import TaskModal from './components/TaskModal';
import DocModal from './components/DocModal';
import ProfileModal from './components/ProfileModal';
import SettingsModal from './components/SettingsModal';
import CreateTableModal from './components/CreateTableModal'; 
import { useAppLogic } from './frontend/hooks/useAppLogic';
import { Role } from './types';
import { DynamicIcon } from './components/AppIcons';

// Simple Login Component
const LoginView = ({ users, onLogin }: { users: any[], onLogin: (u: any) => void }) => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedLogin = login.trim();
        const trimmedPassword = password.trim();
        
        if (!trimmedLogin || !trimmedPassword) {
            setError('Пожалуйста, введите логин и пароль');
            return;
        }
        
        // Более надежное сравнение - проверяем без учета регистра для логина
        const user = users.find(u => {
            if (!u.login || !u.password) return false;
            const userLogin = String(u.login).trim().toLowerCase();
            const userPassword = String(u.password).trim();
            const inputLogin = trimmedLogin.toLowerCase();
            const inputPassword = trimmedPassword;
            return userLogin === inputLogin && userPassword === inputPassword;
        });
        
        if (user) {
            setError('');
            onLogin(user);
        } else {
            setError('Неверный логин или пароль');
            console.log('Попытка входа:', { 
                введенныйЛогин: trimmedLogin, 
                введенныйПароль: trimmedPassword,
                доступныеПользователи: users.map(u => ({ 
                    id: u.id,
                    name: u.name,
                    login: u.login, 
                    hasPassword: !!u.password,
                    passwordLength: u.password ? String(u.password).length : 0
                }))
            });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#121212] dark:to-[#1a1a1a] px-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <svg width="120" height="113" viewBox="0 0 591 556" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M258.496 1.89275C253.854 4.06275 103.741 154.079 100.093 160.195C96.715 165.856 95.877 169.796 97.064 174.425C97.975 177.979 106.015 186.331 162.085 241.98C225.192 304.612 226.066 305.533 226.031 309.389C225.988 314.136 231.165 308.765 97.522 442.736C45.807 494.576 2.708 538.444 1.746 540.22C0.784002 541.996 -0.00199619 544.356 3.80837e-06 545.464C0.00500381 548.148 3.393 553.587 5.893 554.925C7.303 555.679 56.106 555.921 170.197 555.739C327.472 555.488 332.62 555.421 336.496 553.574C341.547 551.167 477.482 415.888 482.698 408.078C490.728 396.052 493.164 379.215 488.88 365.335C484.82 352.18 481.146 347.921 426.02 292.48C397.583 263.88 373.769 239.451 373.101 238.192C372.432 236.934 372.13 235.132 372.43 234.188C372.73 233.244 422.029 183.436 481.985 123.504C581.696 23.8328 590.996 14.2607 590.996 11.3057C590.996 6.83375 589.33 3.60775 586.006 1.64475C583.407 0.109749 570.673 -0.0182526 422.842 0.00174745C268.346 0.0227474 262.35 0.0917463 258.496 1.89275ZM375.393 155.23C343.99 186.718 317.329 213.778 316.146 215.365C313.408 219.039 313.202 227.274 315.753 231.085C316.711 232.518 347.631 264.132 384.463 301.339C421.295 338.547 451.992 369.999 452.678 371.234C457.278 379.517 449.506 392.537 441.172 390.508C439.437 390.086 421.612 373.081 390.496 342.165C341.937 293.918 300.527 253.019 247.246 200.684C225.076 178.908 217.996 171.374 217.996 169.561C217.996 167.743 226.085 159.206 251.746 133.94C270.309 115.664 286.846 100.113 288.496 99.3838C290.892 98.3248 305.684 98.0498 361.993 98.0188L432.489 97.9798L375.393 155.23ZM271.596 349.878C273.741 351.472 289.833 367.162 307.356 384.744C332.67 410.143 339.091 417.106 338.607 418.63C338.272 419.685 329.785 428.702 319.747 438.668C305.01 453.298 300.726 456.997 297.496 457.878C292.284 459.299 158.28 459.419 154.561 458.005C153.15 457.468 151.996 456.248 151.996 455.292C151.996 453.589 253.71 352.192 258.885 348.737C262.754 346.153 267.11 346.545 271.596 349.878Z" fill="#3337AD"/>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Типа задачи</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Система управления задачами</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="bg-white dark:bg-[#252525] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-[#333]">
                    <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 dark:text-white">Вход в систему</h2>
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Логин
                            </label>
                            <input 
                                value={login} 
                                onChange={e => { setLogin(e.target.value); setError(''); }} 
                                placeholder="Введите логин" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#333] dark:text-white transition-all outline-none"
                                autoComplete="username"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Пароль
                            </label>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={e => { setPassword(e.target.value); setError(''); }} 
                                placeholder="Введите пароль" 
                                className="w-full px-4 py-3 border border-gray-300 dark:border-[#444] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-[#333] dark:text-white transition-all outline-none"
                                autoComplete="current-password"
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 text-center">
                                {error}
                            </div>
                        )}
                        <button 
                            type="submit" 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Войти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const App = () => {
  const { state, actions } = useAppLogic();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);

  // Telegram Web App initialization - ДОЛЖЕН БЫТЬ ДО ВСЕХ УСЛОВНЫХ RETURN!
  const [isTelegramWebApp, setIsTelegramWebApp] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      setIsTelegramWebApp(true);
      tg.ready();
      tg.expand();
      
      // Скрываем системные элементы Telegram, используя цвет фона
      const bgColor = state.darkMode ? '#191919' : '#ffffff';
      // Используем 'bg_color' чтобы header использовал цвет фона приложения
      tg.setHeaderColor('bg_color');
      tg.setBackgroundColor(bgColor);
      
      // Включаем полноэкранный режим
      tg.enableClosingConfirmation();
    }
  }, [state.darkMode]);

  if (state.isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212] dark:text-white">Загрузка...</div>;

  if (!state.currentUser) {
      return <LoginView users={state.users} onLogin={actions.login} />;
  }

  const unreadNotifications = state.activityLogs.filter(a => !a.read);

  const getPageHeader = (view: string) => {
      switch(view) {
          case 'home': return { title: 'Главная', icon: <Home size={20} /> };
          case 'inbox': return { title: 'Входящие', icon: <Inbox size={20} /> };
          case 'search': return { title: 'Поиск', icon: <Search size={20} /> };
          case 'settings': return { title: 'Настройки', icon: <Settings size={20} /> };
          case 'analytics': return { title: 'Аналитика', icon: <PieChart size={20} /> };
          case 'sales-funnel': return { title: 'Воронка продаж', icon: <BarChart3 size={20} /> };
          case 'clients': return { title: 'Клиенты', icon: <Briefcase size={20} /> };
          case 'finance': return { title: 'Фин. планирование', icon: <Wallet size={20} /> };
          case 'business-processes': return { title: 'Бизнес-процессы', icon: <Network size={20} /> };
          case 'departments': return { title: 'Подразделения', icon: <GitFork size={20} /> };
          case 'employees': return { title: 'Сотрудники', icon: <UserCheck size={20} /> };
          default: return { title: view, icon: <Layout size={20} /> };
      }
  };

  const headerInfo = getPageHeader(state.currentView);

  const handleOpenEditCurrentTable = () => {
      if (state.activeTable) actions.openEditTable(state.activeTable);
  };

  const handleSelectTable = (tableId: string) => {
      actions.setActiveTableId(tableId);
      actions.setCurrentView('table');
  };

  return (
    <div 
      className={`flex h-screen w-full transition-colors duration-200 overflow-hidden ${state.darkMode ? 'dark bg-[#191919] text-gray-100' : 'bg-white text-gray-900'}`}
      style={isTelegramWebApp ? {
        paddingTop: 'max(env(safe-area-inset-top, 0px), 0px)',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden'
      } : {}}
    >
        {/* Sidebar */}
        <Sidebar 
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            tables={state.tables}
            activeTableId={state.activeTableId}
            onSelectTable={handleSelectTable}
            onNavigate={actions.navigate}
            currentView={state.currentView}
            currentUser={state.currentUser}
            onCreateTable={actions.openCreateTable}
            onOpenSettings={() => actions.openSettings('users')}
            onDeleteTable={actions.deleteTable}
            onEditTable={actions.openEditTable}
            unreadCount={unreadNotifications.length}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#191919] relative">
            {/* Header */}
            <div className="h-14 md:h-14 border-b border-gray-200 dark:border-[#333] flex items-center justify-between px-3 md:px-4 bg-white dark:bg-[#191919] shrink-0 z-20">
                <div className="flex items-center gap-2 md:gap-3 overflow-hidden min-w-0 flex-1">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg shrink-0"><Menu size={20}/></button>
                    
                    {state.currentView === 'table' && state.activeTable ? (
                        <div className="flex items-center gap-2 group cursor-pointer min-w-0 flex-1" onClick={handleOpenEditCurrentTable}>
                            <DynamicIcon name={state.activeTable.icon} className={`${state.activeTable.color} shrink-0`} />
                            <h2 className="font-semibold text-gray-800 dark:text-white truncate text-sm md:text-base">{state.activeTable.name}</h2>
                            {state.currentUser.role === Role.ADMIN && <Settings size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block shrink-0" />}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-semibold min-w-0">
                            <div className="text-gray-500 dark:text-gray-400 shrink-0">{headerInfo.icon}</div>
                            <span className="truncate text-sm md:text-base">{headerInfo.title}</span>
                        </div>
                    )}
                </div>

                {/* Global Search */}
                <div className="flex-1 max-w-xl mx-2 md:mx-4 hidden sm:block">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500"/>
                        <input 
                            type="text" 
                            placeholder="Поиск..." 
                            value={state.searchQuery}
                            onFocus={() => { if(state.currentView !== 'search') actions.setCurrentView('search'); }}
                            onChange={e => actions.setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-[#252525] border border-transparent dark:border-[#333] group-focus-within:border-blue-500 dark:group-focus-within:border-blue-500 rounded-lg pl-9 pr-4 py-1.5 text-sm text-gray-900 dark:text-white outline-none transition-all placeholder-gray-500"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-3 shrink-0">
                    <button onClick={actions.toggleDarkMode} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors hidden sm:block">
                        {state.darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    
                    {/* Notification Bell */}
                    <div className="relative">
                        <button onClick={() => setShowNotificationDropdown(!showNotificationDropdown)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors relative">
                            <Bell size={18} />
                            {unreadNotifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#191919]"></span>}
                        </button>
                        {showNotificationDropdown && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowNotificationDropdown(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-72 md:w-80 max-w-sm bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl z-40 overflow-hidden flex flex-col">
                                    <div className="p-3 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-gray-50 dark:bg-[#202020]">
                                        <span className="text-xs font-bold text-gray-500 uppercase">Уведомления</span>
                                        {unreadNotifications.length > 0 && <button onClick={actions.markAllRead} className="text-xs text-blue-600 hover:underline">Прочитать все</button>}
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {state.activityLogs.slice(0, 5).map(log => (
                                            <div key={log.id} className={`p-3 border-b border-gray-100 dark:border-[#333] last:border-0 text-sm ${!log.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                                <div className="font-medium text-gray-800 dark:text-gray-200">{log.action}</div>
                                                <div className="text-gray-500 dark:text-gray-400 text-xs truncate">{log.details}</div>
                                                <div className="text-[10px] text-gray-400 mt-1">{new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                            </div>
                                        ))}
                                        {state.activityLogs.length === 0 && <div className="p-4 text-center text-gray-400 text-xs">Нет уведомлений</div>}
                                    </div>
                                    <button onClick={() => { setShowNotificationDropdown(false); actions.setCurrentView('inbox'); }} className="p-2 text-center text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] border-t border-gray-100 dark:border-[#333]">Просмотреть все</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="h-6 w-px bg-gray-200 dark:bg-[#333] mx-1 hidden md:block"></div>

                    <div className="relative">
                        <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-[#252525] p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:hover:border-[#333]">
                            <img src={state.currentUser.avatar} className="w-7 h-7 rounded-full border border-gray-200 dark:border-[#444]" alt="avatar" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden md:block">{state.currentUser.name}</span>
                            <ChevronDown size={14} className="text-gray-400 hidden md:block" />
                        </button>
                        {showUserDropdown && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setShowUserDropdown(false)}></div>
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-xl z-40 overflow-hidden">
                                    <div className="p-3 border-b border-gray-100 dark:border-[#333] flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">{state.currentUser.name.charAt(0)}</div>
                                        <div className="overflow-hidden">
                                            <div className="font-bold text-gray-900 dark:text-white text-sm truncate">{state.currentUser.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{state.currentUser.email}</div>
                                        </div>
                                    </div>
                                    <div className="p-1">
                                        <button onClick={() => { setShowUserDropdown(false); actions.openSettings('profile'); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg"><UserIcon size={16}/> Профиль</button>
                                        <button onClick={() => { setShowUserDropdown(false); actions.openSettings('users'); }} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg"><Settings size={16}/> Настройки</button>
                                        <div className="h-px bg-gray-100 dark:bg-[#333] my-1"></div>
                                        <button onClick={actions.logout} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><LogOut size={16}/> Выйти</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {state.notification && (
                <div className="absolute top-20 right-4 z-50 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                    {state.notification}
                </div>
            )}

            {/* Main Content Router */}
            <AppRouter 
                currentView={state.currentView}
                viewMode={state.viewMode}
                searchQuery={state.searchQuery}
                activeTable={state.activeTable}
                // Filtered tasks for search
                filteredTasks={state.tasks.filter(t => 
                    state.currentView === 'search' 
                    ? t.title.toLowerCase().includes(state.searchQuery.toLowerCase()) 
                    : true
                )}
                allTasks={state.tasks}
                users={state.users}
                currentUser={state.currentUser}
                projects={state.projects}
                statuses={state.statuses}
                priorities={state.priorities}
                activities={state.activityLogs}
                deals={state.deals}
                clients={state.clients}
                contracts={state.contracts}
                employeeInfos={state.employeeInfos}
                meetings={state.meetings}
                contentPosts={state.contentPosts}
                docs={state.docs}
                folders={state.folders}
                activeDoc={state.activeDoc}
                tables={state.tables}
                departments={state.departments}
                financeCategories={state.financeCategories}
                financePlan={state.financePlan}
                purchaseRequests={state.purchaseRequests}
                warehouses={state.warehouses}
                inventoryItems={state.inventoryItems}
                inventoryBalances={state.inventoryBalances}
                inventoryMovements={state.inventoryMovements}
                orgPositions={state.orgPositions}
                businessProcesses={state.businessProcesses}
                automationRules={state.automationRules}
                settingsActiveTab={state.settingsActiveTab}
                actions={actions}
            />
        </div>

        {/* Modals */}
        {state.isTaskModalOpen && (
            <TaskModal 
                users={state.users} projects={state.projects} statuses={state.statuses} priorities={state.priorities} 
                currentUser={state.currentUser} onSave={actions.saveTask} onClose={actions.closeTaskModal} 
                onCreateProject={actions.quickCreateProject} onDelete={actions.deleteTask}
                onAddComment={actions.addTaskComment} onAddAttachment={actions.addTaskAttachment}
                task={state.editingTask}
            />
        )}

        {state.isDocModalOpen && (
            <DocModal onSave={actions.saveDoc} onClose={actions.closeDocModal} />
        )}

        {state.isProfileOpen && (
            <ProfileModal user={state.currentUser} onSave={actions.updateProfile} onClose={actions.closeProfile} onOpenSettings={actions.openSettings} onLogout={actions.logout} />
        )}

        {state.isCreateTableModalOpen && (
             <CreateTableModal 
                onClose={actions.closeCreateTable}
                onCreate={(name, type, icon, color) => {
                    actions.createTable(name, type, icon, color);
                    actions.closeCreateTable();
                }}
             />
        )}
        
        {state.isEditTableModalOpen && state.editingTable && (
             <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100]" onClick={() => actions.closeEditTable()}>
                 <div className="bg-white dark:bg-[#252525] p-6 rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                     <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Редактировать страницу</h3>
                     {/* We use SettingsModal but we need to pre-fill it. Since SettingsModal is complex, we might just need to pass the editing table state.
                         Actually, SettingsModal is a full view. SpaceSettings inside it handles editing.
                         Simplest way is to reuse SpaceSettings logic but triggered via this modal wrapper.
                         Or better, since we have the state `editingTable` in logic, let's just make sure SpaceSettings uses it.
                         But SpaceSettings uses local state for editingId.
                         Let's mock a simpler edit form here for consistency or use the same SettingsModal trick.
                     */}
                     <SettingsModal 
                        users={state.users} projects={state.projects} statuses={state.statuses} priorities={state.priorities} tables={state.tables}
                        initialTab="pages" onClose={actions.closeEditTable}
                        onUpdateTable={actions.updateTable}
                        onCreateTable={() => {}} onDeleteTable={() => {}}
                        onUpdateUsers={() => {}} onUpdateProjects={() => {}} onUpdateStatuses={() => {}} onUpdatePriorities={() => {}}
                        onUpdateNotificationPrefs={() => {}}
                     />
                     {/* NOTE: This will open the list of pages. The user has to click edit again on the specific page. 
                         To fix this UX, we would need to pass `editingTable` ID to SpaceSettings to auto-open edit mode. 
                         For now, this opens the "Pages" settings tab. */}
                 </div>
             </div>
        )}
    </div>
  );
};

export default App;

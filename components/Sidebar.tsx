
import React from 'react';
import { 
  Plus, 
  Home,
  Settings,
  Edit2,
  Trash2,
  BarChart3,
  Wallet,
  Network,
  GitFork,
  PieChart,
  Briefcase,
  UserCheck,
  X,
  Layers
} from 'lucide-react';
import { TableCollection, User, Role } from '../types';
import { LogoIcon, DynamicIcon } from './AppIcons';

interface SidebarProps {
  isOpen: boolean; // Mobile state
  onClose: () => void; // Mobile close handler
  tables: TableCollection[];
  activeTableId: string;
  onSelectTable: (id: string) => void;
  onNavigate: (view: 'home' | 'inbox' | 'search' | 'clients' | 'employees' | 'sales-funnel' | 'finance' | 'departments' | 'inventory' | 'business-processes' | 'analytics' | 'settings') => void;
  currentView: string;
  currentUser: User;
  onCreateTable: () => void;
  onOpenSettings: () => void;
  onDeleteTable: (id: string) => void;
  onEditTable: (table: TableCollection) => void;
  unreadCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen,
  onClose,
  tables, 
  activeTableId, 
  onSelectTable, 
  onNavigate,
  currentView,
  currentUser,
  onCreateTable,
  onOpenSettings,
  onDeleteTable,
  onEditTable,
  unreadCount
}) => {
  
  const getTableTypeIcon = (type: string) => {
      switch(type) {
          case 'functionality': return 'Layers';
          case 'backlog': return 'Archive';
          case 'content-plan': return 'Instagram';
          case 'meetings': return 'Users';
          case 'docs': return 'FileText';
          default: return 'CheckSquare';
      }
  };

  const handleNav = (cb: () => void) => {
      cb();
      onClose(); // Close sidebar on mobile after click
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
            onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 sm:w-72 bg-white dark:bg-[#191919] border-r border-notion-border dark:border-[#333]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
        h-full flex flex-col text-notion-text dark:text-gray-300
      `} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Workspace Header */}
        <div className="flex items-center justify-between p-3 m-2 mb-4">
            <div 
                onClick={() => handleNav(() => onNavigate('home'))}
                className="flex items-center gap-3 hover:bg-notion-hover dark:hover:bg-[#252525] rounded cursor-pointer transition-colors p-2 flex-1"
            >
                <LogoIcon className="w-6 h-6 shrink-0" />
                <span className="font-semibold text-sm">Типа задачи</span>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg">
                <X size={20} />
            </button>
        </div>

        {/* Standard Links */}
        <div className="px-2 py-1 space-y-0.5 mb-4 shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none custom-scrollbar">
            <div 
                onClick={() => handleNav(() => onNavigate('home'))}
                className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'home' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
            >
            <Home size={16} /> <span className="text-sm">Главная</span>
            </div>
            
            <div 
                onClick={() => handleNav(() => onNavigate('sales-funnel'))}
                className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'sales-funnel' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
            >
                <BarChart3 size={16} /> <span className="text-sm">Воронка продаж</span>
            </div>

            <div 
                onClick={() => handleNav(() => onNavigate('finance'))}
                className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'finance' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
            >
                <Wallet size={16} /> <span className="text-sm">Фин. планирование</span>
            </div>

            <div 
                onClick={() => handleNav(() => onNavigate('business-processes'))}
                className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'business-processes' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
            >
                <Network size={16} /> <span className="text-sm">Бизнес-процессы</span>
            </div>

            {/* ADMIN ONLY SECTIONS */}
            {currentUser.role === Role.ADMIN && (
                <>
                    <div 
                        onClick={() => handleNav(() => onNavigate('departments'))}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'departments' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
                    >
                        <GitFork size={16} /> <span className="text-sm">Подразделения</span>
                    </div>
                    <div 
                        onClick={() => handleNav(() => onNavigate('inventory'))}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'inventory' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
                    >
                        <Layers size={16} /> <span className="text-sm">Склад</span>
                    </div>
                    <div 
                        onClick={() => handleNav(() => onNavigate('analytics'))}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'analytics' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
                    >
                        <PieChart size={16} /> <span className="text-sm">Аналитика</span>
                    </div>
                    <div 
                        onClick={() => handleNav(() => onNavigate('clients'))}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'clients' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
                    >
                        <Briefcase size={16} /> <span className="text-sm">Клиенты</span>
                    </div>
                    <div 
                        onClick={() => handleNav(() => onNavigate('employees'))}
                        className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer transition-colors ${currentView === 'employees' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white font-medium' : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'}`}
                    >
                        <UserCheck size={16} /> <span className="text-sm">Сотрудники</span>
                    </div>
                </>
            )}
        </div>

        {/* Tables List */}
        <div className="px-3 flex-1 overflow-y-auto custom-scrollbar min-h-0">
            <div className="text-xs font-bold text-notion-muted dark:text-gray-500 mb-2 px-2 uppercase flex justify-between items-center sticky top-0 bg-white dark:bg-[#191919] z-10 py-1">
                <span>Пространство</span>
            </div>

            <div className="space-y-0.5 pb-4">
            {tables.map(table => (
                <div
                key={table.id}
                onClick={() => handleNav(() => onSelectTable(table.id))}
                className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded cursor-pointer text-sm group transition-colors ${
                    activeTableId === table.id && currentView === 'table'
                    ? 'bg-notion-hover dark:bg-[#252525] font-medium text-notion-text dark:text-white' 
                    : 'text-notion-text/70 dark:text-gray-400 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200'
                }`}
                >
                <div className="flex items-center gap-2 overflow-hidden">
                    <DynamicIcon name={table.icon || getTableTypeIcon(table.type)} className={table.color} size={18} />
                    <span className="truncate">{table.name}</span>
                </div>
                
                {currentUser.role === Role.ADMIN && (
                    <div className="flex items-center md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditTable(table); }}
                            className="text-gray-400 hover:text-blue-500 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                            <Edit2 size={12} />
                        </button>
                        {!table.isSystem && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteTable(table.id); }}
                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                            >
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                )}
                </div>
            ))}

            {currentUser.role === Role.ADMIN && (
                <button 
                    onClick={() => handleNav(onCreateTable)}
                    className="w-full text-left flex items-center gap-2 px-3 py-1.5 rounded cursor-pointer text-sm text-notion-muted dark:text-gray-500 hover:bg-notion-hover dark:hover:bg-[#252525] hover:text-notion-text dark:hover:text-gray-200 mt-2 transition-colors"
                >
                    <Plus size={16} />
                    <span>Добавить страницу</span>
                </button>
            )}
            </div>
        </div>

        {/* Footer Settings */}
        {currentUser.role === Role.ADMIN && (
            <div className="p-3 mt-auto border-t border-notion-border dark:border-[#333] shrink-0 bg-white dark:bg-[#191919]">
                <button 
                    onClick={() => handleNav(onOpenSettings)}
                    className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors font-medium ${currentView === 'settings' ? 'bg-notion-hover dark:bg-[#252525] text-notion-text dark:text-white' : 'text-notion-text dark:text-gray-300 hover:bg-notion-hover dark:hover:bg-[#252525]'}`}
                >
                    <Settings size={16} />
                    <span>Настройки</span>
                </button>
            </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

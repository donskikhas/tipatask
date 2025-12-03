
import { useState, useEffect } from 'react';
import { TableCollection, ActivityLog, ViewMode, NotificationPreferences, AutomationRule } from '../../../types';
import { api } from '../../../backend/api';
import { DEFAULT_NOTIFICATION_PREFS, DEFAULT_AUTOMATION_RULES } from '../../../constants';

export const useSettingsLogic = (showNotification: (msg: string) => void) => {
  const [darkMode, setDarkMode] = useState(false);
  const [tables, setTables] = useState<TableCollection[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFS);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  
  // UI Global State
  const [currentView, setCurrentView] = useState<'home' | 'inbox' | 'search' | 'table' | 'doc-editor' | 'clients' | 'employees' | 'sales-funnel' | 'finance' | 'departments' | 'inventory' | 'business-processes' | 'analytics' | 'settings'>('home');
  const [activeTableId, setActiveTableId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TABLE);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Deprecated but kept for type safety if needed temporarily
  const [settingsActiveTab, setSettingsActiveTab] = useState<string>('users'); 

  const [isCreateTableModalOpen, setIsCreateTableModalOpen] = useState(false);
  const [isEditTableModalOpen, setIsEditTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableCollection | null>(null);

  useEffect(() => {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          setDarkMode(true);
      }
  }, []);

  useEffect(() => {
      if (darkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
      }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const createTable = (name: string, type: any, icon: string, color: string) => {
      const newTable: TableCollection = { id: `t${Date.now()}`, name, type, icon, color, isSystem: false };
      const newTables = [...tables, newTable]; 
      setTables(newTables); api.tables.updateAll(newTables); 
      setActiveTableId(newTable.id); setCurrentView('table'); 
      setIsCreateTableModalOpen(false);
  };

  const updateTable = (updatedTable: TableCollection) => {
      const updatedTables = tables.map(t => t.id === updatedTable.id ? updatedTable : t);
      setTables(updatedTables); api.tables.updateAll(updatedTables);
      setIsEditTableModalOpen(false); setEditingTable(null); showNotification('Страница обновлена');
  };

  const deleteTable = (id: string) => {
      const newTables = tables.filter(t => t.id !== id); 
      setTables(newTables); api.tables.updateAll(newTables);
      if (activeTableId === id) setCurrentView('home');
  };

  const updateNotificationPrefs = (prefs: NotificationPreferences) => {
      setNotificationPrefs(prefs);
      api.notificationPrefs.update(prefs);
      showNotification('Настройки уведомлений сохранены');
  };

  const saveAutomationRule = (rule: AutomationRule) => {
      const updated = automationRules.find(r => r.id === rule.id)
          ? automationRules.map(r => r.id === rule.id ? rule : r)
          : [...automationRules, rule];
      setAutomationRules(updated);
      api.automation.updateRules(updated);
      showNotification('Правило сохранено');
  };

  const deleteAutomationRule = (id: string) => {
      const updated = automationRules.filter(r => r.id !== id);
      setAutomationRules(updated);
      api.automation.updateRules(updated);
      showNotification('Правило удалено');
  };

  const markAllRead = () => {
      const u = activityLogs.map(l => ({ ...l, read: true })); setActivityLogs(u); api.activity.updateAll(u);
  };

  const handleNavigate = (view: 'home' | 'inbox' | 'search' | 'clients' | 'employees' | 'sales-funnel' | 'finance' | 'departments' | 'inventory' | 'business-processes' | 'analytics') => {
      setCurrentView(view); setActiveTableId('');
  };

  return {
    state: { 
        darkMode, tables, activityLogs, currentView, activeTableId, viewMode, searchQuery,
        isSettingsOpen, settingsActiveTab, isCreateTableModalOpen, isEditTableModalOpen, editingTable, notificationPrefs,
        automationRules
    },
    setters: { setTables, setActivityLogs, setCurrentView, setActiveTableId, setViewMode, setSearchQuery, setNotificationPrefs, setAutomationRules },
    actions: {
        toggleDarkMode, createTable, updateTable, deleteTable, markAllRead, navigate: handleNavigate,
        // Changed: Opens settings page instead of modal
        openSettings: (tab: string = 'users') => { setSettingsActiveTab(tab); setCurrentView('settings'); setActiveTableId(''); }, 
        closeSettings: () => setCurrentView('home'),
        openCreateTable: () => setIsCreateTableModalOpen(true), closeCreateTable: () => setIsCreateTableModalOpen(false),
        openEditTable: (t: TableCollection) => { setEditingTable(t); setIsEditTableModalOpen(true); }, closeEditTable: () => setIsEditTableModalOpen(false),
        updateNotificationPrefs,
        saveAutomationRule, deleteAutomationRule
    }
  };
};

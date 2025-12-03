
import { useState, useEffect } from 'react';
import { api } from '../../backend/api';
import { FAVICON_SVG_DATA_URI } from '../../components/AppIcons';
import { storageService } from '../../services/storageService';
import { pollTelegramUpdates } from '../../services/telegramService';
import { Comment, Deal, Task, BusinessProcess } from '../../types';

import { useAuthLogic } from './slices/useAuthLogic';
import { useTaskLogic } from './slices/useTaskLogic';
import { useCRMLogic } from './slices/useCRMLogic';
import { useContentLogic } from './slices/useContentLogic';
import { useSettingsLogic } from './slices/useSettingsLogic';
import { useFinanceLogic } from './slices/useFinanceLogic';
import { useBPMLogic } from './slices/useBPMLogic';
import { useInventoryLogic } from './slices/useInventoryLogic';

export const useAppLogic = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => { setNotification(msg); setTimeout(() => setNotification(null), 3000); };

  const settingsSlice = useSettingsLogic(showNotification);
  const authSlice = useAuthLogic(showNotification);
  const crmSlice = useCRMLogic(showNotification);
  const taskSlice = useTaskLogic(showNotification, authSlice.state.currentUser, authSlice.state.users, settingsSlice.state.automationRules);
  const contentSlice = useContentLogic(showNotification, settingsSlice.state.activeTableId);
  const financeSlice = useFinanceLogic(showNotification);
  const bpmSlice = useBPMLogic(showNotification);
  const inventorySlice = useInventoryLogic(showNotification);

  const refreshData = () => {
      authSlice.setters.setUsers(api.users.getAll());
      taskSlice.setters.setTasks(api.tasks.getAll());
      taskSlice.setters.setProjects(api.projects.getAll());
      taskSlice.setters.setStatuses(api.statuses.getAll());
      taskSlice.setters.setPriorities(api.priorities.getAll());
      crmSlice.setters.setClients(api.clients.getAll());
      crmSlice.setters.setContracts(api.contracts.getAll());
      crmSlice.setters.setEmployeeInfos(api.employees.getAll());
      crmSlice.setters.setDeals(api.deals.getAll());
      contentSlice.setters.setDocs(api.docs.getAll());
      contentSlice.setters.setFolders(api.folders.getAll());
      contentSlice.setters.setMeetings(api.meetings.getAll());
      contentSlice.setters.setContentPosts(api.contentPosts.getAll());
      settingsSlice.setters.setTables(api.tables.getAll());
      settingsSlice.setters.setActivityLogs(api.activity.getAll());
      settingsSlice.setters.setNotificationPrefs(api.notificationPrefs.get());
      settingsSlice.setters.setAutomationRules(api.automation.getRules());
      financeSlice.setters.setDepartments(api.departments.getAll());
      financeSlice.setters.setFinanceCategories(api.finance.getCategories());
      financeSlice.setters.setFinancePlan(api.finance.getPlan());
      financeSlice.setters.setPurchaseRequests(api.finance.getRequests());
      bpmSlice.setters.setOrgPositions(api.bpm.getPositions());
      bpmSlice.setters.setBusinessProcesses(api.bpm.getProcesses());
      inventorySlice.setters.setWarehouses(api.inventory.getWarehouses());
      inventorySlice.setters.setItems(api.inventory.getItems());
      inventorySlice.setters.setMovements(api.inventory.getMovements());
  };

  useEffect(() => {
    const faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement;
    if (faviconLink) faviconLink.href = FAVICON_SVG_DATA_URI;
    const initApp = async () => { setIsLoading(true); await api.sync(); refreshData(); setIsLoading(false); };
    initApp();
    // Уменьшили интервал синхронизации до 2 секунд для более быстрого обновления
    const syncInterval = setInterval(async () => { 
        const hasChanges = await api.sync();
        if (hasChanges) {
            refreshData();
        }
    }, 2000);
    const tgPollInterval = setInterval(async () => {
        // Only run polling if enabled in settings
        if (!storageService.getEnableTelegramImport()) return;
        
        const updates = await pollTelegramUpdates();
        if (updates.newDeals.length > 0 || updates.newMessages.length > 0) {
            // Merge new deals
            if (updates.newDeals.length > 0) {
                const currentDeals = api.deals.getAll(); // get fresh
                const mergedDeals = [...currentDeals, ...updates.newDeals];
                crmSlice.setters.setDeals(mergedDeals);
                api.deals.updateAll(mergedDeals);
                showNotification(`Новых лидов из Telegram: ${updates.newDeals.length}`);
            }
            
            // Merge messages
            if (updates.newMessages.length > 0) {
                const currentDeals = api.deals.getAll();
                const updatedDeals = currentDeals.map(d => {
                    const msgs = updates.newMessages.filter(m => m.dealId === d.id);
                    if (msgs.length > 0) {
                        const newComments: Comment[] = msgs.map(m => ({
                            id: `cm-${Date.now()}-${Math.random()}`,
                            text: m.text,
                            authorId: 'telegram_user',
                            createdAt: new Date().toISOString(),
                            type: 'telegram_in'
                        }));
                        return { ...d, comments: [...(d.comments || []), ...newComments] };
                    }
                    return d;
                });
                crmSlice.setters.setDeals(updatedDeals);
                api.deals.updateAll(updatedDeals);
                showNotification(`Новых сообщений: ${updates.newMessages.length}`);
            }
        }
    }, 10000);

    return () => { clearInterval(syncInterval); clearInterval(tgPollInterval); };
  }, []);

  const saveDocWrapper = (docData: any) => {
      const newDoc = contentSlice.actions.saveDoc(docData, settingsSlice.state.activeTableId);
      if (newDoc && docData.type === 'internal') { 
          contentSlice.setters.setActiveDocId(newDoc.id); 
          settingsSlice.setters.setCurrentView('doc-editor'); 
      }
  };

  const handleDocClickWrapper = (doc: any) => {
      const result = contentSlice.actions.handleDocClick(doc);
      if (result === 'doc-editor') settingsSlice.setters.setCurrentView('doc-editor');
  };

  // Обертка для saveTask с обработкой бизнес-процессов
  const saveTaskWrapper = (taskData: Partial<Task>) => {
      // Получаем старую задачу ДО сохранения
      const oldTask = taskData.id ? taskSlice.state.tasks.find(t => t.id === taskData.id) : null;
      const wasCompleted = oldTask && (oldTask.status === 'Выполнено' || oldTask.status === 'Done');
      const isNowCompleted = taskData.status && (taskData.status === 'Выполнено' || taskData.status === 'Done');
      
      // Используем tableId из задачи, если он есть, иначе activeTableId
      const targetTableId = taskData.tableId || settingsSlice.state.activeTableId;
      
      // Сохраняем задачу
      taskSlice.actions.saveTask(taskData, targetTableId);
      
      // Если задача процесса только что выполнена - переходим к следующему шагу
      if (oldTask && oldTask.processId && oldTask.processInstanceId && oldTask.stepId && !wasCompleted && isNowCompleted) {
          const process = bpmSlice.state.businessProcesses.find(p => p.id === oldTask.processId);
          if (process) {
              const instance = process.instances?.find(i => i.id === oldTask.processInstanceId);
              if (instance && instance.status === 'active') {
                  const currentStepIndex = process.steps.findIndex(s => s.id === instance.currentStepId);
                  const nextStepIndex = currentStepIndex + 1;
                  
                  if (nextStepIndex < process.steps.length) {
                      // Есть следующий шаг - создаем задачу для него
                      const nextStep = process.steps[nextStepIndex];
                      const tasksTable = settingsSlice.state.tables.find(t => t.type === 'tasks');
                      if (tasksTable) {
                          // Находим исполнителя для следующего шага
                          let nextAssigneeId: string | null = null;
                          if (nextStep.assigneeType === 'position') {
                              const position = bpmSlice.state.orgPositions.find(p => p.id === nextStep.assigneeId);
                              nextAssigneeId = position?.holderUserId || null;
                          } else {
                              nextAssigneeId = nextStep.assigneeId || null;
                          }
                          
                          if (nextAssigneeId) {
                              const nextTask: Partial<Task> = {
                                  id: `task-${Date.now()}`,
                                  tableId: tasksTable.id,
                                  title: `${process.title}: ${nextStep.title}`,
                                  description: nextStep.description || '',
                                  status: 'Не начато',
                                  priority: 'Средний',
                                  assigneeId: nextAssigneeId,
                                  startDate: new Date().toISOString().split('T')[0],
                                  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                                  processId: process.id,
                                  processInstanceId: instance.id,
                                  stepId: nextStep.id
                              };
                              
                              taskSlice.actions.saveTask(nextTask, tasksTable.id);
                              
                              // Обновляем экземпляр процесса
                              const updatedInstance = {
                                  ...instance,
                                  currentStepId: nextStep.id,
                                  taskIds: [...instance.taskIds, nextTask.id!]
                              };
                              
                              const updatedProcess: BusinessProcess = {
                                  ...process,
                                  instances: process.instances?.map(i => i.id === instance.id ? updatedInstance : i) || [updatedInstance]
                              };
                              
                              bpmSlice.actions.saveProcess(updatedProcess);
                              showNotification(`Процесс перешел к шагу ${nextStepIndex + 1}: ${nextStep.title}`);
                          }
                      }
                  } else {
                      // Все шаги выполнены - завершаем процесс
                      const updatedInstance = {
                          ...instance,
                          status: 'completed' as const,
                          completedAt: new Date().toISOString(),
                          currentStepId: null
                      };
                      
                      const updatedProcess: BusinessProcess = {
                          ...process,
                          instances: process.instances?.map(i => i.id === instance.id ? updatedInstance : i) || [updatedInstance]
                      };
                      
                      bpmSlice.actions.saveProcess(updatedProcess);
                      showNotification(`Процесс "${process.title}" завершен!`);
                  }
              }
          }
      }
  };

  return {
    state: {
      isLoading, notification,
      users: authSlice.state.users, currentUser: authSlice.state.currentUser, isProfileOpen: authSlice.state.isProfileOpen,
      tasks: taskSlice.state.tasks, projects: taskSlice.state.projects, statuses: taskSlice.state.statuses, priorities: taskSlice.state.priorities, isTaskModalOpen: taskSlice.state.isTaskModalOpen, editingTask: taskSlice.state.editingTask,
      clients: crmSlice.state.clients, contracts: crmSlice.state.contracts, employeeInfos: crmSlice.state.employeeInfos, deals: crmSlice.state.deals,
      docs: contentSlice.state.docs, folders: contentSlice.state.folders, meetings: contentSlice.state.meetings, contentPosts: contentSlice.state.contentPosts, isDocModalOpen: contentSlice.state.isDocModalOpen, activeDocId: contentSlice.state.activeDocId,
      departments: financeSlice.state.departments, financeCategories: financeSlice.state.financeCategories, financePlan: financeSlice.state.financePlan, purchaseRequests: financeSlice.state.purchaseRequests,
      orgPositions: bpmSlice.state.orgPositions, businessProcesses: bpmSlice.state.businessProcesses,
      warehouses: inventorySlice.state.warehouses, inventoryItems: inventorySlice.state.items, inventoryMovements: inventorySlice.state.movements, inventoryBalances: inventorySlice.state.balances,
      darkMode: settingsSlice.state.darkMode, tables: settingsSlice.state.tables, activityLogs: settingsSlice.state.activityLogs, currentView: settingsSlice.state.currentView, activeTableId: settingsSlice.state.activeTableId, viewMode: settingsSlice.state.viewMode, searchQuery: settingsSlice.state.searchQuery, isSettingsOpen: settingsSlice.state.isSettingsOpen, settingsActiveTab: settingsSlice.state.settingsActiveTab, isCreateTableModalOpen: settingsSlice.state.isCreateTableModalOpen, isEditTableModalOpen: settingsSlice.state.isEditTableModalOpen, editingTable: settingsSlice.state.editingTable, notificationPrefs: settingsSlice.state.notificationPrefs, automationRules: settingsSlice.state.automationRules,
      activeTable: settingsSlice.state.tables.find(t => t.id === settingsSlice.state.activeTableId), activeDoc: contentSlice.state.docs.find(d => d.id === contentSlice.state.activeDocId)
    },
    actions: {
      login: authSlice.actions.login, logout: authSlice.actions.logout, updateUsers: authSlice.actions.updateUsers, updateProfile: authSlice.actions.updateProfile, openProfile: authSlice.actions.openProfile, closeProfile: authSlice.actions.closeProfile,
      updateProjects: taskSlice.actions.updateProjects, updateStatuses: taskSlice.actions.updateStatuses, updatePriorities: taskSlice.actions.updatePriorities, quickCreateProject: taskSlice.actions.quickCreateProject, saveTask: saveTaskWrapper, deleteTask: taskSlice.actions.deleteTask, restoreTask: taskSlice.actions.restoreTask, permanentDeleteTask: taskSlice.actions.permanentDeleteTask, openTaskModal: taskSlice.actions.openTaskModal, closeTaskModal: taskSlice.actions.closeTaskModal, addTaskComment: taskSlice.actions.addTaskComment, addTaskAttachment: taskSlice.actions.addTaskAttachment,
      saveClient: crmSlice.actions.saveClient, deleteClient: crmSlice.actions.deleteClient, saveContract: crmSlice.actions.saveContract, deleteContract: crmSlice.actions.deleteContract, saveEmployee: crmSlice.actions.saveEmployee, deleteEmployee: crmSlice.actions.deleteEmployee, saveDeal: crmSlice.actions.saveDeal, deleteDeal: crmSlice.actions.deleteDeal,
      saveMeeting: contentSlice.actions.saveMeeting, updateMeetingSummary: contentSlice.actions.updateMeetingSummary, savePost: contentSlice.actions.savePost, deletePost: contentSlice.actions.deletePost, saveDoc: saveDocWrapper, saveDocContent: contentSlice.actions.saveDocContent, deleteDoc: contentSlice.actions.deleteDoc, createFolder: contentSlice.actions.createFolder, deleteFolder: contentSlice.actions.deleteFolder, handleDocClick: handleDocClickWrapper, openDocModal: contentSlice.actions.openDocModal, closeDocModal: contentSlice.actions.closeDocModal,
      saveDepartment: financeSlice.actions.saveDepartment, deleteDepartment: financeSlice.actions.deleteDepartment, saveFinanceCategory: financeSlice.actions.saveFinanceCategory, deleteFinanceCategory: financeSlice.actions.deleteFinanceCategory, updateFinancePlan: financeSlice.actions.updateFinancePlan, savePurchaseRequest: financeSlice.actions.savePurchaseRequest, deletePurchaseRequest: financeSlice.actions.deletePurchaseRequest,
      saveWarehouse: inventorySlice.actions.saveWarehouse, deleteWarehouse: inventorySlice.actions.deleteWarehouse, saveInventoryItem: inventorySlice.actions.saveItem, deleteInventoryItem: inventorySlice.actions.deleteItem, createInventoryMovement: inventorySlice.actions.createMovement,
      savePosition: bpmSlice.actions.savePosition, deletePosition: bpmSlice.actions.deletePosition, saveProcess: bpmSlice.actions.saveProcess, deleteProcess: bpmSlice.actions.deleteProcess,
      toggleDarkMode: settingsSlice.actions.toggleDarkMode, createTable: settingsSlice.actions.createTable, updateTable: settingsSlice.actions.updateTable, deleteTable: settingsSlice.actions.deleteTable, markAllRead: settingsSlice.actions.markAllRead, navigate: settingsSlice.actions.navigate, openSettings: settingsSlice.actions.openSettings, closeSettings: settingsSlice.actions.closeSettings, openCreateTable: settingsSlice.actions.openCreateTable, closeCreateTable: settingsSlice.actions.closeCreateTable, openEditTable: settingsSlice.actions.openEditTable, closeEditTable: settingsSlice.actions.closeEditTable, updateNotificationPrefs: settingsSlice.actions.updateNotificationPrefs, saveAutomationRule: settingsSlice.actions.saveAutomationRule, deleteAutomationRule: settingsSlice.actions.deleteAutomationRule,
      setActiveTableId: settingsSlice.setters.setActiveTableId, setCurrentView: settingsSlice.setters.setCurrentView, setViewMode: settingsSlice.setters.setViewMode, setSearchQuery: settingsSlice.setters.setSearchQuery
    }
  };
};

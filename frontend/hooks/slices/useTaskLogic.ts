
import { useState, useEffect } from 'react';
import { Task, Project, StatusOption, PriorityOption, User, TaskComment, TaskAttachment, AutomationRule } from '../../../types';
import { api } from '../../../backend/api';
import { sendTelegramNotification, formatNewTaskMessage, formatStatusChangeMessage } from '../../../services/telegramService';

export const useTaskLogic = (showNotification: (msg: string) => void, currentUser: User | null, users: User[], automationRules: AutomationRule[] = []) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const [priorities, setPriorities] = useState<PriorityOption[]>([]);
  
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null); // Changed to Partial

  // Sync editingTask with latest data from tasks array (for realtime comments)
  useEffect(() => {
      if (editingTask && isTaskModalOpen && editingTask.id) {
          const freshTask = tasks.find(t => t.id === editingTask.id);
          if (freshTask) {
              // Проверяем изменения в комментариях, вложениях и других полях
              const commentsChanged = JSON.stringify(freshTask.comments || []) !== JSON.stringify(editingTask.comments || []);
              const attachmentsChanged = JSON.stringify(freshTask.attachments || []) !== JSON.stringify(editingTask.attachments || []);
              const statusChanged = freshTask.status !== editingTask.status;
              const priorityChanged = freshTask.priority !== editingTask.priority;
              
              // Обновляем editingTask при любых изменениях
              if (commentsChanged || attachmentsChanged || statusChanged || priorityChanged) {
                  setEditingTask(freshTask);
              }
          }
      }
  }, [tasks, isTaskModalOpen, editingTask?.id]);

  const updateProjects = (p: Project[]) => { setProjects(p); api.projects.updateAll(p); };
  const updateStatuses = (s: StatusOption[]) => { setStatuses(s); api.statuses.updateAll(s); };
  const updatePriorities = (p: PriorityOption[]) => { setPriorities(p); api.priorities.updateAll(p); };

  const quickCreateProject = (name: string) => {
      const newProject: Project = { id: `p-${Date.now()}`, name };
      const updated = [...projects, newProject];
      updateProjects(updated);
      showNotification('Модуль создан');
  };

  const processAutomation = async (task: Task, trigger: 'status_change' | 'new_task') => {
      const activeRules = automationRules.filter(r => r.isActive && r.trigger === trigger);
      
      for (const rule of activeRules) {
          if (rule.conditions.moduleId && task.projectId !== rule.conditions.moduleId) continue;
          if (trigger === 'status_change' && rule.conditions.statusTo && task.status !== rule.conditions.statusTo) continue;

          if (rule.action.type === 'telegram_message') {
              let msg = rule.action.template
                  .replace('{task_title}', task.title)
                  .replace('{status}', task.status)
                  .replace('{priority}', task.priority);
              
              let targetName = 'Все';
              if (rule.action.targetUser === 'assignee') {
                  const assignee = users.find(u => u.id === task.assigneeId || (task.assigneeIds && task.assigneeIds[0] === u.id));
                  if (assignee) targetName = assignee.name;
              } else if (rule.action.targetUser === 'admin') {
                  targetName = 'Админ';
              }

              msg = `🤖 <b>Автоматизация: ${rule.name}</b>\nДля: ${targetName}\n\n${msg}`;
              await sendTelegramNotification(msg, rule.action.buttons);
          }
      }
  };

  const saveTask = (taskData: Partial<Task>, activeTableId: string) => {
    let updatedTasks: Task[];
    const notificationPrefs = api.notificationPrefs.get();

    if (taskData.id) {
        const oldTask = tasks.find(t => t.id === taskData.id);
        if (oldTask) {
            // Обновляем существующую задачу
            const oldStatus = oldTask.status;
            const newTask = { ...oldTask, ...taskData, dealId: taskData.dealId !== undefined ? taskData.dealId : oldTask.dealId, updatedAt: new Date().toISOString() } as Task;
            updatedTasks = tasks.map(t => t.id === taskData.id ? newTask : t);
            
            if (currentUser && taskData.status && oldStatus !== taskData.status) {
                if (notificationPrefs.statusChange.telegram) {
                    sendTelegramNotification(formatStatusChangeMessage(oldTask.title, oldStatus || '?', taskData.status, currentUser.name)).catch(console.error);
                }
                processAutomation(newTask, 'status_change');
            }
        } else {
            // Задача с таким id не существует - создаем новую
            const newTask: Task = {
                id: taskData.id,
                tableId: taskData.tableId || activeTableId,
                title: taskData.title || 'Новая задача',
                status: taskData.status || statuses[0]?.name || 'New',
                priority: taskData.priority || priorities[0]?.name || 'Low',
                assigneeId: taskData.assigneeId || null,
                assigneeIds: taskData.assigneeIds || (taskData.assigneeId ? [taskData.assigneeId] : []),
                projectId: taskData.projectId || null,
                startDate: taskData.startDate || new Date().toISOString().split('T')[0],
                endDate: taskData.endDate || new Date().toISOString().split('T')[0],
                isArchived: false,
                description: taskData.description,
                comments: [],
                attachments: [],
                contentPostId: taskData.contentPostId,
                processId: taskData.processId,
                processInstanceId: taskData.processInstanceId,
                stepId: taskData.stepId,
                dealId: taskData.dealId
            };
            updatedTasks = [...tasks, newTask];
            
            if (currentUser) {
                const assigneeUser = users.find(u => u.id === newTask.assigneeId);
                const assigneeName = assigneeUser ? assigneeUser.name : 'Не назначено';
                const projectName = projects.find(p => p.id === newTask.projectId)?.name || null;
                
                if (notificationPrefs.newTask.telegram) {
                    sendTelegramNotification(formatNewTaskMessage(newTask.title, newTask.priority, newTask.endDate, assigneeName, projectName)).catch(console.error);
                }
                processAutomation(newTask, 'new_task');
            }
        }
    } else {
        // Создаем новую задачу без id
        const newTask: Task = {
            id: `task-${Date.now()}`, 
            tableId: activeTableId, 
            title: taskData.title || 'Новая задача',
            status: taskData.status || statuses[0]?.name || 'New', 
            priority: taskData.priority || priorities[0]?.name || 'Low',
            assigneeId: taskData.assigneeId || null,
            assigneeIds: taskData.assigneeIds || (taskData.assigneeId ? [taskData.assigneeId] : []),
            projectId: taskData.projectId || null,
            startDate: taskData.startDate || new Date().toISOString().split('T')[0],
            endDate: taskData.endDate || new Date().toISOString().split('T')[0], 
            isArchived: false,
            description: taskData.description,
            comments: [],
            attachments: [],
            contentPostId: taskData.contentPostId,
            processId: taskData.processId,
            processInstanceId: taskData.processInstanceId,
            stepId: taskData.stepId,
            dealId: taskData.dealId
        };
        updatedTasks = [...tasks, newTask];
        
        if (currentUser) {
            const assigneeUser = users.find(u => u.id === newTask.assigneeId);
            const assigneeName = assigneeUser ? assigneeUser.name : 'Не назначено';
            const projectName = projects.find(p => p.id === newTask.projectId)?.name || null;
            
            if (notificationPrefs.newTask.telegram) {
                sendTelegramNotification(formatNewTaskMessage(newTask.title, newTask.priority, newTask.endDate, assigneeName, projectName)).catch(console.error);
            }
            processAutomation(newTask, 'new_task');
        }
    }
    setTasks(updatedTasks); 
    api.tasks.updateAll(updatedTasks); 
    setIsTaskModalOpen(false);
  };

  const addTaskComment = (taskId: string, text: string, isSystem: boolean = false) => {
      if (!currentUser) return;
      const comment: TaskComment = {
          id: `tc-${Date.now()}`,
          taskId,
          userId: currentUser.id,
          text,
          createdAt: new Date().toISOString(),
          isSystem
      };
      
      const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
              return { ...t, comments: [...(t.comments || []), comment] };
          }
          return t;
      });
      setTasks(updatedTasks);
      api.tasks.updateAll(updatedTasks);
      if (editingTask && editingTask.id === taskId) {
          setEditingTask({ ...editingTask, comments: [...(editingTask.comments || []), comment] });
      }
  };

  const addTaskAttachment = (taskId: string, file: File) => {
      const attachment: TaskAttachment = {
          id: `att-${Date.now()}`,
          taskId,
          name: file.name,
          url: '#', 
          type: file.type.split('/')[0] || 'file',
          uploadedAt: new Date().toISOString()
      };

      const updatedTasks = tasks.map(t => {
          if (t.id === taskId) {
              return { ...t, attachments: [...(t.attachments || []), attachment] };
          }
          return t;
      });
      setTasks(updatedTasks);
      api.tasks.updateAll(updatedTasks);
      
      if (editingTask && editingTask.id === taskId) {
          setEditingTask({ ...editingTask, attachments: [...(editingTask.attachments || []), attachment] });
      }
      addTaskComment(taskId, `Прикрепил файл: ${file.name}`, true);
  };

  const deleteTask = (taskId: string) => {
      const updated = tasks.map(t => t.id === taskId ? { ...t, isArchived: true } : t);
      setTasks(updated);
      api.tasks.updateAll(updated);
      setIsTaskModalOpen(false);
      showNotification('Задача в архиве');
  };

  const restoreTask = (taskId: string) => {
      const updated = tasks.map(t => t.id === taskId ? { ...t, isArchived: false } : t);
      setTasks(updated);
      api.tasks.updateAll(updated);
      showNotification('Задача восстановлена');
  };

  const permanentDeleteTask = (taskId: string) => {
      const updated = tasks.filter(t => t.id !== taskId);
      setTasks(updated);
      api.tasks.updateAll(updated);
      showNotification('Задача удалена навсегда');
  };

  return {
    state: { tasks, projects, statuses, priorities, isTaskModalOpen, editingTask },
    setters: { setTasks, setProjects, setStatuses, setPriorities },
    actions: {
        updateProjects, updateStatuses, updatePriorities, quickCreateProject,
        saveTask, deleteTask, restoreTask, permanentDeleteTask,
        addTaskComment, addTaskAttachment,
        openTaskModal: (task: Partial<Task> | null) => { setEditingTask(task); setIsTaskModalOpen(true); },
        closeTaskModal: () => setIsTaskModalOpen(false)
    }
  };
};

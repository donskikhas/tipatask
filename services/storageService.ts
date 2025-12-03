
import { Doc, Project, Role, TableCollection, Task, User, Meeting, ActivityLog, StatusOption, PriorityOption, ContentPost, Client, EmployeeInfo, Contract, Folder, Deal, NotificationPreferences, Department, FinanceCategory, FinancePlan, PurchaseRequest, OrgPosition, BusinessProcess, AutomationRule, Warehouse, InventoryItem, StockMovement } from "../types";
import { FIREBASE_DB_URL, MOCK_PROJECTS, MOCK_TABLES, DEFAULT_STATUSES, DEFAULT_PRIORITIES, DEFAULT_NOTIFICATION_PREFS, MOCK_DEPARTMENTS, DEFAULT_FINANCE_CATEGORIES, MOCK_ORG_POSITIONS, DEFAULT_AUTOMATION_RULES, TELEGRAM_BOT_TOKEN } from "../constants";

const STORAGE_KEYS = {
  USERS: 'cfo_users',
  TASKS: 'cfo_tasks',
  PROJECTS: 'cfo_projects',
  TABLES: 'cfo_tables',
  DOCS: 'cfo_docs',
  FOLDERS: 'cfo_folders',
  MEETINGS: 'cfo_meetings',
  CONTENT_POSTS: 'cfo_content_posts',
  ACTIVITY: 'cfo_activity',
  
  // Auth Session
  ACTIVE_USER_ID: 'cfo_active_user_session',

  TELEGRAM_CHAT_ID: 'cfo_telegram_chat_id',
  TELEGRAM_EMPLOYEE_TOKEN: 'cfo_telegram_employee_token',
  TELEGRAM_CLIENT_TOKEN: 'cfo_telegram_client_token',

  STATUSES: 'cfo_statuses',
  PRIORITIES: 'cfo_priorities',
  CLIENTS: 'cfo_clients',
  CONTRACTS: 'cfo_contracts',
  EMPLOYEE_INFOS: 'cfo_employee_infos',
  DEALS: 'cfo_deals',
  NOTIFICATION_PREFS: 'cfo_notification_prefs',
  // Finance
  DEPARTMENTS: 'cfo_departments',
  FINANCE_CATEGORIES: 'cfo_finance_categories',
  FINANCE_PLAN: 'cfo_finance_plan',
  PURCHASE_REQUESTS: 'cfo_purchase_requests',
  // BPM
  ORG_POSITIONS: 'cfo_org_positions',
  BUSINESS_PROCESSES: 'cfo_business_processes',
  // Automation
  AUTOMATION_RULES: 'cfo_automation_rules',
  // Inventory
  WAREHOUSES: 'cfo_warehouses',
  INVENTORY_ITEMS: 'cfo_inventory_items',
  STOCK_MOVEMENTS: 'cfo_stock_movements',
  // Integrations
  LAST_TELEGRAM_UPDATE_ID: 'cfo_last_telegram_update_id',
  ENABLE_TELEGRAM_IMPORT: 'cfo_enable_telegram_import',
};

const getLocal = <T>(key: string, seed: T): T => {
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
        return JSON.parse(stored);
    } catch (e) {
        return seed;
    }
  }
  return seed;
};

const setLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Helper to convert Firebase Objects (from POST requests) to Arrays
const normalizeArray = <T>(data: any): T[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'object') {
        // If data is { "key1": val1, "key2": val2 }, return [val1, val2]
        return Object.values(data);
    }
    return [];
};

export const storageService = {
  getDbUrl: () => FIREBASE_DB_URL,
  
  // Session Management
  getActiveUserId: (): string | null => localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID),
  setActiveUserId: (id: string) => localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, id),
  clearActiveUserId: () => localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID),

  getTelegramChatId: (): string => localStorage.getItem(STORAGE_KEYS.TELEGRAM_CHAT_ID) || '',
  setTelegramChatId: (id: string) => localStorage.setItem(STORAGE_KEYS.TELEGRAM_CHAT_ID, id),

  // Bot Tokens
  getEmployeeBotToken: (): string => localStorage.getItem(STORAGE_KEYS.TELEGRAM_EMPLOYEE_TOKEN) || TELEGRAM_BOT_TOKEN,
  setEmployeeBotToken: (t: string) => localStorage.setItem(STORAGE_KEYS.TELEGRAM_EMPLOYEE_TOKEN, t),
  
  getClientBotToken: (): string => localStorage.getItem(STORAGE_KEYS.TELEGRAM_CLIENT_TOKEN) || '',
  setClientBotToken: (t: string) => localStorage.setItem(STORAGE_KEYS.TELEGRAM_CLIENT_TOKEN, t),

  // Telegram Direct Integration Settings
  getLastTelegramUpdateId: (): number => getLocal(STORAGE_KEYS.LAST_TELEGRAM_UPDATE_ID, 0),
  setLastTelegramUpdateId: (id: number) => setLocal(STORAGE_KEYS.LAST_TELEGRAM_UPDATE_ID, id),

  // Inventory Local Accessors
  getWarehouses: (): Warehouse[] => getLocal(STORAGE_KEYS.WAREHOUSES, []),
  setWarehouses: (warehouses: Warehouse[]) => { setLocal(STORAGE_KEYS.WAREHOUSES, warehouses); storageService.saveToCloud(); },
  getInventoryItems: (): InventoryItem[] => getLocal(STORAGE_KEYS.INVENTORY_ITEMS, []),
  setInventoryItems: (items: InventoryItem[]) => { setLocal(STORAGE_KEYS.INVENTORY_ITEMS, items); storageService.saveToCloud(); },
  getStockMovements: (): StockMovement[] => getLocal(STORAGE_KEYS.STOCK_MOVEMENTS, []),
  setStockMovements: (movements: StockMovement[]) => { setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, movements); storageService.saveToCloud(); },
  
  getEnableTelegramImport: (): boolean => getLocal(STORAGE_KEYS.ENABLE_TELEGRAM_IMPORT, false),
  setEnableTelegramImport: (enabled: boolean) => setLocal(STORAGE_KEYS.ENABLE_TELEGRAM_IMPORT, enabled),

  loadFromCloud: async () => {
      const url = FIREBASE_DB_URL;
      if (!url) return false;

      try {
          const fetchUrl = url.endsWith('/') ? `${url}.json` : `${url}/.json`;
          const res = await fetch(fetchUrl);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          if (data) {
              let hasChanges = false;
              
              // Проверяем изменения в задачах (самое важное для синхронизации статусов)
              if (data.tasks) {
                  const normalizedTasks = normalizeArray(data.tasks);
                  const currentTasks = getLocal(STORAGE_KEYS.TASKS, []);
                  // Сравниваем задачи по ID и статусам
                  const currentTasksMap = new Map(currentTasks.map(t => [t.id, t]));
                  const cloudTasksMap = new Map(normalizedTasks.map(t => [t.id, t]));
                  
                  let hasTaskChanges = false;
                  const mergedTasks: Task[] = [];
                  
                  // Объединяем: приоритет локальным изменениям, если задача существует локально
                  const allTaskIds = new Set([...currentTasksMap.keys(), ...cloudTasksMap.keys()]);
                  allTaskIds.forEach(taskId => {
                      const localTask = currentTasksMap.get(taskId);
                      const cloudTask = cloudTasksMap.get(taskId);
                      
                      if (localTask && cloudTask) {
                          // Если статусы разные, всегда приоритет локальной версии (пользователь только что изменил)
                          if (localTask.status !== cloudTask.status) {
                              mergedTasks.push(localTask);
                              hasTaskChanges = true;
                          } else {
                              // Статусы одинаковые, но если есть другие различия - объединяем (приоритет локальным полям)
                              const merged = { ...cloudTask, ...localTask, status: localTask.status };
                              mergedTasks.push(merged);
                              if (JSON.stringify(localTask) !== JSON.stringify(cloudTask)) {
                                  hasTaskChanges = true;
                              }
                          }
                      } else if (localTask) {
                          // Локальная задача есть, но в облаке нет - это новая задача, сохраняем её
                          mergedTasks.push(localTask);
                          // Не помечаем как изменение, чтобы не перезаписывать при следующей синхронизации
                      } else if (cloudTask) {
                          // Задача есть только в облаке - добавляем её
                          mergedTasks.push(cloudTask);
                          hasTaskChanges = true;
                      }
                  });
                  
                  if (hasTaskChanges) {
                      setLocal(STORAGE_KEYS.TASKS, mergedTasks);
                      hasChanges = true;
                  }
              }
              
              if (data.users) {
                  const normalized = normalizeArray(data.users);
                  const current = getLocal(STORAGE_KEYS.USERS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.USERS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.projects) {
                  const normalized = normalizeArray(data.projects);
                  const current = getLocal(STORAGE_KEYS.PROJECTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.PROJECTS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.tables) {
                  const normalized = normalizeArray(data.tables);
                  const current = getLocal(STORAGE_KEYS.TABLES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.TABLES, normalized);
                      hasChanges = true;
                  }
              }
              if (data.docs) {
                  const normalized = normalizeArray(data.docs);
                  const current = getLocal(STORAGE_KEYS.DOCS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.DOCS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.folders) {
                  const normalized = normalizeArray(data.folders);
                  const current = getLocal(STORAGE_KEYS.FOLDERS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.FOLDERS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.meetings) {
                  const normalized = normalizeArray(data.meetings);
                  const current = getLocal(STORAGE_KEYS.MEETINGS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.MEETINGS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.contentPosts) {
                  const normalized = normalizeArray(data.contentPosts);
                  const current = getLocal(STORAGE_KEYS.CONTENT_POSTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.CONTENT_POSTS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.activity) {
                  const normalized = normalizeArray(data.activity);
                  const current = getLocal(STORAGE_KEYS.ACTIVITY, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.ACTIVITY, normalized);
                      hasChanges = true;
                  }
              }
              if (data.statuses) {
                  const normalized = normalizeArray(data.statuses);
                  const current = getLocal(STORAGE_KEYS.STATUSES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.STATUSES, normalized);
                      hasChanges = true;
                  }
              }
              if (data.priorities) {
                  const normalized = normalizeArray(data.priorities);
                  const current = getLocal(STORAGE_KEYS.PRIORITIES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.PRIORITIES, normalized);
                      hasChanges = true;
                  }
              }
              
              // CRM & Finance
              if (data.clients) {
                  const normalized = normalizeArray(data.clients);
                  const current = getLocal(STORAGE_KEYS.CLIENTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.CLIENTS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.contracts) {
                  const normalized = normalizeArray(data.contracts);
                  const current = getLocal(STORAGE_KEYS.CONTRACTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.CONTRACTS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.employeeInfos) {
                  const normalized = normalizeArray(data.employeeInfos);
                  const current = getLocal(STORAGE_KEYS.EMPLOYEE_INFOS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.EMPLOYEE_INFOS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.deals) {
                  const normalized = normalizeArray(data.deals);
                  const current = getLocal(STORAGE_KEYS.DEALS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.DEALS, normalized);
                      hasChanges = true;
                  }
              }
              
              if (data.notificationPrefs) {
                  const current = getLocal(STORAGE_KEYS.NOTIFICATION_PREFS, DEFAULT_NOTIFICATION_PREFS);
                  if (JSON.stringify(data.notificationPrefs) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.NOTIFICATION_PREFS, data.notificationPrefs);
                      hasChanges = true;
                  }
              }
              
              // Finance
              if (data.departments) {
                  const normalized = normalizeArray(data.departments);
                  const current = getLocal(STORAGE_KEYS.DEPARTMENTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.DEPARTMENTS, normalized);
                      hasChanges = true;
                  }
              }

              // Inventory
              if (data.warehouses) {
                  const normalized = normalizeArray(data.warehouses);
                  const current = getLocal(STORAGE_KEYS.WAREHOUSES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.WAREHOUSES, normalized);
                      hasChanges = true;
                  }
              }
              if (data.inventoryItems) {
                  const normalized = normalizeArray(data.inventoryItems);
                  const current = getLocal(STORAGE_KEYS.INVENTORY_ITEMS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.INVENTORY_ITEMS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.stockMovements) {
                  const normalized = normalizeArray(data.stockMovements);
                  const current = getLocal(STORAGE_KEYS.STOCK_MOVEMENTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.STOCK_MOVEMENTS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.financeCategories) {
                  const normalized = normalizeArray(data.financeCategories);
                  const current = getLocal(STORAGE_KEYS.FINANCE_CATEGORIES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.FINANCE_CATEGORIES, normalized);
                      hasChanges = true;
                  }
              }
              if (data.financePlan) {
                  const current = getLocal(STORAGE_KEYS.FINANCE_PLAN, null);
                  if (JSON.stringify(data.financePlan) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.FINANCE_PLAN, data.financePlan);
                      hasChanges = true;
                  }
              }
              if (data.purchaseRequests) {
                  const normalized = normalizeArray(data.purchaseRequests);
                  const current = getLocal(STORAGE_KEYS.PURCHASE_REQUESTS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.PURCHASE_REQUESTS, normalized);
                      hasChanges = true;
                  }
              }
              // BPM
              if (data.orgPositions) {
                  const normalized = normalizeArray(data.orgPositions);
                  const current = getLocal(STORAGE_KEYS.ORG_POSITIONS, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.ORG_POSITIONS, normalized);
                      hasChanges = true;
                  }
              }
              if (data.businessProcesses) {
                  const normalized = normalizeArray(data.businessProcesses);
                  const current = getLocal(STORAGE_KEYS.BUSINESS_PROCESSES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.BUSINESS_PROCESSES, normalized);
                      hasChanges = true;
                  }
              }
              // Automation
              if (data.automationRules) {
                  const normalized = normalizeArray(data.automationRules);
                  const current = getLocal(STORAGE_KEYS.AUTOMATION_RULES, []);
                  if (JSON.stringify(normalized) !== JSON.stringify(current)) {
                      setLocal(STORAGE_KEYS.AUTOMATION_RULES, normalized);
                      hasChanges = true;
                  }
              }
              
              return hasChanges;
          }
      } catch (e) {
          console.error("Cloud Load Error:", e);
      }
      return false;
  },

  saveToCloud: async () => {
      const url = FIREBASE_DB_URL;
      if (!url) {
          console.warn("Firebase URL не настроен! Проверьте .env.local файл с VITE_FIREBASE_DB_URL");
          return;
      }

      const fullState = {
          users: getLocal(STORAGE_KEYS.USERS, []),
          tasks: getLocal(STORAGE_KEYS.TASKS, []),
          projects: getLocal(STORAGE_KEYS.PROJECTS, []),
          tables: getLocal(STORAGE_KEYS.TABLES, []),
          docs: getLocal(STORAGE_KEYS.DOCS, []),
          folders: getLocal(STORAGE_KEYS.FOLDERS, []),
          meetings: getLocal(STORAGE_KEYS.MEETINGS, []),
          contentPosts: getLocal(STORAGE_KEYS.CONTENT_POSTS, []),
          activity: getLocal(STORAGE_KEYS.ACTIVITY, []),
          statuses: getLocal(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES),
          priorities: getLocal(STORAGE_KEYS.PRIORITIES, DEFAULT_PRIORITIES),
          clients: getLocal(STORAGE_KEYS.CLIENTS, []),
          contracts: getLocal(STORAGE_KEYS.CONTRACTS, []),
          employeeInfos: getLocal(STORAGE_KEYS.EMPLOYEE_INFOS, []),
          deals: getLocal(STORAGE_KEYS.DEALS, []),
          notificationPrefs: getLocal(STORAGE_KEYS.NOTIFICATION_PREFS, DEFAULT_NOTIFICATION_PREFS),
          // Finance
          departments: getLocal(STORAGE_KEYS.DEPARTMENTS, []),
          financeCategories: getLocal(STORAGE_KEYS.FINANCE_CATEGORIES, DEFAULT_FINANCE_CATEGORIES),
          financePlan: getLocal(STORAGE_KEYS.FINANCE_PLAN, null),
          purchaseRequests: getLocal(STORAGE_KEYS.PURCHASE_REQUESTS, []),
          // BPM
          orgPositions: getLocal(STORAGE_KEYS.ORG_POSITIONS, []),
          businessProcesses: getLocal(STORAGE_KEYS.BUSINESS_PROCESSES, []),
          // Automation
          automationRules: getLocal(STORAGE_KEYS.AUTOMATION_RULES, []),
          // Inventory
          warehouses: getLocal(STORAGE_KEYS.WAREHOUSES, []),
          inventoryItems: getLocal(STORAGE_KEYS.INVENTORY_ITEMS, []),
          stockMovements: getLocal(STORAGE_KEYS.STOCK_MOVEMENTS, []),
      };

      try {
          const fetchUrl = url.endsWith('/') ? `${url}.json` : `${url}/.json`;
          console.log("Сохраняю в Firebase:", fetchUrl, "Задач:", fullState.tasks.length);
          const response = await fetch(fetchUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(fullState)
          });
          if (!response.ok) {
              console.error("Cloud Save Error: HTTP", response.status, response.statusText);
              const errorText = await response.text();
              console.error("Error details:", errorText);
          } else {
              console.log("✅ Успешно сохранено в Firebase");
          }
      } catch (e) {
          console.error("Cloud Save Error:", e);
      }
  },

  getUsers: (): User[] => getLocal(STORAGE_KEYS.USERS, []), // Пользователи загружаются только из Firebase
  getTasks: (): Task[] => getLocal(STORAGE_KEYS.TASKS, []),
  getProjects: (): Project[] => getLocal(STORAGE_KEYS.PROJECTS, MOCK_PROJECTS),
  getTables: (): TableCollection[] => getLocal(STORAGE_KEYS.TABLES, MOCK_TABLES),
  getDocs: (): Doc[] => getLocal(STORAGE_KEYS.DOCS, []),
  getFolders: (): Folder[] => getLocal(STORAGE_KEYS.FOLDERS, []),
  getMeetings: (): Meeting[] => getLocal(STORAGE_KEYS.MEETINGS, []),
  getContentPosts: (): ContentPost[] => getLocal(STORAGE_KEYS.CONTENT_POSTS, []),
  getActivities: (): ActivityLog[] => getLocal(STORAGE_KEYS.ACTIVITY, []),
  getStatuses: (): StatusOption[] => getLocal(STORAGE_KEYS.STATUSES, DEFAULT_STATUSES),
  getPriorities: (): PriorityOption[] => getLocal(STORAGE_KEYS.PRIORITIES, DEFAULT_PRIORITIES),
  getClients: (): Client[] => getLocal(STORAGE_KEYS.CLIENTS, []),
  getContracts: (): Contract[] => getLocal(STORAGE_KEYS.CONTRACTS, []),
  getEmployeeInfos: (): EmployeeInfo[] => getLocal(STORAGE_KEYS.EMPLOYEE_INFOS, []),
  getDeals: (): Deal[] => getLocal(STORAGE_KEYS.DEALS, []),
  getNotificationPrefs: (): NotificationPreferences => getLocal(STORAGE_KEYS.NOTIFICATION_PREFS, DEFAULT_NOTIFICATION_PREFS),
  
  // Finance Getters
  getDepartments: (): Department[] => getLocal(STORAGE_KEYS.DEPARTMENTS, MOCK_DEPARTMENTS),
  getFinanceCategories: (): FinanceCategory[] => getLocal(STORAGE_KEYS.FINANCE_CATEGORIES, DEFAULT_FINANCE_CATEGORIES),
  getFinancePlan: (): FinancePlan | null => getLocal(STORAGE_KEYS.FINANCE_PLAN, { id: 'current', period: 'month', salesPlan: 0, currentIncome: 0 }),
  getPurchaseRequests: (): PurchaseRequest[] => getLocal(STORAGE_KEYS.PURCHASE_REQUESTS, []),

  // BPM Getters
  getOrgPositions: (): OrgPosition[] => getLocal(STORAGE_KEYS.ORG_POSITIONS, MOCK_ORG_POSITIONS),
  getBusinessProcesses: (): BusinessProcess[] => getLocal(STORAGE_KEYS.BUSINESS_PROCESSES, []),

  // Automation
  getAutomationRules: (): AutomationRule[] => getLocal(STORAGE_KEYS.AUTOMATION_RULES, DEFAULT_AUTOMATION_RULES),

  setUsers: (users: User[]) => { setLocal(STORAGE_KEYS.USERS, users); storageService.saveToCloud(); },
  setTasks: (tasks: Task[]) => { 
    setLocal(STORAGE_KEYS.TASKS, tasks); 
    // Сохраняем в Firebase асинхронно
    storageService.saveToCloud().catch(err => console.error('Failed to save tasks to cloud:', err)); 
  },
  setProjects: (projects: Project[]) => { setLocal(STORAGE_KEYS.PROJECTS, projects); storageService.saveToCloud(); },
  setTables: (tables: TableCollection[]) => { setLocal(STORAGE_KEYS.TABLES, tables); storageService.saveToCloud(); },
  setDocs: (docs: Doc[]) => { setLocal(STORAGE_KEYS.DOCS, docs); storageService.saveToCloud(); },
  setFolders: (folders: Folder[]) => { setLocal(STORAGE_KEYS.FOLDERS, folders); storageService.saveToCloud(); },
  setMeetings: (meetings: Meeting[]) => { setLocal(STORAGE_KEYS.MEETINGS, meetings); storageService.saveToCloud(); },
  setContentPosts: (posts: ContentPost[]) => { setLocal(STORAGE_KEYS.CONTENT_POSTS, posts); storageService.saveToCloud(); },
  setActivities: (logs: ActivityLog[]) => { setLocal(STORAGE_KEYS.ACTIVITY, logs); storageService.saveToCloud(); },
  setStatuses: (statuses: StatusOption[]) => { setLocal(STORAGE_KEYS.STATUSES, statuses); storageService.saveToCloud(); },
  setPriorities: (priorities: PriorityOption[]) => { setLocal(STORAGE_KEYS.PRIORITIES, priorities); storageService.saveToCloud(); },
  setClients: (clients: Client[]) => { setLocal(STORAGE_KEYS.CLIENTS, clients); storageService.saveToCloud(); },
  setContracts: (contracts: Contract[]) => { setLocal(STORAGE_KEYS.CONTRACTS, contracts); storageService.saveToCloud(); },
  setEmployeeInfos: (infos: EmployeeInfo[]) => { setLocal(STORAGE_KEYS.EMPLOYEE_INFOS, infos); storageService.saveToCloud(); },
  setDeals: (deals: Deal[]) => { setLocal(STORAGE_KEYS.DEALS, deals); storageService.saveToCloud(); },
  setNotificationPrefs: (prefs: NotificationPreferences) => { setLocal(STORAGE_KEYS.NOTIFICATION_PREFS, prefs); storageService.saveToCloud(); },
  
  // Finance Setters
  setDepartments: (deps: Department[]) => { setLocal(STORAGE_KEYS.DEPARTMENTS, deps); storageService.saveToCloud(); },
  setFinanceCategories: (cats: FinanceCategory[]) => { setLocal(STORAGE_KEYS.FINANCE_CATEGORIES, cats); storageService.saveToCloud(); },
  setFinancePlan: (plan: FinancePlan) => { setLocal(STORAGE_KEYS.FINANCE_PLAN, plan); storageService.saveToCloud(); },
  setPurchaseRequests: (reqs: PurchaseRequest[]) => { setLocal(STORAGE_KEYS.PURCHASE_REQUESTS, reqs); storageService.saveToCloud(); },

  // BPM Setters
  setOrgPositions: (ops: OrgPosition[]) => { setLocal(STORAGE_KEYS.ORG_POSITIONS, ops); storageService.saveToCloud(); },
  setBusinessProcesses: (bps: BusinessProcess[]) => { setLocal(STORAGE_KEYS.BUSINESS_PROCESSES, bps); storageService.saveToCloud(); },

  // Automation Setters
  setAutomationRules: (rules: AutomationRule[]) => { setLocal(STORAGE_KEYS.AUTOMATION_RULES, rules); storageService.saveToCloud(); },

  addActivity: (log: ActivityLog) => {
      const logs = getLocal<ActivityLog[]>(STORAGE_KEYS.ACTIVITY, []);
      const newLogs = [log, ...logs].slice(0, 100); 
      setLocal(STORAGE_KEYS.ACTIVITY, newLogs);
      storageService.saveToCloud();
      return newLogs;
  },
};

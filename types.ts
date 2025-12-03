
export enum Role {
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export enum ViewMode {
  TABLE = 'table',
  KANBAN = 'kanban',
  GANTT = 'gantt',
}

export interface StatusOption {
    id: string;
    name: string;
    color: string; // Tailwind class
}

export interface PriorityOption {
    id: string;
    name: string;
    color: string; // Tailwind class
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar?: string;
  login?: string; 
  email?: string;
  phone?: string;
  telegram?: string;
  password?: string;
  mustChangePassword?: boolean;
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface Contract {
  id: string;
  clientId: string;
  number: string; 
  startDate: string;
  endDate?: string;
  amount: number;
  currency: string; 
  status: 'active' | 'completed' | 'pending';
  paymentDay: number; 
  services: string; 
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  type?: 'internal' | 'telegram_in' | 'telegram_out'; // New field for chat context
}

export interface Deal {
  id: string;
  title: string;
  clientId?: string; 
  contactName?: string; 
  amount: number;
  currency: string; 
  stage: 'new' | 'qualification' | 'proposal' | 'negotiation' | 'won' | 'lost';
  source?: 'instagram' | 'telegram' | 'site' | 'manual' | 'recommendation'; // Lead Source
  telegramChatId?: string; // For chatting with lead
  telegramUsername?: string;
  assigneeId: string;
  createdAt: string;
  notes?: string; // Комментарии к сделке
  projectId?: string; // Вид услуг (модуль/проект)
  comments?: Comment[];
}

export interface Department {
    id: string;
    name: string;
    headId?: string; 
    description?: string;
}

export interface EmployeeInfo {
  id: string;
  userId: string; 
  departmentId?: string; 
  position: string;
  salary: string;
  hireDate: string;
  birthDate?: string;
  conditions?: string;
}

// --- BPM TYPES ---

export interface OrgPosition {
    id: string;
    title: string;
    departmentId?: string;
    managerPositionId?: string; 
    holderUserId?: string; 
}

export interface ProcessStep {
    id: string;
    title: string;
    description?: string;
    assigneeType: 'user' | 'position';
    assigneeId: string; 
    order: number;
}

export interface ProcessInstance {
    id: string;
    processId: string;
    currentStepId: string | null; // Текущий активный шаг
    status: 'active' | 'completed' | 'paused';
    startedAt: string;
    completedAt?: string;
    taskIds: string[]; // ID задач, созданных для этого экземпляра
}

export interface BusinessProcess {
    id: string;
    title: string;
    description?: string;
    steps: ProcessStep[];
    instances?: ProcessInstance[]; // Экземпляры запущенных процессов
}

// --- AUTOMATION TYPES ---

export type TriggerType = 'status_change' | 'new_task';
export type ActionType = 'telegram_message';

export interface TelegramButtonConfig {
    label: string;
    action: 'change_status'; 
    value: string; 
}

export interface AutomationRule {
    id: string;
    name: string;
    isActive: boolean;
    trigger: TriggerType;
    conditions: {
        moduleId?: string; 
        statusTo?: string; 
    };
    action: {
        type: ActionType;
        template: string; 
        buttons?: TelegramButtonConfig[];
        targetUser: 'assignee' | 'creator' | 'admin' | 'specific';
        specificUserId?: string;
    };
}

// ----------------

export interface Project {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: string;
    isSystem?: boolean; 
}

export interface TaskAttachment {
    id: string;
    taskId: string;
    name: string;
    url: string; 
    type: string; 
    uploadedAt: string;
}

export interface Task {
  id: string;
  tableId: string;
  title: string;
  status: string; 
  priority: string; 
  assigneeId: string | null;
  assigneeIds?: string[]; 
  projectId: string | null;
  startDate: string;
  endDate: string;
  description?: string;
  isArchived?: boolean;
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  contentPostId?: string; // LINK TO CONTENT PLAN POST
  processId?: string; // Связь с бизнес-процессом
  processInstanceId?: string; // ID экземпляра процесса
  stepId?: string; // ID шага процесса
  dealId?: string; // Связь со сделкой
}

export interface Meeting {
  id: string;
  tableId: string;
  title: string;
  date: string;
  time: string;
  participantIds: string[];
  summary: string;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface ContentPost {
  id: string;
  tableId: string;
  topic: string; 
  date: string;
  platform: string[]; 
  format: 'post' | 'reel' | 'story' | 'article' | 'video';
  status: 'idea' | 'copywriting' | 'design' | 'approval' | 'scheduled' | 'published';
  copy?: string; 
  mediaUrl?: string;
}

export interface TableCollection {
  id: string;
  name: string;
  type: 'tasks' | 'docs' | 'meetings' | 'content-plan' | 'backlog' | 'functionality';
  icon: string;
  color?: string;
  isSystem?: boolean;
}

export interface Folder {
  id: string;
  tableId: string;
  name: string;
}

export interface Doc {
  id: string;
  tableId: string;
  folderId?: string; 
  title: string;
  type: 'link' | 'internal';
  url?: string;
  content?: string;
  tags: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  details: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationSetting {
    app: boolean;
    telegram: boolean;
}

export interface NotificationPreferences {
    newTask: NotificationSetting;
    statusChange: NotificationSetting;
}

// --- FINANCE TYPES ---

export interface FinanceCategory {
    id: string;
    name: string;
    type: 'fixed' | 'percent'; 
    value: number; 
    color?: string;
}

export interface FinancePlan {
    id: string; 
    period: 'week' | 'month';
    salesPlan: number; 
    currentIncome: number; 
}

export interface PurchaseRequest {
    id: string;
    requesterId: string;
    departmentId: string;
    categoryId: string; 
    amount: number;
    description: string;
    status: 'pending' | 'approved' | 'rejected' | 'deferred';
    date: string;
    decisionDate?: string;
}

// --- INVENTORY TYPES ---

export interface Warehouse {
  id: string;
  name: string;
  departmentId?: string;
  location?: string;
  isDefault?: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category?: string;
  notes?: string;
}

export type StockMovementType = 'receipt' | 'transfer' | 'writeoff' | 'adjustment';

export interface StockMovementItem {
  itemId: string;
  quantity: number;
  price?: number;
}

export interface StockMovement {
  id: string;
  type: StockMovementType;
  date: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  items: StockMovementItem[];
  reason?: string;
  createdByUserId: string;
}

export interface StockBalance {
  warehouseId: string;
  itemId: string;
  quantity: number;
}

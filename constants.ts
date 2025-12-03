
import { Project, Role, TableCollection, Task, User, Doc, StatusOption, PriorityOption, NotificationPreferences, Department, FinanceCategory, OrgPosition, AutomationRule } from "./types";

// URL Firebase и токен бота теперь читаем из окружения, чтобы ты мог использовать свой проект.
// В .env.local можно задать:
// VITE_FIREBASE_DB_URL=...
// VITE_TELEGRAM_BOT_TOKEN=...
export const TELEGRAM_BOT_TOKEN = (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '';
export const FIREBASE_DB_URL: string = (import.meta as any).env?.VITE_FIREBASE_DB_URL || '';

// Логируем для отладки
if (!FIREBASE_DB_URL) {
    console.warn("⚠️ FIREBASE_DB_URL не настроен! Добавьте VITE_FIREBASE_DB_URL в .env.local");
} else {
    console.log("✅ Firebase URL настроен:", FIREBASE_DB_URL.substring(0, 50) + "...");
}
export const TELEGRAM_CHAT_ID = '-1002719375477'; 

export const ICON_OPTIONS = ['Bug', 'CheckSquare', 'Target', 'FileText', 'Users', 'Briefcase', 'Zap', 'Star', 'Heart', 'Flag', 'Rocket', 'Layout'];
export const COLOR_OPTIONS = [ 'text-gray-500', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-600', 'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-indigo-500' ];

export const DEFAULT_STATUSES: StatusOption[] = [
    { id: 's1', name: 'Не начато', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
    { id: 's2', name: 'В работе', color: 'bg-blue-500 dark:bg-blue-600 text-white border border-blue-600 dark:border-blue-500' },
    { id: 's3', name: 'На проверке', color: 'bg-amber-500 dark:bg-amber-600 text-white border border-amber-600 dark:border-amber-500' },
    { id: 's4', name: 'Выполнено', color: 'bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-500' },
];

export const DEFAULT_PRIORITIES: PriorityOption[] = [
    { id: 'p1', name: 'Низкий', color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' },
    { id: 'p2', name: 'Средний', color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' },
    { id: 'p3', name: 'Высокий', color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700' },
];

export const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
    newTask: { app: true, telegram: true },
    statusChange: { app: true, telegram: true }
};

export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
    {
        id: 'rule-1',
        name: 'Согласование договора',
        isActive: true,
        trigger: 'status_change',
        conditions: { statusTo: 'На проверке' },
        action: {
            type: 'telegram_message',
            targetUser: 'admin',
            template: '🔔 <b>Требует согласования:</b> {task_title}\n\nПожалуйста, проверьте документ.',
            buttons: [
                { label: '✅ Одобрить', action: 'change_status', value: 'Выполнено' },
                { label: '❌ Вернуть', action: 'change_status', value: 'В работе' }
            ]
        }
    }
];

export const LABEL_COLORS = [
    { name: 'Gray', class: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
    { name: 'Blue', class: 'bg-blue-500 dark:bg-blue-600 text-white border border-blue-600 dark:border-blue-500' },
    { name: 'Green', class: 'bg-emerald-500 dark:bg-emerald-600 text-white border border-emerald-600 dark:border-emerald-500' },
    { name: 'Yellow', class: 'bg-amber-500 dark:bg-amber-600 text-white border border-amber-600 dark:border-amber-500' },
    { name: 'Red', class: 'bg-rose-500 dark:bg-rose-600 text-white border border-rose-600 dark:border-rose-500' },
    { name: 'Purple', class: 'bg-violet-500 dark:bg-violet-600 text-white border border-violet-600 dark:border-violet-500' },
    { name: 'Pink', class: 'bg-pink-500 dark:bg-pink-600 text-white border border-pink-600 dark:border-pink-500' },
    { name: 'Indigo', class: 'bg-indigo-500 dark:bg-indigo-600 text-white border border-indigo-600 dark:border-indigo-500' },
    { name: 'Orange', class: 'bg-orange-500 dark:bg-orange-600 text-white border border-orange-600 dark:border-orange-500' },
    { name: 'Cyan', class: 'bg-cyan-500 dark:bg-cyan-600 text-white border border-cyan-600 dark:border-cyan-500' },
];

export const PRIORITY_COLORS = [
    { name: 'Green', class: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700' },
    { name: 'Orange', class: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700' },
    { name: 'Red', class: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700' },
    { name: 'Gray', class: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700' },
    { name: 'Blue', class: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700' },
    { name: 'Yellow', class: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700' },
];

// Пользователи теперь загружаются только из Firebase
export const MOCK_USERS: User[] = [];

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', name: 'Instagram', icon: 'Instagram', color: 'text-pink-500' },
  { id: 'p2', name: 'Сайт', icon: 'Layout', color: 'text-blue-500' },
  { id: 'p3', name: 'Маркетинг', icon: 'Megaphone', color: 'text-purple-500' },
];

export const MOCK_TABLES: TableCollection[] = [
  { id: 't2', name: 'Задачи', type: 'tasks', icon: 'CheckSquare', color: 'text-blue-500', isSystem: true },
  { id: 't4', name: 'Документы', type: 'docs', icon: 'FileText', color: 'text-yellow-500', isSystem: true },
  { id: 't5', name: 'Встречи', type: 'meetings', icon: 'Users', color: 'text-purple-500', isSystem: true },
];

export const MOCK_DEPARTMENTS: Department[] = [
    { id: 'dep1', name: 'Маркетинг' },
    { id: 'dep2', name: 'Продажи' },
    { id: 'dep3', name: 'IT / Разработка' },
];

export const MOCK_ORG_POSITIONS: OrgPosition[] = [
    { id: 'op1', title: 'Генеральный директор', holderUserId: 'u1' },
    { id: 'op2', title: 'Директор по маркетингу', departmentId: 'dep1', managerPositionId: 'op1' },
    { id: 'op3', title: 'РОП', departmentId: 'dep2', managerPositionId: 'op1' },
];

export const DEFAULT_FINANCE_CATEGORIES: FinanceCategory[] = [
    { id: 'fc1', name: 'ФОТ (Зарплаты)', type: 'percent', value: 40, color: 'bg-blue-100 text-blue-700' },
    { id: 'fc2', name: 'Налоги', type: 'percent', value: 12, color: 'bg-red-100 text-red-700' },
    { id: 'fc3', name: 'Реклама', type: 'percent', value: 15, color: 'bg-purple-100 text-purple-700' },
    { id: 'fc4', name: 'Аренда офиса', type: 'fixed', value: 5000000, color: 'bg-orange-100 text-orange-700' },
    { id: 'fc5', name: 'Сервисы / Софт', type: 'fixed', value: 1000000, color: 'bg-green-100 text-green-700' },
    { id: 'fc6', name: 'Дивиденды', type: 'percent', value: 10, color: 'bg-yellow-100 text-yellow-700' },
];

export const MOCK_TASKS: Task[] = [];
export const MOCK_DOCS: Doc[] = [];

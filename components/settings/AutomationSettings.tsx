
import React, { useState } from 'react';
import { AutomationRule, NotificationPreferences, StatusOption } from '../../types';
import { Zap, MessageSquare, Plus, Trash2, CheckSquare, Bell } from 'lucide-react';

interface AutomationSettingsProps {
  activeTab: string;
  automationRules: AutomationRule[];
  notificationPrefs: NotificationPreferences;
  statuses: StatusOption[];
  onSaveRule: (rule: AutomationRule) => void;
  onDeleteRule: (id: string) => void;
  onUpdatePrefs: (prefs: NotificationPreferences) => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({
    activeTab, automationRules, notificationPrefs, statuses,
    onSaveRule, onDeleteRule, onUpdatePrefs
}) => {
  // Automation Form
  const [autoName, setAutoName] = useState('');
  const [autoTrigger, setAutoTrigger] = useState<'status_change' | 'new_task'>('status_change');
  const [autoStatus, setAutoStatus] = useState(statuses[0]?.name || '');
  const [autoTemplate, setAutoTemplate] = useState('Задача "{task_title}" перешла в статус "{status}".');
  const [autoTarget, setAutoTarget] = useState<'assignee' | 'admin'>('assignee');

  const handleAutomationSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const rule: AutomationRule = {
          id: `rule-${Date.now()}`,
          name: autoName,
          isActive: true,
          trigger: autoTrigger,
          conditions: { statusTo: autoTrigger === 'status_change' ? autoStatus : undefined },
          action: { type: 'telegram_message', targetUser: autoTarget, template: autoTemplate, buttons: [] }
      };
      onSaveRule(rule);
      setAutoName('');
  };

  const handleTogglePref = (key: keyof NotificationPreferences, channel: 'app' | 'telegram') => {
      onUpdatePrefs({
          ...notificationPrefs,
          [key]: { ...notificationPrefs[key], [channel]: !notificationPrefs[key][channel] }
      });
  };

  if (activeTab === 'automation') {
      return (
          <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleAutomationSubmit} className="p-6 bg-gray-50 dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-[#333] space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-2">Создать правило</h3>
                  <input required value={autoName} onChange={e => setAutoName(e.target.value)} placeholder="Название правила" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100" />
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Когда (Триггер)</label>
                          <select value={autoTrigger} onChange={e => setAutoTrigger(e.target.value as any)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100">
                              <option value="status_change">Смена статуса</option>
                              <option value="new_task">Новая задача</option>
                          </select>
                      </div>
                      {autoTrigger === 'status_change' && (
                          <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Статус стал</label>
                              <select value={autoStatus} onChange={e => setAutoStatus(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100">
                                  {statuses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                              </select>
                          </div>
                      )}
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Действие (Отправить в Telegram)</label>
                      <textarea value={autoTemplate} onChange={e => setAutoTemplate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-[#252525] text-gray-900 dark:text-gray-100" rows={2} />
                      <p className="text-xs text-gray-400 mt-1">Доступные переменные: {'{task_title}'}, {'{status}'}, {'{priority}'}</p>
                  </div>

                  <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">Создать робота</button>
              </form>

              <div className="space-y-3">
                  {automationRules.map(rule => (
                      <div key={rule.id} className="border border-gray-200 dark:border-[#333] rounded-xl p-5 bg-white dark:bg-[#252525] hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                              <div className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                  <Zap size={18} className="text-yellow-500"/> {rule.name}
                              </div>
                              <button onClick={() => onDeleteRule(rule.id)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 size={16}/></button>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="flex items-center gap-2"><Zap size={14} className="text-blue-500"/> <span className="font-semibold">Если:</span> {rule.trigger === 'status_change' ? `Статус -> "${rule.conditions.statusTo}"` : 'Новая задача'}</div>
                              <div className="flex items-center gap-2"><MessageSquare size={14} className="text-green-500"/> <span className="font-semibold">То:</span> Отправить сообщение</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  }

  if (activeTab === 'notifications') {
      return (
          <div className="max-w-2xl bg-white dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333]">
              <h3 className="font-bold text-gray-800 dark:text-white mb-6">Настройки уведомлений</h3>
              <div className="space-y-6">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#333]">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Plus size={20}/></div>
                          <div><div className="font-bold text-gray-900 dark:text-white text-sm">Новая задача</div><div className="text-xs text-gray-500">Когда вас назначают ответственным</div></div>
                      </div>
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"><input type="checkbox" checked={notificationPrefs.newTask.app} onChange={() => handleTogglePref('newTask', 'app')} className="rounded text-blue-600 focus:ring-0"/> В системе</label>
                          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"><input type="checkbox" checked={notificationPrefs.newTask.telegram} onChange={() => handleTogglePref('newTask', 'telegram')} className="rounded text-blue-600 focus:ring-0"/> Telegram</label>
                      </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#333]">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg"><CheckSquare size={20}/></div>
                          <div><div className="font-bold text-gray-900 dark:text-white text-sm">Смена статуса</div><div className="text-xs text-gray-500">Когда статус вашей задачи меняется</div></div>
                      </div>
                      <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"><input type="checkbox" checked={notificationPrefs.statusChange.app} onChange={() => handleTogglePref('statusChange', 'app')} className="rounded text-blue-600 focus:ring-0"/> В системе</label>
                          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer"><input type="checkbox" checked={notificationPrefs.statusChange.telegram} onChange={() => handleTogglePref('statusChange', 'telegram')} className="rounded text-blue-600 focus:ring-0"/> Telegram</label>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return null;
};

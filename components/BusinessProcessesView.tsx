
import React, { useState } from 'react';
import { BusinessProcess, ProcessStep, OrgPosition, User, Task, ProcessInstance, TableCollection } from '../types';
import { Network, Plus, Edit2, Trash2, ChevronRight, User as UserIcon, Building2, Save, X, ArrowDown, Play, CheckCircle2, Clock, FileText } from 'lucide-react';

interface BusinessProcessesViewProps {
  processes: BusinessProcess[];
  orgPositions: OrgPosition[];
  users: User[];
  tasks: Task[];
  tables: TableCollection[];
  onSaveProcess: (proc: BusinessProcess) => void;
  onDeleteProcess: (id: string) => void;
  onSaveTask: (task: Partial<Task>) => void;
  onOpenTask: (task: Task) => void;
}

const BusinessProcessesView: React.FC<BusinessProcessesViewProps> = ({ 
    processes, orgPositions, users, tasks, tables, onSaveProcess, onDeleteProcess, onSaveTask, onOpenTask
}) => {
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  
  // Tabs: конструктор / журнал
  const [activeTab, setActiveTab] = useState<'designer' | 'journal'>('designer');
  const [showCompletedInJournal, setShowCompletedInJournal] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<BusinessProcess | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<ProcessStep[]>([]);

  const selectedProcess = processes.find(p => p.id === selectedProcessId);

  const handleOpenCreate = () => {
      setEditingProcess(null);
      setTitle(''); setDescription(''); setSteps([]);
      setIsModalOpen(true);
  };

  const handleOpenEdit = (proc: BusinessProcess) => {
      setEditingProcess(proc);
      setTitle(proc.title); setDescription(proc.description || ''); setSteps(proc.steps || []);
      setIsModalOpen(true);
  };

  const handleAddStep = () => {
      const newStep: ProcessStep = {
          id: `step-${Date.now()}`,
          title: '',
          description: '',
          assigneeType: 'position',
          assigneeId: '',
          order: steps.length
      };
      setSteps([...steps, newStep]);
  };

  const handleUpdateStep = (id: string, updates: Partial<ProcessStep>) => {
      setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveStep = (id: string) => {
      setSteps(steps.filter(s => s.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      onSaveProcess({
          id: editingProcess ? editingProcess.id : `bp-${Date.now()}`,
          title,
          description,
          steps
      });
      setIsModalOpen(false);
  };

  const handleDelete = () => {
      if(editingProcess && confirm('Удалить процесс?')) {
          onDeleteProcess(editingProcess.id);
          setIsModalOpen(false);
          if (selectedProcessId === editingProcess.id) setSelectedProcessId(null);
      }
  };

  const getAssigneeName = (step: ProcessStep) => {
      if (step.assigneeType === 'position') {
          return orgPositions.find(p => p.id === step.assigneeId)?.title || 'Неизвестная должность';
      } else {
          return users.find(u => u.id === step.assigneeId)?.name || 'Неизвестный сотрудник';
      }
  };

  const getAssigneeId = (step: ProcessStep): string | null => {
      if (step.assigneeType === 'position') {
          const position = orgPositions.find(p => p.id === step.assigneeId);
          return position?.holderUserId || null;
      } else {
          return step.assigneeId || null;
      }
  };

  const handleStartProcess = () => {
      if (!selectedProcess || selectedProcess.steps.length === 0) return;
      
      const firstStep = selectedProcess.steps[0];
      const assigneeId = getAssigneeId(firstStep);
      
      if (!assigneeId) {
          alert('Не назначен исполнитель для первого шага');
          return;
      }

      // Находим таблицу "Задачи" для создания задач
      const tasksTable = tables.find(t => t.type === 'tasks');
      if (!tasksTable) {
          alert('Не найдена страница "Задачи"');
          return;
      }

      // Создаем экземпляр процесса
      const instanceId = `inst-${Date.now()}`;
      const instance: ProcessInstance = {
          id: instanceId,
          processId: selectedProcess.id,
          currentStepId: firstStep.id,
          status: 'active',
          startedAt: new Date().toISOString(),
          taskIds: []
      };

      // Создаем задачу для первого шага
      const taskId = `task-${Date.now()}`;
      const newTask: Partial<Task> = {
          id: taskId,
          tableId: tasksTable.id,
          title: `${selectedProcess.title}: ${firstStep.title}`,
          description: firstStep.description || '',
          status: 'Не начато',
          priority: 'Средний',
          assigneeId: assigneeId,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 дней
          processId: selectedProcess.id,
          processInstanceId: instanceId,
          stepId: firstStep.id
      };

      instance.taskIds = [taskId];
      
      // Обновляем процесс с новым экземпляром
      const updatedProcess: BusinessProcess = {
          ...selectedProcess,
          instances: [...(selectedProcess.instances || []), instance]
      };

      onSaveProcess(updatedProcess);
      onSaveTask(newTask);
  };

  const getProcessInstances = (processId: string): ProcessInstance[] => {
      const process = processes.find(p => p.id === processId);
      return process?.instances || [];
  };

  const getInstanceTasks = (instanceId: string): Task[] => {
      return tasks.filter(t => t.processInstanceId === instanceId);
  };

  const getStepStatus = (stepId: string, instance: ProcessInstance | null): 'pending' | 'active' | 'completed' => {
      if (!instance) return 'pending';
      if (instance.status === 'completed') return 'completed';
      
      const stepIndex = selectedProcess?.steps.findIndex(s => s.id === stepId) ?? -1;
      const currentStepIndex = selectedProcess?.steps.findIndex(s => s.id === instance.currentStepId) ?? -1;
      
      if (stepIndex < currentStepIndex) return 'completed';
      if (stepIndex === currentStepIndex) return 'active';
      return 'pending';
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if(window.confirm("Сохранить изменения?")) handleSubmit();
          else setIsModalOpen(false);
      }
  };

  // Журнал: разворачиваем все экземпляры процессов
  const allInstances: { process: BusinessProcess; instance: ProcessInstance; tasks: Task[] }[] = processes.flatMap(proc => 
      (proc.instances || []).map(instance => ({
          process: proc,
          instance,
          tasks: tasks.filter(t => t.processInstanceId === instance.id)
      }))
  );

  const journalItems = allInstances.filter(({ instance }) =>
      showCompletedInJournal ? true : instance.status !== 'completed'
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full pt-8 px-6 flex-shrink-0">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Network size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Бизнес-процессы</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Создание и управление бизнес-процессами компании
                </p>
              </div>
            </div>
            <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
              <Plus size={18} /> Создать
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-full p-1 text-xs">
            <button
              onClick={() => setActiveTab('designer')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                activeTab === 'designer'
                  ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Конструктор
            </button>
            <button
              onClick={() => setActiveTab('journal')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                activeTab === 'journal'
                  ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Журнал процессов
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
        <div className="max-w-7xl mx-auto w-full px-6 pb-20">

          {activeTab === 'designer' ? (
            <div className="flex gap-6 flex-1 min-h-0">
           {/* Sidebar List */}
           <div className="w-80 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col">
               <div className="p-4 border-b border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#2a2a2a] text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">
                   Список процессов
               </div>
               <div className="overflow-y-auto flex-1 p-2 space-y-1">
                   {processes.length === 0 ? (
                       <div className="text-center py-8 text-gray-400 text-sm">Нет процессов</div>
                   ) : (
                       processes.map(proc => (
                           <div 
                                key={proc.id} 
                                onClick={() => setSelectedProcessId(proc.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors flex items-center justify-between group ${selectedProcessId === proc.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-800 dark:text-gray-200'}`}
                           >
                               <div className="truncate font-medium text-sm">{proc.title}</div>
                               <button onClick={(e) => { e.stopPropagation(); handleOpenEdit(proc); }} className="text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                   <Edit2 size={14}/>
                               </button>
                           </div>
                       ))
                   )}
               </div>
           </div>

           {/* Process Detail View */}
           <div className="flex-1 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col">
               {selectedProcess ? (
                   <div className="flex flex-col h-full">
                       <div className="p-6 border-b border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#2a2a2a]">
                           <div className="flex justify-between items-start mb-2">
                               <div>
                                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{selectedProcess.title}</h2>
                                   <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedProcess.description || 'Нет описания'}</p>
                               </div>
                               {selectedProcess.steps.length > 0 && (
                                   <button 
                                       onClick={handleStartProcess}
                                       className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm"
                                   >
                                       <Play size={16} /> Запустить процесс
                                   </button>
                               )}
                           </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/50 dark:bg-[#1e1e1e]">
                           <div className="max-w-2xl mx-auto space-y-4">
                               {selectedProcess.steps.map((step, idx) => {
                                   return (
                                       <div key={step.id} className="relative">
                                           <div className="bg-white dark:bg-[#2b2b2b] border-2 border-gray-200 dark:border-[#333] rounded-lg p-4 shadow-sm z-10 relative">
                                               <div className="flex justify-between items-start mb-2">
                                                   <div className="flex items-center gap-2">
                                                       <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Шаг {idx + 1}</div>
                                                   </div>
                                                   <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-[#333] px-2 py-1 rounded text-xs">
                                                       {step.assigneeType === 'position' ? <Building2 size={12} className="text-purple-500"/> : <UserIcon size={12} className="text-blue-500"/>}
                                                       <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[150px]">{getAssigneeName(step)}</span>
                                                   </div>
                                               </div>
                                               <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">{step.title}</div>
                                               <div className="text-sm text-gray-600 dark:text-gray-400">{step.description}</div>
                                           </div>
                                           
                                           {idx < selectedProcess.steps.length - 1 && (
                                               <div className="flex justify-center py-2">
                                                   <ArrowDown size={20} className="text-gray-300 dark:text-gray-600"/>
                                               </div>
                                           )}
                                       </div>
                                   );
                               })}
                               {selectedProcess.steps.length === 0 && (
                                   <div className="text-center text-gray-400 italic">В этом процессе нет шагов</div>
                               )}
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 flex-col">
                       <Network size={48} className="mb-4 opacity-20"/>
                       <p>Выберите процесс для просмотра</p>
                   </div>
               )}
            </div>
          </div>
          ) : (
            <div className="flex-1 bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 dark:border-[#333] bg-gray-50 dark:bg-[#2a2a2a] flex items-center justify-between">
                <div>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Журнал процессов</div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">История всех запусков бизнес-процессов</p>
                </div>
                <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <input 
                        type="checkbox" 
                        checked={showCompletedInJournal} 
                        onChange={e => setShowCompletedInJournal(e.target.checked)} 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Показать завершённые
                </label>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {journalItems.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
                        Нет экземпляров процессов
                    </div>
                ) : (
                    <table className="w-full text-left text-xs border-collapse min-w-[900px]">
                        <thead className="sticky top-0 bg-white dark:bg-[#252525] z-10 border-b border-gray-200 dark:border-[#333]">
                            <tr className="text-gray-500 dark:text-gray-400">
                                <th className="py-2 px-4 font-medium">Процесс</th>
                                <th className="py-2 px-4 font-medium">Статус</th>
                                <th className="py-2 px-4 font-medium">Текущий шаг</th>
                                <th className="py-2 px-4 font-medium">Запуск</th>
                                <th className="py-2 px-4 font-medium">Завершение</th>
                                <th className="py-2 px-4 font-medium">Задач</th>
                            </tr>
                        </thead>
                        <tbody>
                            {journalItems.map(({ process, instance, tasks }) => {
                                const currentStep = process.steps.find(s => s.id === instance.currentStepId);
                                const completedTasks = tasks.filter(t => t.status === 'Выполнено' || t.status === 'Done').length;
                                const totalTasks = tasks.length;

                                return (
                                    <tr 
                                        key={instance.id} 
                                        className="border-б border-gray-100 dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer"
                                        onClick={() => { setSelectedProcessId(process.id); setActiveTab('designer'); }}
                                    >
                                        <td className="py-2 px-4 text-xs text-gray-800 dark:text-gray-100">
                                            {process.title}
                                        </td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                instance.status === 'completed'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : instance.status === 'paused'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                                {instance.status === 'active' && 'Активен'}
                                                {instance.status === 'completed' && 'Завершён'}
                                                {instance.status === 'paused' && 'Приостановлен'}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4 text-xs text-gray-700 dark:text-gray-300">
                                            {currentStep ? currentStep.title : '—'}
                                        </td>
                                        <td className="py-2 px-4 text-xs text-gray-600 dark:text-gray-400">
                                            {new Date(instance.startedAt).toLocaleString()}
                                        </td>
                                        <td className="py-2 px-4 text-xs text-gray-600 dark:text-gray-400">
                                            {instance.completedAt ? new Date(instance.completedAt).toLocaleString() : '—'}
                                        </td>
                                        <td className="py-2 px-4 text-xs text-gray-700 dark:text-gray-300">
                                            {completedTasks}/{totalTasks || 0}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
          )}

          {/* Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[90] animate-in fade-in duration-200" onClick={handleBackdropClick}>
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-[#333] flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#252525] shrink-0">
                    <h3 className="font-bold text-gray-800 dark:text-white">{editingProcess ? 'Редактировать процесс' : 'Новый процесс'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={18} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Название процесса</label>
                                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100" placeholder="Например: Согласование договора"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Описание</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full h-20 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 resize-none"/>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-[#333] pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Шаги процесса</h4>
                                <button type="button" onClick={handleAddStep} className="text-indigo-600 hover:text-indigo-700 text-xs font-medium flex items-center gap-1"><Plus size={14}/> Добавить шаг</button>
                            </div>
                            
                            <div className="space-y-4">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="bg-gray-50 dark:bg-[#303030] p-4 rounded-lg border border-gray-200 dark:border-[#444] relative group">
                                        <button type="button" onClick={() => handleRemoveStep(step.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold text-gray-400 w-6 h-6 rounded-full bg-white dark:bg-[#252525] flex items-center justify-center border border-gray-200 dark:border-[#444]">{index + 1}</span>
                                            <input 
                                                required 
                                                value={step.title} 
                                                onChange={e => handleUpdateStep(step.id, { title: e.target.value })}
                                                className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                                placeholder="Название шага"
                                            />
                                        </div>
                                        <input 
                                            value={step.description}
                                            onChange={e => handleUpdateStep(step.id, { description: e.target.value })}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-xs text-gray-600 dark:text-gray-400 placeholder-gray-400 mb-3"
                                            placeholder="Описание действий..."
                                        />
                                        <div className="flex gap-2">
                                            <select 
                                                value={step.assigneeType}
                                                onChange={e => handleUpdateStep(step.id, { assigneeType: e.target.value as any, assigneeId: '' })}
                                                className="w-1/3 bg-white dark:bg-[#252525] border border-gray-300 dark:border-[#555] rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-200"
                                            >
                                                <option value="position">Должность</option>
                                                <option value="user">Сотрудник</option>
                                            </select>
                                            <select 
                                                value={step.assigneeId}
                                                onChange={e => handleUpdateStep(step.id, { assigneeId: e.target.value })}
                                                className="flex-1 bg-white dark:bg-[#252525] border border-gray-300 dark:border-[#555] rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-200"
                                            >
                                                <option value="">Выберите...</option>
                                                {step.assigneeType === 'position' 
                                                    ? orgPositions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)
                                                    : users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)
                                                }
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 dark:border-[#333] bg-white dark:bg-[#252525] flex justify-between items-center shrink-0">
                         {editingProcess && (
                             <button type="button" onClick={handleDelete} className="text-red-500 text-sm hover:underline hover:text-red-600 flex items-center gap-1"><Trash2 size={14}/> Удалить</button>
                         )}
                         <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-2"><Save size={16}/> Сохранить</button>
                         </div>
                    </div>
                </form>
            </div>
        </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessProcessesView;

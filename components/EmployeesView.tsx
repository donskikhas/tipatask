
import React, { useState } from 'react';
import { EmployeeInfo, User, OrgPosition, Department } from '../types';
import { UserCheck, Plus, Search, Trash2, Edit2, DollarSign, Calendar, FileText, X, Save, User as UserIcon, Phone, Send, Cake, Network, Building2 } from 'lucide-react';

interface EmployeesViewProps {
  employees: EmployeeInfo[];
  users: User[]; // Auth users to link
  departments?: Department[]; // For OrgChart
  orgPositions?: OrgPosition[]; // For OrgChart
  onSave: (info: EmployeeInfo) => void;
  onDelete: (id: string) => void;
  onSavePosition?: (pos: OrgPosition) => void;
  onDeletePosition?: (id: string) => void;
}

const EmployeesView: React.FC<EmployeesViewProps> = ({ 
    employees, users, 
    departments = [], orgPositions = [], 
    onSave, onDelete, onSavePosition, onDeletePosition 
}) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'orgchart'>('cards');
  
  // Card Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState<EmployeeInfo | null>(null);
  
  // Org Position Modal
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<OrgPosition | null>(null);

  // Form (Cards)
  const [userId, setUserId] = useState('');
  const [position, setPosition] = useState('');
  const [salary, setSalary] = useState('');
  const [hireDate, setHireDate] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [conditions, setConditions] = useState('');

  // Form (Org Position)
  const [posTitle, setPosTitle] = useState('');
  const [posDep, setPosDep] = useState('');
  const [posManager, setPosManager] = useState('');
  const [posHolder, setPosHolder] = useState('');

  const getEmployeeName = (uid: string) => users.find(u => u.id === uid)?.name || 'Неизвестный';
  const getEmployeeUser = (uid: string) => users.find(u => u.id === uid);

  // --- Handlers Cards ---
  const handleOpenCreate = () => {
      setEditingInfo(null);
      setUserId(users[0]?.id || '');
      setPosition(''); setSalary(''); setHireDate(''); setBirthDate(''); setConditions('');
      setIsModalOpen(true);
  };

  const handleOpenEdit = (info: EmployeeInfo) => {
      setEditingInfo(info);
      setUserId(info.userId);
      setPosition(info.position);
      setSalary(info.salary);
      setHireDate(info.hireDate);
      setBirthDate(info.birthDate || '');
      setConditions(info.conditions || '');
      setIsModalOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      onSave({
          id: editingInfo ? editingInfo.id : `emp-${Date.now()}`,
          userId, position, salary, hireDate, birthDate, conditions
      });
      setIsModalOpen(false);
  };

  const handleDelete = () => {
      if(editingInfo && confirm('Удалить карточку сотрудника?')) {
          onDelete(editingInfo.id);
          setIsModalOpen(false);
      }
  };

  // --- Handlers OrgChart ---
  const handleOpenPosCreate = () => {
      setEditingPos(null);
      setPosTitle(''); setPosDep(''); setPosManager(''); setPosHolder('');
      setIsPosModalOpen(true);
  };

  const handleOpenPosEdit = (pos: OrgPosition) => {
      setEditingPos(pos);
      setPosTitle(pos.title);
      setPosDep(pos.departmentId || '');
      setPosManager(pos.managerPositionId || '');
      setPosHolder(pos.holderUserId || '');
      setIsPosModalOpen(true);
  };

  const handleSubmitPos = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!onSavePosition) return;
      onSavePosition({
          id: editingPos ? editingPos.id : `op-${Date.now()}`,
          title: posTitle,
          departmentId: posDep || undefined,
          managerPositionId: posManager || undefined,
          holderUserId: posHolder || undefined
      });
      setIsPosModalOpen(false);
  };

  const handleDeletePos = () => {
      if (editingPos && onDeletePosition && confirm('Удалить должность?')) {
          onDeletePosition(editingPos.id);
          setIsPosModalOpen(false);
      }
  };

  // Backdrops
  const handleCardBackdrop = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if(window.confirm("Сохранить изменения?")) handleSubmit();
          else setIsModalOpen(false);
      }
  };

  const handlePosBackdrop = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if(window.confirm("Сохранить изменения?")) handleSubmitPos();
          else setIsPosModalOpen(false);
      }
  };

  // --- Render ---

  const renderCards = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {employees.map(info => {
               const user = getEmployeeUser(info.userId);
               return (
                   <div key={info.id} className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col">
                       <button onClick={() => handleOpenEdit(info)} className="absolute top-4 right-4 text-gray-300 hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Edit2 size={16}/>
                       </button>
                       
                       <div className="flex items-center gap-4 mb-4">
                            <img src={user?.avatar} className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-600" alt=""/>
                            <div className="overflow-hidden">
                                <h3 className="font-bold text-gray-900 dark:text-gray-200 truncate">{user?.name}</h3>
                                <div className="text-xs text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded border border-purple-100 dark:border-purple-800 inline-block mt-1 truncate max-w-full">{info.position}</div>
                            </div>
                       </div>
                       
                       <div className="space-y-2 text-sm flex-1 mb-4">
                           <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#303030] rounded">
                               <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><DollarSign size={14}/> Зарплата:</div>
                               <div className="font-bold text-gray-900 dark:text-gray-200">{info.salary || '—'}</div>
                           </div>
                           <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#303030] rounded">
                               <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Calendar size={14}/> Нанят:</div>
                               <div className="font-medium text-gray-700 dark:text-gray-300">{info.hireDate || '—'}</div>
                           </div>
                           {info.birthDate && (
                                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-[#303030] rounded">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400"><Cake size={14}/> ДР:</div>
                                    <div className="font-medium text-gray-700 dark:text-gray-300">{info.birthDate}</div>
                                </div>
                           )}
                       </div>

                       <div className="grid grid-cols-2 gap-2 mb-4">
                           {user?.phone && (
                               <a href={`tel:${user.phone}`} className="flex items-center justify-center gap-1 p-1.5 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                                   <Phone size={12}/> {user.phone}
                               </a>
                           )}
                           {user?.telegram && (
                               <a href={user.telegram.startsWith('http') ? user.telegram : `https://t.me/${user.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 p-1.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                                   <Send size={12}/> Telegram
                               </a>
                           )}
                       </div>

                       {info.conditions && (
                           <div className="pt-2 border-t border-gray-100 dark:border-[#333] mt-auto">
                               <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Условия / Заметки</div>
                               <p className="text-gray-600 dark:text-gray-400 italic text-xs leading-relaxed line-clamp-3">{info.conditions}</p>
                           </div>
                       )}
                   </div>
               );
           })}
      </div>
  );

  const renderOrgChart = () => {
      // Create hierarchy
      const roots = orgPositions.filter(p => !p.managerPositionId || !orgPositions.find(op => op.id === p.managerPositionId));
      
      const renderNode = (node: OrgPosition, level: number = 0) => {
          const children = orgPositions.filter(p => p.managerPositionId === node.id);
          const holder = users.find(u => u.id === node.holderUserId);
          const dept = departments.find(d => d.id === node.departmentId);

          return (
              <div key={node.id} className="relative pl-8">
                  {/* Connector lines */}
                  {level > 0 && (
                      <>
                        <div className="absolute top-0 left-0 w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
                        <div className="absolute top-8 left-0 w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                      </>
                  )}
                  {children.length > 0 && (
                      <div className="absolute top-8 left-4 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                  )}

                  <div className="py-2">
                      <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg p-3 w-64 shadow-sm relative group">
                          <button onClick={() => handleOpenPosEdit(node)} className="absolute top-2 right-2 text-gray-300 hover:text-blue-600 opacity-0 group-hover:opacity-100"><Edit2 size={12}/></button>
                          
                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">{dept?.name || 'Без отдела'}</div>
                          <div className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-2">{node.title}</div>
                          
                          {holder ? (
                              <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#303030] p-1.5 rounded">
                                  <img src={holder.avatar} className="w-6 h-6 rounded-full" />
                                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{holder.name}</span>
                              </div>
                          ) : (
                              <div className="text-xs text-gray-400 italic bg-gray-50 dark:bg-[#303030] p-1.5 rounded">Вакансия</div>
                          )}
                      </div>
                  </div>

                  <div className="ml-4">
                      {children.map(child => renderNode(child, level + 1))}
                  </div>
              </div>
          );
      };

      return (
          <div className="overflow-x-auto pb-8">
              {roots.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 dark:text-gray-500">Оргсхема пуста. Добавьте первую должность.</div>
              ) : (
                  <div className="pl-4">
                      {roots.map(root => renderNode(root))}
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full pt-8 px-6 flex-shrink-0">
       <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Сотрудники (HR)</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Управление сотрудниками, должностями и организационной структурой
                        </p>
                    </div>
                </div>
                {activeTab === 'cards' ? (
                    <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-2 shadow-sm">
                        <Plus size={18} /> Создать
                    </button>
                ) : (
                    <button onClick={handleOpenPosCreate} className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 flex items-center gap-2 shadow-sm">
                        <Plus size={18} /> Создать
                    </button>
                )}
            </div>
            
            {/* TABS */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-full p-1 text-xs">
              <button onClick={() => setActiveTab('cards')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${activeTab === 'cards' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>Карточки</button>
              <button onClick={() => setActiveTab('orgchart')} className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${activeTab === 'orgchart' ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'}`}>Оргсхема</button>
            </div>
       </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
         <div className="max-w-7xl mx-auto w-full px-6 pb-20">
       {activeTab === 'cards' && renderCards()}
       {activeTab === 'orgchart' && renderOrgChart()}
         </div>
       </div>

       {/* Employee Modal */}
       {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200" onClick={handleCardBackdrop}>
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#333]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#252525]">
                    <h3 className="font-bold text-gray-800 dark:text-white">{editingInfo ? 'Карточка сотрудника' : 'Новая карточка'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={18} /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Сотрудник (из пользователей)</label>
                        <select value={userId} onChange={e => setUserId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Должность</label>
                        <input required value={position} onChange={e => setPosition(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500" placeholder="Маркетолог"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Зарплата / KPI</label>
                            <input value={salary} onChange={e => setSalary(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Дата найма</label>
                            <input type="date" value={hireDate} onChange={e => setHireDate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Дата рождения</label>
                        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"/>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Условия / Заметки</label>
                         <textarea value={conditions} onChange={e => setConditions(e.target.value)} className="w-full h-20 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 resize-none" placeholder="Фикс + % от продаж..."/>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                         {editingInfo && (
                             <button type="button" onClick={handleDelete} className="text-red-500 text-sm hover:underline hover:text-red-600 flex items-center gap-1"><Trash2 size={14}/> Удалить</button>
                         )}
                         <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm flex items-center gap-2"><Save size={16}/> Сохранить</button>
                         </div>
                    </div>
                </form>
            </div>
        </div>
       )}

       {/* Org Position Modal */}
       {isPosModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200" onClick={handlePosBackdrop}>
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-[#333]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#252525]">
                    <h3 className="font-bold text-gray-800 dark:text-white">{editingPos ? 'Редактировать должность' : 'Новая должность'}</h3>
                    <button onClick={() => setIsPosModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={18} /></button>
                </div>
                
                <form onSubmit={handleSubmitPos} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Название должности</label>
                        <input required value={posTitle} onChange={e => setPosTitle(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100" placeholder="Например: Коммерческий директор"/>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Подразделение</label>
                        <select value={posDep} onChange={e => setPosDep(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                            <option value="">Без отдела</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Прямой руководитель</label>
                        <select value={posManager} onChange={e => setPosManager(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                            <option value="">Нет (Верхний уровень)</option>
                            {orgPositions.filter(p => p.id !== editingPos?.id).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Занимает сотрудник</label>
                        <select value={posHolder} onChange={e => setPosHolder(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                            <option value="">Вакансия</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                         {editingPos && (
                             <button type="button" onClick={handleDeletePos} className="text-red-500 text-sm hover:underline hover:text-red-600 flex items-center gap-1"><Trash2 size={14}/> Удалить</button>
                         )}
                         <div className="flex gap-2 ml-auto">
                            <button type="button" onClick={() => setIsPosModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                            <button type="submit" className="px-4 py-2 text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 rounded-lg shadow-sm flex items-center gap-2"><Save size={16}/> Сохранить</button>
                         </div>
                    </div>
                </form>
            </div>
        </div>
       )}
    </div>
  );
};

export default EmployeesView;

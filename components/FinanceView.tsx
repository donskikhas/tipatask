
import React, { useState } from 'react';
import { FinanceCategory, FinancePlan, PurchaseRequest, Department, User, Role } from '../types';
import { Wallet, Plus, X, Edit2, Trash2, PieChart, TrendingUp, DollarSign, Check, AlertCircle, Calendar, Settings, ArrowRight } from 'lucide-react';

interface FinanceViewProps {
  categories: FinanceCategory[];
  plan: FinancePlan;
  requests: PurchaseRequest[];
  departments: Department[];
  users: User[];
  currentUser: User;
  onSaveCategory: (cat: FinanceCategory) => void;
  onDeleteCategory: (id: string) => void;
  onUpdatePlan: (updates: Partial<FinancePlan>) => void;
  onSaveRequest: (req: PurchaseRequest) => void;
  onDeleteRequest: (id: string) => void;
}

const FinanceView: React.FC<FinanceViewProps> = ({ 
    categories, plan, requests, departments, users, currentUser,
    onSaveCategory, onDeleteCategory, onUpdatePlan, onSaveRequest, onDeleteRequest 
}) => {
  const [activeTab, setActiveTab] = useState<'planning' | 'requests' | 'settings'>('planning');
  
  // Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinanceCategory | null>(null);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PurchaseRequest | null>(null);

  // Category Form
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState<'fixed' | 'percent'>('fixed');
  const [catValue, setCatValue] = useState('');

  // Request Form
  const [reqAmount, setReqAmount] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqDep, setReqDep] = useState('');
  const [reqCat, setReqCat] = useState('');

  // --- Handlers ---

  const handleOpenCategoryCreate = () => {
      setEditingCategory(null);
      setCatName(''); setCatType('fixed'); setCatValue('');
      setIsCategoryModalOpen(true);
  };

  const handleOpenCategoryEdit = (cat: FinanceCategory) => {
      setEditingCategory(cat);
      setCatName(cat.name); setCatType(cat.type); setCatValue(cat.value.toString());
      setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      onSaveCategory({
          id: editingCategory ? editingCategory.id : `fc-${Date.now()}`,
          name: catName,
          type: catType,
          value: parseFloat(catValue) || 0,
          color: editingCategory?.color || 'bg-blue-100 text-blue-700' // Default color
      });
      setIsCategoryModalOpen(false);
  };

  const handleOpenRequestCreate = () => {
      setEditingRequest(null);
      setReqAmount(''); setReqDesc(''); setReqDep(departments[0]?.id || ''); setReqCat(categories[0]?.id || '');
      setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      onSaveRequest({
          id: editingRequest ? editingRequest.id : `pr-${Date.now()}`,
          requesterId: currentUser.id,
          departmentId: reqDep,
          categoryId: reqCat,
          amount: parseFloat(reqAmount) || 0,
          description: reqDesc,
          status: 'pending',
          date: new Date().toISOString()
      });
      setIsRequestModalOpen(false);
  };

  const handleStatusChange = (req: PurchaseRequest, status: PurchaseRequest['status']) => {
      onSaveRequest({ ...req, status, decisionDate: new Date().toISOString() });
  };

  // Backdrops
  const handleCategoryBackdrop = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if(window.confirm("Сохранить изменения?")) handleCategorySubmit();
          else setIsCategoryModalOpen(false);
      }
  };

  const handleRequestBackdrop = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if(window.confirm("Сохранить изменения?")) handleRequestSubmit();
          else setIsRequestModalOpen(false);
      }
  };

  // --- Calculations ---
  
  const currentIncome = plan?.currentIncome || 0;
  
  // Calculate Budgets
  const budgets = categories.map(cat => {
      const budgetAmount = cat.type === 'fixed' ? cat.value : (currentIncome * cat.value / 100);
      return { ...cat, budgetAmount };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const remainingBalance = currentIncome - totalBudget;

  // Requests Analysis
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const totalApproved = approvedRequests.reduce((sum, r) => sum + r.amount, 0);

  // --- Render Tabs ---

  const renderSettings = () => (
      <div className="space-y-8">
          {/* Plan Settings */}
          <div className="bg-white dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-500"/> Общие настройки плана</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Период планирования</label>
                      <div className="flex bg-gray-100 dark:bg-[#303030] p-1 rounded-lg">
                          <button onClick={() => onUpdatePlan({ period: 'week' })} className={`flex-1 py-1.5 text-sm font-medium rounded ${plan?.period === 'week' ? 'bg-white dark:bg-[#404040] shadow text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>Неделя</button>
                          <button onClick={() => onUpdatePlan({ period: 'month' })} className={`flex-1 py-1.5 text-sm font-medium rounded ${plan?.period === 'month' ? 'bg-white dark:bg-[#404040] shadow text-blue-600' : 'text-gray-500 dark:text-gray-400'}`}>Месяц</button>
                      </div>
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">План продаж (Цель)</label>
                      <input 
                        type="number" 
                        value={plan?.salesPlan || ''} 
                        onChange={(e) => onUpdatePlan({ salesPlan: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-white dark:bg-[#333] border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-gray-100"
                        placeholder="0"
                      />
                  </div>
              </div>
          </div>

          {/* Expense Categories */}
          <div className="space-y-4">
              <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Статьи расходов</h3>
                  <button onClick={handleOpenCategoryCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                      <Plus size={18} /> Добавить статью
                  </button>
              </div>
              <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 dark:bg-[#202020] border-b border-gray-200 dark:border-[#333]">
                          <tr>
                              <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Название</th>
                              <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Тип</th>
                              <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Значение</th>
                              <th className="px-4 py-3 w-10"></th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                          {categories.map(cat => (
                              <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-[#303030]">
                                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{cat.name}</td>
                                  <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${cat.type === 'fixed' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                          {cat.type === 'fixed' ? 'Фикс' : 'Процент'}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                      {cat.type === 'fixed' ? `${cat.value.toLocaleString()} UZS` : `${cat.value}%`}
                                  </td>
                                  <td className="px-4 py-3 text-right flex gap-2 justify-end">
                                      <button onClick={() => handleOpenCategoryEdit(cat)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14}/></button>
                                      <button onClick={() => { if(confirm('Удалить статью?')) onDeleteCategory(cat.id) }} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
  );

  const renderPlanning = () => (
      <div className="space-y-6">
          {/* Income Input */}
          <div className="bg-white dark:bg-[#252525] p-6 rounded-xl border border-gray-200 dark:border-[#333] shadow-sm flex items-center justify-between">
              <div>
                  <h3 className="text-gray-500 dark:text-gray-400 font-bold uppercase text-xs mb-1">Фактический доход за период</h3>
                  <div className="flex items-center gap-4">
                      <div className="relative">
                          <input 
                            type="number" 
                            value={currentIncome || ''} 
                            onChange={(e) => onUpdatePlan({ currentIncome: parseFloat(e.target.value) || 0 })}
                            className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-none focus:ring-0 p-0 placeholder-gray-300 w-48"
                            placeholder="0"
                          />
                          <span className="text-gray-400 ml-2 text-xl">UZS</span>
                      </div>
                  </div>
              </div>
              <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Нераспределенный остаток</div>
                  <div className={`text-xl font-bold ${remainingBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {remainingBalance.toLocaleString()} UZS
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution */}
              <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><PieChart size={18}/> Распределение средств</h3>
                  <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-gray-50 dark:bg-[#202020] border-b border-gray-200 dark:border-[#333]">
                              <tr>
                                  <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Статья</th>
                                  <th className="px-4 py-3 text-gray-600 dark:text-gray-400 text-right">Бюджет</th>
                                  <th className="px-4 py-3 text-gray-600 dark:text-gray-400 text-right">Утверждено заявок</th>
                                  <th className="px-4 py-3 text-gray-600 dark:text-gray-400 text-right">Остаток</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                              {budgets.map(b => {
                                  const approvedForCat = approvedRequests.filter(r => r.categoryId === b.id).reduce((sum, r) => sum + r.amount, 0);
                                  const balance = b.budgetAmount - approvedForCat;
                                  return (
                                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-[#303030]">
                                          <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                                              {b.name} <span className="text-gray-400 text-xs font-normal">({b.type === 'fixed' ? 'Фикс' : `${b.value}%`})</span>
                                          </td>
                                          <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">{b.budgetAmount.toLocaleString()}</td>
                                          <td className="px-4 py-3 text-right text-orange-600 dark:text-orange-400">{approvedForCat > 0 ? `-${approvedForCat.toLocaleString()}` : '0'}</td>
                                          <td className={`px-4 py-3 text-right font-bold ${balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                              {balance.toLocaleString()}
                                          </td>
                                      </tr>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>

              {/* Quick Approval */}
              <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2"><Check size={18}/> Заявки к согласованию</h3>
                  <div className="space-y-3">
                      {pendingRequests.length === 0 ? (
                          <div className="p-4 bg-gray-50 dark:bg-[#252525] rounded-lg border border-dashed border-gray-200 dark:border-[#333] text-center text-gray-400 text-sm">
                              Нет новых заявок
                          </div>
                      ) : (
                          pendingRequests.map(req => {
                              const cat = categories.find(c => c.id === req.categoryId);
                              const dep = departments.find(d => d.id === req.departmentId);
                              const user = users.find(u => u.id === req.requesterId);
                              
                              return (
                                  <div key={req.id} className="bg-white dark:bg-[#252525] p-3 rounded-lg border border-gray-200 dark:border-[#333] shadow-sm">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="text-xs font-bold text-gray-500 dark:text-gray-400">{dep?.name} • {user?.name}</div>
                                          <div className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">{cat?.name}</div>
                                      </div>
                                      <div className="font-bold text-gray-900 dark:text-white mb-1">{req.amount.toLocaleString()} UZS</div>
                                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">{req.description}</p>
                                      
                                      <div className="flex gap-2">
                                          <button onClick={() => handleStatusChange(req, 'approved')} className="flex-1 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold hover:bg-green-200 dark:hover:bg-green-900/50">Одобрить</button>
                                          <button onClick={() => handleStatusChange(req, 'deferred')} className="flex-1 py-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-bold hover:bg-yellow-200 dark:hover:bg-yellow-900/50">Перенести</button>
                                          <button onClick={() => handleStatusChange(req, 'rejected')} className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded"><X size={14}/></button>
                                      </div>
                                  </div>
                              )
                          })
                      )}
                  </div>
              </div>
          </div>
      </div>
  );

  const renderRequestsTab = () => (
      <div className="space-y-6">
          <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Реестр заявок</h3>
              <button onClick={handleOpenRequestCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm">
                  <Plus size={18} /> Создать заявку
              </button>
          </div>

          <div className="bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-[#202020] border-b border-gray-200 dark:border-[#333]">
                      <tr>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Дата</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Сотрудник</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Подразделение</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Статья</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Сумма</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Описание</th>
                          <th className="px-4 py-3 text-gray-600 dark:text-gray-400">Статус</th>
                          <th className="px-4 py-3"></th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#333]">
                      {requests.map(req => {
                          const cat = categories.find(c => c.id === req.categoryId);
                          const dep = departments.find(d => d.id === req.departmentId);
                          const user = users.find(u => u.id === req.requesterId);
                          
                          return (
                              <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-[#303030]">
                                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(req.date).toLocaleDateString()}</td>
                                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{user?.name}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{dep?.name}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{cat?.name}</td>
                                  <td className="px-4 py-3 font-bold text-gray-900 dark:text-gray-100">{req.amount.toLocaleString()}</td>
                                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-xs">{req.description}</td>
                                  <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                                          req.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                          req.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                          req.status === 'deferred' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                      }`}>
                                          {req.status === 'approved' ? 'Одобрено' : req.status === 'rejected' ? 'Отклонено' : req.status === 'deferred' ? 'Перенос' : 'Ожидание'}
                                      </span>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                      {currentUser.role === Role.ADMIN && (
                                          <button onClick={() => { if(confirm('Удалить?')) onDeleteRequest(req.id) }} className="text-gray-400 hover:text-red-600"><Trash2 size={14}/></button>
                                      )}
                                  </td>
                              </tr>
                          );
                      })}
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="max-w-7xl mx-auto w-full pt-8 px-6 flex-shrink-0">
       <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Финансовое планирование</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Планирование бюджета, управление статьями расходов и заявками
                        </p>
                    </div>
                </div>
                {activeTab === 'requests' && (
                    <button onClick={handleOpenRequestCreate} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center gap-2 shadow-sm">
                        <Plus size={18} /> Создать
                    </button>
                )}
            </div>
            
            {/* TABS */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-[#252525] rounded-full p-1 text-xs">
                <button 
                    onClick={() => setActiveTab('planning')} 
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                        activeTab === 'planning'
                            ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                    Планирование
                </button>
                <button 
                    onClick={() => setActiveTab('requests')} 
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                        activeTab === 'requests'
                            ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300'
                    }`}
                >
                    Заявки
                </button>
                {currentUser.role === Role.ADMIN && (
                    <button 
                        onClick={() => setActiveTab('settings')} 
                        className={`px-3 py-1.5 rounded-full flex items-center gap-1 ${
                            activeTab === 'settings'
                                ? 'bg-white dark:bg-[#191919] text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-300'
                        }`}
                    >
                        Настройки
                    </button>
                )}
            </div>
       </div>
       </div>
       <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
         <div className="max-w-7xl mx-auto w-full px-6 pb-20">
       {activeTab === 'settings' && renderSettings()}
       {activeTab === 'planning' && renderPlanning()}
       {activeTab === 'requests' && renderRequestsTab()}
         </div>
       </div>

       {/* Category Modal */}
       {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200" onClick={handleCategoryBackdrop}>
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-[#333]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#252525]">
                    <h3 className="font-bold text-gray-800 dark:text-white">{editingCategory ? 'Редактировать статью' : 'Новая статья расходов'}</h3>
                    <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={18} /></button>
                </div>
                <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Название</label>
                        <input required value={catName} onChange={e => setCatName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100" placeholder="Например: Офис"/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Тип распределения</label>
                        <select value={catType} onChange={e => setCatType(e.target.value as any)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                            <option value="fixed">Фиксированная сумма</option>
                            <option value="percent">Процент от дохода</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Значение ({catType === 'fixed' ? 'UZS' : '%'})</label>
                        <input type="number" required value={catValue} onChange={e => setCatValue(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
       )}

       {/* Request Modal */}
       {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-in fade-in duration-200" onClick={handleRequestBackdrop}>
            <div className="bg-white dark:bg-[#252525] rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-[#333]">
                <div className="p-4 border-b border-gray-100 dark:border-[#333] flex justify-between items-center bg-white dark:bg-[#252525]">
                    <h3 className="font-bold text-gray-800 dark:text-white">Заявка на приобретение</h3>
                    <button onClick={() => setIsRequestModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#333]"><X size={18} /></button>
                </div>
                <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Сумма (UZS)</label>
                        <input type="number" required value={reqAmount} onChange={e => setReqAmount(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Подразделение</label>
                            <select value={reqDep} onChange={e => setReqDep(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Статья расходов</label>
                            <select value={reqCat} onChange={e => setReqCat(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 cursor-pointer">
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Описание / Обоснование</label>
                        <textarea required value={reqDesc} onChange={e => setReqDesc(e.target.value)} className="w-full h-24 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm bg-white dark:bg-[#333] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Что покупаем и зачем?"/>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={() => setIsRequestModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg">Отмена</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-sm">Отправить</button>
                    </div>
                </form>
            </div>
        </div>
       )}
    </div>
  );
};

export default FinanceView;

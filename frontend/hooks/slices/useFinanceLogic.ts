
import { useState } from 'react';
import { Department, FinanceCategory, FinancePlan, PurchaseRequest } from '../../../types';
import { api } from '../../../backend/api';

export const useFinanceLogic = (showNotification: (msg: string) => void) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [financeCategories, setFinanceCategories] = useState<FinanceCategory[]>([]);
  const [financePlan, setFinancePlan] = useState<FinancePlan | null>(null);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);

  // Departments
  const saveDepartment = (dep: Department) => {
      const updated = departments.find(d => d.id === dep.id) 
          ? departments.map(d => d.id === dep.id ? dep : d) 
          : [...departments, dep];
      setDepartments(updated);
      api.departments.updateAll(updated);
      showNotification('Подразделение сохранено');
  };

  const deleteDepartment = (id: string) => {
      const updated = departments.filter(d => d.id !== id);
      setDepartments(updated);
      api.departments.updateAll(updated);
      showNotification('Подразделение удалено');
  };

  // Finance Categories
  const saveFinanceCategory = (cat: FinanceCategory) => {
      const updated = financeCategories.find(c => c.id === cat.id)
          ? financeCategories.map(c => c.id === cat.id ? cat : c)
          : [...financeCategories, cat];
      setFinanceCategories(updated);
      api.finance.updateCategories(updated);
      showNotification('Статья расходов сохранена');
  };

  const deleteFinanceCategory = (id: string) => {
      const updated = financeCategories.filter(c => c.id !== id);
      setFinanceCategories(updated);
      api.finance.updateCategories(updated);
  };

  // Finance Plan
  const updateFinancePlan = (updates: Partial<FinancePlan>) => {
      const newPlan = { ...financePlan, ...updates } as FinancePlan;
      setFinancePlan(newPlan);
      api.finance.updatePlan(newPlan);
      // showNotification('План обновлен'); // Too noisy for simple inputs
  };

  // Purchase Requests
  const savePurchaseRequest = (req: PurchaseRequest) => {
      const updated = purchaseRequests.find(r => r.id === req.id)
          ? purchaseRequests.map(r => r.id === req.id ? req : r)
          : [...purchaseRequests, req];
      setPurchaseRequests(updated);
      api.finance.updateRequests(updated);
      showNotification('Заявка сохранена');
  };

  const deletePurchaseRequest = (id: string) => {
      const updated = purchaseRequests.filter(r => r.id !== id);
      setPurchaseRequests(updated);
      api.finance.updateRequests(updated);
      showNotification('Заявка удалена');
  };

  return {
    state: { departments, financeCategories, financePlan, purchaseRequests },
    setters: { setDepartments, setFinanceCategories, setFinancePlan, setPurchaseRequests },
    actions: { 
        saveDepartment, deleteDepartment, 
        saveFinanceCategory, deleteFinanceCategory,
        updateFinancePlan,
        savePurchaseRequest, deletePurchaseRequest
    }
  };
};

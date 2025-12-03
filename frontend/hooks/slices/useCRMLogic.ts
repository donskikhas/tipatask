
import { useState } from 'react';
import { Client, Contract, Deal, EmployeeInfo } from '../../../types';
import { api } from '../../../backend/api';

export const useCRMLogic = (showNotification: (msg: string) => void) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [employeeInfos, setEmployeeInfos] = useState<EmployeeInfo[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  // Clients
  const saveClient = (c: Client) => {
      const u = clients.find(x => x.id === c.id) ? clients.map(x => x.id === c.id ? c : x) : [...clients, c];
      setClients(u); api.clients.updateAll(u); showNotification('Клиент сохранен');
  };
  const deleteClient = (id: string) => { const u = clients.filter(c => c.id !== id); setClients(u); api.clients.updateAll(u); showNotification('Клиент удален'); };

  // Contracts
  const saveContract = (c: Contract) => {
      const u = contracts.find(x => x.id === c.id) ? contracts.map(x => x.id === c.id ? c : x) : [...contracts, c];
      setContracts(u); api.contracts.updateAll(u); showNotification('Договор сохранен');
  };
  const deleteContract = (id: string) => { const u = contracts.filter(c => c.id !== id); setContracts(u); api.contracts.updateAll(u); showNotification('Договор удален'); };

  // Employees
  const saveEmployee = (e: EmployeeInfo) => {
      const u = employeeInfos.find(x => x.id === e.id) ? employeeInfos.map(x => x.id === e.id ? e : x) : [...employeeInfos, e];
      setEmployeeInfos(u); api.employees.updateAll(u); showNotification('Сотрудник обновлен');
  };
  const deleteEmployee = (id: string) => { const u = employeeInfos.filter(e => e.id !== id); setEmployeeInfos(u); api.employees.updateAll(u); showNotification('Карточка удалена'); };

  // Deals
  const saveDeal = (d: Deal) => {
      const u = deals.find(x => x.id === d.id) ? deals.map(x => x.id === d.id ? d : x) : [...deals, d];
      setDeals(u); api.deals.updateAll(u); showNotification('Сделка сохранена');
  };
  const deleteDeal = (id: string) => { const u = deals.filter(d => d.id !== id); setDeals(u); api.deals.updateAll(u); showNotification('Сделка удалена'); };

  return {
    state: { clients, contracts, employeeInfos, deals },
    setters: { setClients, setContracts, setEmployeeInfos, setDeals },
    actions: { saveClient, deleteClient, saveContract, deleteContract, saveEmployee, deleteEmployee, saveDeal, deleteDeal }
  };
};

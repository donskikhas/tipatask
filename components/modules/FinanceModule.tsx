
import React from 'react';
import { FinanceCategory, FinancePlan, PurchaseRequest, Department, User } from '../../types';
import FinanceView from '../FinanceView';

interface FinanceModuleProps {
  categories: FinanceCategory[];
  plan: FinancePlan | null;
  requests: PurchaseRequest[];
  departments: Department[];
  users: User[];
  currentUser: User;
  actions: any;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({ categories, plan, requests, departments, users, currentUser, actions }) => {
    return (
        <FinanceView 
            categories={categories} 
            plan={plan || {id:'p1', period:'month', salesPlan:0, currentIncome:0}} 
            requests={requests} 
            departments={departments} 
            users={users} 
            currentUser={currentUser} 
            onSaveCategory={actions.saveFinanceCategory} 
            onDeleteCategory={actions.deleteFinanceCategory} 
            onUpdatePlan={actions.updateFinancePlan} 
            onSaveRequest={actions.savePurchaseRequest} 
            onDeleteRequest={actions.deletePurchaseRequest} 
        />
    );
};

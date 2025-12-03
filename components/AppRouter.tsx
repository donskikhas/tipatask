
import React from 'react';
import { 
  Task, User, Project, StatusOption, PriorityOption, ActivityLog, 
  Deal, Client, Contract, EmployeeInfo, Meeting, ContentPost, 
  Doc, Folder, TableCollection, Department, FinanceCategory, 
  FinancePlan, PurchaseRequest, OrgPosition, BusinessProcess, 
  ViewMode, AutomationRule, Warehouse, InventoryItem, StockBalance, StockMovement 
} from '../types';

import HomeView from './HomeView';
import InboxView from './InboxView';
import SettingsView from './SettingsView';
import AnalyticsView from './AnalyticsView';
 import InventoryView from './InventoryView';
import DocEditor from './DocEditor';
import TableView from './TableView'; // Needed for Global Search
import { SpaceModule } from './modules/SpaceModule';
import { CRMModule } from './modules/CRMModule';
import { FinanceModule } from './modules/FinanceModule';
import { HRModule } from './modules/HRModule';

interface AppRouterProps {
  currentView: string;
  viewMode: ViewMode;
  searchQuery: string;
  activeTable?: TableCollection;
  filteredTasks: Task[];
  allTasks: Task[];
  users: User[];
  currentUser: User;
  projects: Project[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  activities: ActivityLog[];
  deals: Deal[];
  clients: Client[];
  contracts: Contract[];
  employeeInfos: EmployeeInfo[];
  meetings: Meeting[];
  contentPosts: ContentPost[];
  docs: Doc[];
  folders: Folder[];
  activeDoc?: Doc;
  tables: TableCollection[];
  departments: Department[];
  financeCategories: FinanceCategory[];
  financePlan: FinancePlan | null;
  purchaseRequests: PurchaseRequest[];
  warehouses: Warehouse[];
  inventoryItems: InventoryItem[];
  inventoryBalances: StockBalance[];
  inventoryMovements: StockMovement[];
  orgPositions: OrgPosition[];
  businessProcesses: BusinessProcess[];
  automationRules?: AutomationRule[];
  settingsActiveTab?: string;
  actions: any;
}

export const AppRouter: React.FC<AppRouterProps> = (props) => {
  const { currentView, activeTable, actions } = props;

  // 1. Global / Core Views
  if (currentView === 'home') {
      return (
          <HomeView 
              currentUser={props.currentUser} 
              tasks={props.filteredTasks} 
              recentActivity={props.activities} 
              meetings={props.meetings}
              financePlan={props.financePlan}
              purchaseRequests={props.purchaseRequests}
              deals={props.deals}
              contentPosts={props.contentPosts}
              onOpenTask={actions.openTaskModal}
              onNavigateToInbox={() => actions.setCurrentView('inbox')}
              onQuickCreateTask={() => actions.openTaskModal(null)}
              onQuickCreateProcess={() => { actions.setCurrentView('business-processes'); }}
              onQuickCreateDeal={() => { actions.setCurrentView('sales-funnel'); }}
          />
      );
  }

  if (currentView === 'inbox') {
      return <InboxView activities={props.activities} onMarkAllRead={actions.markAllRead} />;
  }

  if (currentView === 'settings') {
      return (
          <SettingsView 
              users={props.users} projects={props.projects} statuses={props.statuses} priorities={props.priorities} tables={props.tables} automationRules={props.automationRules} currentUser={props.currentUser}
              onUpdateUsers={actions.updateUsers} onUpdateProjects={actions.updateProjects} onUpdateStatuses={actions.updateStatuses} onUpdatePriorities={actions.updatePriorities}
              onUpdateTable={actions.updateTable} onCreateTable={actions.openCreateTable} onDeleteTable={actions.deleteTable}
              onUpdateNotificationPrefs={actions.updateNotificationPrefs} onSaveAutomationRule={actions.saveAutomationRule} onDeleteAutomationRule={actions.deleteAutomationRule}
              onUpdateProfile={actions.updateProfile} onSaveDeal={actions.saveDeal} onClose={actions.closeSettings} initialTab={props.settingsActiveTab}
          />
      );
  }

  if (currentView === 'doc-editor' && props.activeDoc) {
      return <DocEditor doc={props.activeDoc} onSave={actions.saveDocContent} onBack={() => { actions.setCurrentView('table'); actions.setActiveTableId(props.activeDoc!.tableId); }} />;
  }

  if (currentView === 'analytics') {
      return <AnalyticsView tasks={props.filteredTasks} deals={props.deals} users={props.users} financePlan={props.financePlan} contracts={props.contracts} />;
  }

  // 2. Search (Global)
  if (currentView === 'search') {
      return <TableView tasks={props.filteredTasks} users={props.users} projects={props.projects} statuses={props.statuses} priorities={props.priorities} tables={props.tables} isAggregator={true} currentUser={props.currentUser} businessProcesses={props.businessProcesses} onUpdateTask={(id, updates) => actions.saveTask({ id, ...updates })} onDeleteTask={actions.deleteTask} onOpenTask={actions.openTaskModal} />;
  }

  // 3. Modules
  if (currentView === 'table') {
      if (!activeTable) {
          return <div className="p-10 text-center text-gray-500">Страница не найдена. Выберите страницу из списка.</div>;
      }
                        return <SpaceModule
                            activeTable={activeTable} viewMode={props.viewMode} tasks={props.filteredTasks}
                            users={props.users} currentUser={props.currentUser} projects={props.projects}
                            statuses={props.statuses} priorities={props.priorities} tables={props.tables}
                            docs={props.docs} folders={props.folders} meetings={props.meetings}
                            contentPosts={props.contentPosts} businessProcesses={props.businessProcesses}
                            actions={actions}
                        />;
  }

  if (currentView === 'sales-funnel' || currentView === 'clients') {
      return <CRMModule view={currentView} deals={props.deals} clients={props.clients} contracts={props.contracts} users={props.users} projects={props.projects} tasks={props.allTasks} actions={actions} />;
  }

  if (currentView === 'finance') {
      return <FinanceModule categories={props.financeCategories} plan={props.financePlan} requests={props.purchaseRequests} departments={props.departments} users={props.users} currentUser={props.currentUser} actions={actions} />;
  }

  if (currentView === 'inventory') {
      return (
        <InventoryView 
          departments={props.departments}
          warehouses={props.warehouses}
          items={props.inventoryItems}
          balances={props.inventoryBalances}
          movements={props.inventoryMovements}
          currentUserId={props.currentUser?.id || ''}
          onSaveWarehouse={actions.saveWarehouse}
          onDeleteWarehouse={actions.deleteWarehouse}
          onSaveItem={actions.saveInventoryItem}
          onDeleteItem={actions.deleteInventoryItem}
          onCreateMovement={actions.createInventoryMovement}
        />
      );
  }

  if (currentView === 'employees' || currentView === 'departments' || currentView === 'business-processes') {
      return <HRModule 
          view={currentView} 
          employees={props.employeeInfos} 
          users={props.users} 
          departments={props.departments} 
          orgPositions={props.orgPositions} 
          processes={props.businessProcesses}
          tasks={props.filteredTasks}
          tables={props.tables}
          actions={actions} 
      />;
  }

  return <div className="p-10 text-center text-gray-500">Выберите страницу</div>;
};

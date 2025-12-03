
import { storageService } from "../../services/storageService";
import { Department, FinanceCategory, FinancePlan, PurchaseRequest } from "../../types";

export const departmentsEndpoint = {
  getAll: () => storageService.getDepartments(),
  updateAll: (deps: Department[]) => storageService.setDepartments(deps),
};

export const financeEndpoint = {
  getCategories: () => storageService.getFinanceCategories(),
  updateCategories: (cats: FinanceCategory[]) => storageService.setFinanceCategories(cats),
  
  getPlan: () => storageService.getFinancePlan(),
  updatePlan: (plan: FinancePlan) => storageService.setFinancePlan(plan),
  
  getRequests: () => storageService.getPurchaseRequests(),
  updateRequests: (reqs: PurchaseRequest[]) => storageService.setPurchaseRequests(reqs),
};

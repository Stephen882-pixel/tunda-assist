/**
 * Conversation flow state management types
 */

export enum FlowType {
  NONE = 'NONE',
  COMMISSION_CHECK = 'COMMISSION_CHECK',
}

export enum CommissionFlowStep {
  ASK_EMPLOYEE_ID = 'ASK_EMPLOYEE_ID',
  SHOW_PERIOD_OPTIONS = 'SHOW_PERIOD_OPTIONS',
  SHOW_SUMMARY = 'SHOW_SUMMARY',
  ASK_BREAKDOWN = 'ASK_BREAKDOWN',
  SELECT_MILESTONE = 'SELECT_MILESTONE',
  SHOW_MILESTONE_DETAIL = 'SHOW_MILESTONE_DETAIL',
  COMPLETE = 'COMPLETE',
}

export interface ConversationState {
  flowType: FlowType;
  currentStep?: CommissionFlowStep;
  data?: Record<string, any>;
}

export interface EmployeeInfo {
  employeeId: string;
  employeeName: string;
  employeePhone: string;
}

export interface CommissionSummary {
  totalAmount: number;
  period: number;
  breakdown: Array<{
    source: string;
    amount: number;
  }>;
}

export interface MilestoneDetail {
  source: string;
  weeks: Array<{
    weekLabel: string;
    customers: Array<{
      customerName: string;
      amount: number;
    }>;
    weekTotal: number;
  }>;
}

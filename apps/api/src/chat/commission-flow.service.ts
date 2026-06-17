import { Injectable, Logger } from '@nestjs/common';
import { CommissionService } from '../tools/commission/commission.service';
import {
  ConversationState,
  FlowType,
  CommissionFlowStep,
  EmployeeInfo,
  CommissionSummary,
  MilestoneDetail,
} from './types/conversation-state.types';

@Injectable()
export class CommissionFlowService {
  private readonly logger = new Logger(CommissionFlowService.name);

  constructor(private readonly commissionService: CommissionService) {}

  /**
   * Check if user message is trying to start the commission flow
   */
  isCommissionCheckRequest(message: string): boolean {
    const lower = message.toLowerCase().trim();
    return (
      lower.includes('commission') ||
      lower.includes('commision') || // Handle typo (single s)
      lower.includes('payment') ||
      lower.includes('earning') ||
      lower.includes('paid') ||
      lower.includes('check my') ||
      lower === '1' // From common questions menu
    );
  }

  /**
   * Initialize commission check flow
   */
  startCommissionFlow(): { response: string; state: ConversationState } {
    return {
      response:
        "Sure! Let me pull your commission data. 📊\n\nFirst, please enter your **Employee ID** or **Full Name** to look you up:",
      state: {
        flowType: FlowType.COMMISSION_CHECK,
        currentStep: CommissionFlowStep.ASK_EMPLOYEE_ID,
        data: {},
      },
    };
  }

  /**
   * Process user input based on current flow state
   */
  async processFlowMessage(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    if (!state.currentStep) {
      return this.startCommissionFlow();
    }

    switch (state.currentStep) {
      case CommissionFlowStep.ASK_EMPLOYEE_ID:
        return await this.handleEmployeeIdInput(message, state);

      case CommissionFlowStep.SHOW_PERIOD_OPTIONS:
        return await this.handlePeriodSelection(message, state);

      case CommissionFlowStep.ASK_BREAKDOWN:
        return await this.handleBreakdownChoice(message, state);

      case CommissionFlowStep.SELECT_MILESTONE:
        return await this.handleMilestoneSelection(message, state);

      case CommissionFlowStep.SHOW_MILESTONE_DETAIL:
        return await this.handlePostBreakdown(message, state);

      case CommissionFlowStep.COMPLETE:
        return this.handleComplete(message);

      default:
        return this.startCommissionFlow();
    }
  }

  /**
   * Handle employee ID/name input
   */
  private async handleEmployeeIdInput(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    const employee = await this.commissionService.findEmployeeByIdOrName(
      message.trim(),
    );

    if (!employee) {
      return {
        response: `I couldn't find an employee with ID or name "${message}". Please double-check and try again:`,
        state,
      };
    }

    // Check if trying to access another employee's data
    const authenticatedEmployeeId = state.data?.authenticatedEmployeeId;
    if (authenticatedEmployeeId && authenticatedEmployeeId !== employee.employeeId) {
      return {
        response: `🚫 **Not Authorized**\n\nYou can only view your own commission details. You are currently authenticated as Employee ID: ${authenticatedEmployeeId}.\n\nIf you'd like to check your commissions, please confirm your own Employee ID.`,
        state: {
          ...state,
          currentStep: CommissionFlowStep.ASK_EMPLOYEE_ID,
        },
      };
    }

    const newState: ConversationState = {
      ...state,
      currentStep: CommissionFlowStep.SHOW_PERIOD_OPTIONS,
      data: {
        ...state.data,
        employee,
        authenticatedEmployeeId: employee.employeeId, // Lock this session to this employee
      },
    };

    return {
      response: `Found you! Hello **${employee.employeeName}** 👋\n\nSelect the commission period:\n\n1️⃣ 14 days\n2️⃣ 30 days\n3️⃣ 60 days\n4️⃣ 90 days`,
      state: newState,
    };
  }

  /**
   * Handle period selection
   */
  private async handlePeriodSelection(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    const period = this.parsePeriodInput(message);

    if (!period) {
      return {
        response:
          'Please select a valid period (1, 2, 3, or 4):\n\n1️⃣ 14 days\n2️⃣ 30 days\n3️⃣ 60 days\n4️⃣ 90 days',
        state,
      };
    }

    const employee = state.data?.employee as EmployeeInfo;
    const authenticatedEmployeeId = state.data?.authenticatedEmployeeId;

    // Additional authorization check - ensure employee ID matches authenticated ID
    if (!authenticatedEmployeeId || employee.employeeId !== authenticatedEmployeeId) {
      return {
        response: `🚫 **Not Authorized**\n\nSession authentication error. Please start over and enter your Employee ID.`,
        state: {
          flowType: FlowType.COMMISSION_CHECK,
          currentStep: CommissionFlowStep.ASK_EMPLOYEE_ID,
          data: {},
        },
      };
    }

    const summary = await this.commissionService.getCommissionSummaryData(
      employee.employeePhone,
      period,
    );

    if (summary.totalAmount === 0) {
      return {
        response: `📊 Commission for ${period} days\n\nNo commission records found for the last ${period} days.\n\nWould you like to try a different period?\n\n1️⃣ Yes, try another period\n2️⃣ No, I'm done`,
        state: {
          ...state,
          currentStep: CommissionFlowStep.COMPLETE,
        },
      };
    }

    const breakdownText = summary.breakdown
      .map((item) => `💰 **${item.source}**: KES ${item.amount.toLocaleString()}`)
      .join('\n');

    const newState: ConversationState = {
      ...state,
      currentStep: CommissionFlowStep.ASK_BREAKDOWN,
      data: {
        ...state.data,
        period,
        summary,
      },
    };

    return {
      response: `📊 **Commission for ${period} days**\n\n**Total: KES ${summary.totalAmount.toLocaleString()}**\n\n${breakdownText}\n\nWould you like a breakdown of the above?\n\n1️⃣ Yes, show breakdown\n2️⃣ No, I'm done`,
      state: newState,
    };
  }

  /**
   * Handle breakdown choice
   */
  private async handleBreakdownChoice(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    const choice = message.trim().toLowerCase();

    if (choice === '2' || choice.includes('no') || choice.includes('done')) {
      return {
        response:
          'Was this helpful?\n\n1️⃣ Yes\n2️⃣ No\n\n---\n\nHow else can I help you?\n\n**COMMON QUESTIONS**\n• Check my commissions\n• Product information\n• Account status',
        state: {
          flowType: FlowType.NONE,
          currentStep: CommissionFlowStep.COMPLETE,
          data: {},
        },
      };
    }

    if (choice === '1' || choice.includes('yes') || choice.includes('breakdown')) {
      const summary = state.data?.summary as CommissionSummary;
      const milestones = summary.breakdown
        .map((item, index) => `${index + 1}️⃣ ${item.source}`)
        .join('\n');

      return {
        response: `Select a milestone to view its breakdown:\n\n${milestones}`,
        state: {
          ...state,
          currentStep: CommissionFlowStep.SELECT_MILESTONE,
        },
      };
    }

    return {
      response:
        'Please select an option:\n\n1. Yes, show breakdown\n2. No, I\'m done',
      state,
    };
  }

  /**
   * Handle milestone selection
   */
  private async handleMilestoneSelection(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    const summary = state.data?.summary as CommissionSummary;
    const employee = state.data?.employee as EmployeeInfo;
    const period = state.data?.period as number;
    const authenticatedEmployeeId = state.data?.authenticatedEmployeeId;

    // Authorization check - ensure employee ID matches authenticated ID
    if (!authenticatedEmployeeId || employee.employeeId !== authenticatedEmployeeId) {
      return {
        response: `🚫 **Not Authorized**\n\nYou can only view your own commission details.`,
        state: {
          flowType: FlowType.COMMISSION_CHECK,
          currentStep: CommissionFlowStep.ASK_EMPLOYEE_ID,
          data: {},
        },
      };
    }

    const selection = parseInt(message.trim());
    if (isNaN(selection) || selection < 1 || selection > summary.breakdown.length) {
      const milestones = summary.breakdown
        .map((item, index) => `${index + 1}️⃣ ${item.source}`)
        .join('\n');
      return {
        response: `Please select a valid milestone number:\n\n${milestones}`,
        state,
      };
    }

    const selectedSource = summary.breakdown[selection - 1].source;
    const detail = await this.commissionService.getMilestoneDetail(
      employee.employeePhone,
      period,
      selectedSource,
    );

    let response = `**${selectedSource} breakdown:**\n\n`;

    for (const week of detail.weeks) {
      response += `**${week.weekLabel}**\n`;
      for (const customer of week.customers) {
        response += `• ${customer.customerName}: KES ${customer.amount.toLocaleString()}\n`;
      }
      response += `**Week Total**: KES ${week.weekTotal.toLocaleString()}\n\n`;
    }

    response += 'Was this helpful?\n\n1️⃣ Yes\n2️⃣ No';

    return {
      response,
      state: {
        ...state,
        currentStep: CommissionFlowStep.SHOW_MILESTONE_DETAIL,
      },
    };
  }

  /**
   * Handle post-breakdown response
   */
  private async handlePostBreakdown(
    message: string,
    state: ConversationState,
  ): Promise<{ response: string; state: ConversationState }> {
    return {
      response:
        'How else can I help you?\n\n**COMMON QUESTIONS**\n• Check my commissions\n• Product information\n• Account status\n• Technical support',
      state: {
        flowType: FlowType.NONE,
        data: {},
      },
    };
  }

  /**
   * Handle completion
   */
  private handleComplete(message: string): {
    response: string;
    state: ConversationState;
  } {
    return {
      response:
        'How else can I help you?\n\n**COMMON QUESTIONS**\n• Check my commissions\n• Product information\n• Account status\n• Technical support',
      state: {
        flowType: FlowType.NONE,
        data: {},
      },
    };
  }

  /**
   * Parse period input (number or text)
   */
  private parsePeriodInput(input: string): number | null {
    const lower = input.trim().toLowerCase();

    if (lower === '1' || lower.includes('14')) return 14;
    if (lower === '2' || lower.includes('30')) return 30;
    if (lower === '3' || lower.includes('60')) return 60;
    if (lower === '4' || lower.includes('90')) return 90;

    return null;
  }
}

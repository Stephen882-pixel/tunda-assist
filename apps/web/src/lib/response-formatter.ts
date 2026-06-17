import { CommissionData, LeadStatus, MessageOption, MilestoneType } from './types';
import { formatCurrency, getPeriodLabel } from './utils';

export class ResponseFormatter {
  // ── Step 2: Ask which period ──
  formatPeriodSelection(): { message: string; options: MessageOption[] } {
    const message = 'Select the Commission period';
    const options: MessageOption[] = [
      { id: 'p_14', label: '14 days', value: '14_days' },
      { id: 'p_30', label: '30 days', value: '30_days' },
      { id: 'p_60', label: '60 days', value: '60_days' },
      { id: 'p_90', label: '90 days', value: '90_days' },
      { id: 'p_custom', label: 'Custom', value: 'custom' },
    ];
    return { message, options };
  }

  // ── Step 6: Commission summary ──
  formatCommissionSummary(data: CommissionData): { message: string; options: MessageOption[] } {
    const periodLabel = getPeriodLabel(data.period);
    const total = data.totalCommission;

    const message = 
      `Commission amount for the ${periodLabel} is ${total}\n\n` +
      `Breakdown Summary:\n` +
      `CDS2: ${data.milestoneBreakdown.cds2}\n` +
      `JSF: ${data.milestoneBreakdown.jsf}\n` +
      `Transport Allowance: ${data.milestoneBreakdown.transportAllowance}\n` +
      `TV: ${data.milestoneBreakdown.tv}\n` +
      `Direct Drip: ${data.milestoneBreakdown.directDrip}`;

    // Step 7: ask for breakdown
    const options: MessageOption[] = [
      { id: 'breakdown_yes', label: 'Yes', value: 'breakdown_yes' },
      { id: 'breakdown_no', label: 'No', value: 'breakdown_no' },
    ];

    return { message, options };
  }

  // ── Ask "would you like a breakdown?" label ──
  formatBreakdownPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Would you like a breakdown of the above';
    const options: MessageOption[] = [
      { id: 'breakdown_yes', label: 'Yes', value: 'breakdown_yes' },
      { id: 'breakdown_no', label: 'No', value: 'breakdown_no' },
    ];
    return { message, options };
  }

  // ── Ask which milestone breakdown to see ──
  formatMilestoneSelection(): { message: string; options: MessageOption[] } {
    const message = 'Which breakdown milestone would you like to see?';
    const options: MessageOption[] = [
      { id: 'milestone_cds2', label: 'CDS2', value: 'cds2' },
      { id: 'milestone_jsf', label: 'JSF', value: 'jsf' },
      { id: 'milestone_transport', label: 'Transport Allowance', value: 'transportAllowance' },
      { id: 'milestone_tv', label: 'TV', value: 'tv' },
      { id: 'milestone_drip', label: 'Direct Drip', value: 'directDrip' },
    ];
    return { message, options };
  }

  // ── Show customer breakdown for selected milestone ──
  formatMilestoneBreakdown(
    data: CommissionData,
    milestone: MilestoneType
  ): { message: string; options: MessageOption[] } {
    const milestoneLabels: Record<MilestoneType, string> = {
      cds2: 'CDS2',
      jsf: 'JSF',
      transportAllowance: 'Transport Allowance',
      tv: 'TV',
      directDrip: 'Direct Drip',
    };

    const milestoneLabel = milestoneLabels[milestone];
    const total = data.milestoneBreakdown[milestone];

    let message = `${milestoneLabel} Breakdown:\n\nTotal: ${total}\n\n`;
    
    // Transport Allowance uses week-based breakdown
    if (milestone === 'transportAllowance') {
      const weeks = data.milestoneDetails.transportAllowance;
      weeks.forEach((week) => {
        message += `${week.week}: ${week.amount}\n`;
      });
    } else {
      // Other milestones use customer-based breakdown
      const customers = data.milestoneDetails[milestone];
      customers.forEach((customer) => {
        message += `${customer.customer}: ${customer.amount}\n`;
      });
    }

    const options: MessageOption[] = [
      { id: 'see_another_milestone', label: 'See another milestone', value: 'see_another_milestone' },
      { id: 'back_to_menu', label: 'Back to main menu', value: 'back_to_menu' },
    ];
    return { message, options };
  }

  // ── Step 8: Detailed breakdown ──
  formatCommissionBreakdown(data: CommissionData): {
    message: string;
    options: MessageOption[];
    breakdownData: import('./types').BreakdownData;
  } {
    const periodLabel = getPeriodLabel(data.period);

    const message = `Commission Breakdown for ${periodLabel}`;
    const options: MessageOption[] = [];

    const breakdownData: import('./types').BreakdownData = {
      periodLabel,
      sections: [
        {
          title: 'Sales Commissions',
          icon: '💰',
          items: data.salesBreakdown.map((s) => ({
            label: s.customer,
            amount: s.amount,
            currency: data.currency,
          })),
        },
        {
          title: 'Transport Commissions',
          icon: '🚛',
          items: data.transportBreakdown.map((t) => ({
            label: t.week,
            amount: t.amount,
            currency: data.currency,
          })),
        },
      ],
    };

    return { message, options, breakdownData };
  }

  // ── Step 10: Feedback ──
  formatFeedbackPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Was this helpful?';
    const options: MessageOption[] = [
      { id: 'helpful_yes', label: 'Yes', value: 'helpful_yes' },
      { id: 'helpful_no', label: 'No', value: 'helpful_no' },
    ];
    return { message, options };
  }

  // ── Feedback received ──
  formatFeedbackThanks(positive: boolean): { message: string; options: MessageOption[] } {
    const message = positive
      ? 'Thank you for your response\nWhat is something else you would like to check?'
      : 'Sorry about that. What would you like to do?';
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check commission periods', value: 'commissions' },
      { id: 'check_leads', label: 'Check customers or Leads', value: 'leads' },
      { id: 'calculate', label: 'Calculate Commissions', value: 'calculate' },
      { id: 'breakdown', label: 'Check a break down of commissions', value: 'commissions' },
    ];
    return { message, options };
  }

  // ── Lead flow: ask for identifier ──
  formatLeadIdPrompt(): { message: string; options: MessageOption[] } {
    const message = 'Please enter the customer/lead identifier (name, phone, email, or ID):';
    return { message, options: [] };
  }

  // ── Lead status result ──
  formatLeadStatus(lead: LeadStatus): { message: string; options: MessageOption[] } {
    const message =
      `👤 Lead: ${lead.leadName}\n` +
      `📌 Status: ${lead.status}\n` +
      `📅 Last Contact: ${lead.lastContact}` +
      (lead.conversionValue ? `\n💰 Conversion Value: ${formatCurrency(lead.conversionValue)}` : '') +
      (lead.notes ? `\n📝 Notes: ${lead.notes}` : '');

    const options: MessageOption[] = [];
    return { message, options };
  }

  // ── Greeting ──
  formatGreeting(): { message: string; options: MessageOption[] } {
    const message =
      'What would you like to check?';
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check my commissions', value: 'commissions' },
      { id: 'check_leads', label: 'Check customer or leads', value: 'leads' },
      { id: 'calculate', label: 'How much I get paid per Lead', value: 'calculate' },
    ];
    return { message, options };
  }

  // ── Unknown ──
  formatUnknown(): { message: string; options: MessageOption[] } {
    const message = "I didn't quite understand that. What would you like to do?";
    const options: MessageOption[] = [
      { id: 'check_commissions', label: 'Check my commissions', value: 'commissions' },
      { id: 'check_leads', label: 'Check customer or leads', value: 'leads' },
      { id: 'calculate', label: 'How much I get paid per Lead', value: 'calculate' },
    ];
    return { message, options };
  }
}

export const responseFormatter = new ResponseFormatter();

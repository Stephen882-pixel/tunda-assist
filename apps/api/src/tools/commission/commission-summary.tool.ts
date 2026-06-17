import { Injectable } from '@nestjs/common';
import { CommissionService } from './commission.service';

export type CommissionPeriod = '14_days' | '30_days' | '60_days' | '90_days';

@Injectable()
export class CommissionSummaryTool {
  constructor(private readonly commissionService: CommissionService) {}

  execute(period: CommissionPeriod, phone: string): string {
    if (!phone || phone.trim() === '') {
      return 'Please provide your phone number to check commission summary.';
    }

    const employeeInfo = this.commissionService.getEmployeeInfo(phone);
    if (!employeeInfo) {
      return `No commission records found for phone number ${phone}. Please verify your phone number is registered in the system.`;
    }

    const days = this.periodToDays(period);
    const result = this.commissionService.getTotalCommissions(phone, days);

    const periodLabel =
      period === '14_days'
        ? '14 days'
        : period === '30_days'
        ? '30 days'
        : period === '60_days'
        ? '60 days'
        : '90 days';

    if (result.count === 0) {
      // Check if employee has ANY commissions at all
      const allCommissions = this.commissionService.getCommissionsByPhone(phone);
      if (allCommissions.length > 0) {
        // They have commissions, just not in this period
        const recentTransactions = this.commissionService.getRecentTransactions(phone, 1);
        if (recentTransactions.length > 0) {
          return `No commission payments found for ${employeeInfo.name} in the last ${periodLabel}. 

However, I found ${allCommissions.length} commission record(s) in your history. Your most recent commission was on ${recentTransactions[0].date}.

If you'd like to check commissions for a specific month (like February 2026), please let me know!`;
        }
      }
      return `No commission payments found for ${employeeInfo.name} in the last ${periodLabel}.`;
    }

    const formattedAmount = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(result.total);

    return `Commission Summary for ${employeeInfo.name}:
Period: Last ${periodLabel}
Total Commission: ${formattedAmount}
Number of Transactions: ${result.count}

This includes all commission payments recorded in your account during this period.`;
  }

  private periodToDays(period: CommissionPeriod): number {
    switch (period) {
      case '14_days':
        return 14;
      case '30_days':
        return 30;
      case '60_days':
        return 60;
      case '90_days':
        return 90;
      default:
        return 30;
    }
  }
}

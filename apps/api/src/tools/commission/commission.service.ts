import { Injectable, OnModuleInit } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import csv from 'csv-parser';

interface CommissionRecord {
  employeeName: string;
  employeeIdNumber: string;
  employeePhone: string;
  employeeSystemId: string;
  accountId: string;
  accountRef: string;
  customerName: string;
  accountType: string;
  product: string;
  commissionSource: string;
  week: string;
  commissionSchedule: string;
  milestoneType: string;
  milestoneName: string;
  saleDate: string;
  milestoneDate: string;
  amount: number;
}

@Injectable()
export class CommissionService implements OnModuleInit {
  private commissions: CommissionRecord[] = [];
  private loaded = false;

  async onModuleInit() {
    await this.loadCommissions();
  }

  private async loadCommissions(): Promise<void> {
    const csvPath = join(process.cwd(), 'February_2026_Master_Commissions.csv');
    const records: CommissionRecord[] = [];

    return new Promise((resolve, reject) => {
      createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          records.push({
            employeeName: row['Employee Name'],
            employeeIdNumber: row['Employee ID Number'],
            employeePhone: row['Employee Phone'],
            employeeSystemId: row['Employee System ID'],
            accountId: row['Account ID'],
            accountRef: row['Account Ref'],
            customerName: row['Customer Name'],
            accountType: row['Account Type'],
            product: row['Product'],
            commissionSource: row['Commission Source'],
            week: row['Week'],
            commissionSchedule: row['Commission Schedule'],
            milestoneType: row['Milestone Type'],
            milestoneName: row['Milestone Name'],
            saleDate: row['Sale Date'],
            milestoneDate: row['Milestone Date'],
            amount: this.parseAmount(row['Amount (KES)']),
          });
        })
        .on('end', () => {
          this.commissions = records;
          this.loaded = true;
          console.log(`[CommissionService] Loaded ${records.length} commission records`);
          resolve();
        })
        .on('error', (error) => {
          console.error('[CommissionService] Error loading CSV:', error);
          reject(error);
        });
    });
  }

  private parseAmount(amountStr: string): number {
    // Remove commas and quotes, then parse as float
    const cleaned = amountStr.replace(/[,"]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private parseDate(dateStr: string): Date {
    // Handle dates like "02 Feb 2026" or "2026-02-02"
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
    // Fallback: try parsing manually
    const parts = dateStr.split(/[\s-]+/);
    if (parts.length >= 3) {
      // Try month name format
      return new Date(dateStr);
    }
    return new Date(); // Fallback to now if parsing fails
  }

  private normalizePhone(phone: string): string {
    // Normalize phone to 254... format
    let normalized = phone.replace(/[^0-9]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '254' + normalized.substring(1);
    } else if (normalized.startsWith('7') || normalized.startsWith('1')) {
      normalized = '254' + normalized;
    }
    return normalized;
  }

  getCommissionsByPhone(phone: string): CommissionRecord[] {
    const normalizedPhone = this.normalizePhone(phone);
    return this.commissions.filter(
      (c) => this.normalizePhone(c.employeePhone) === normalizedPhone
    );
  }

  getTotalCommissions(phone: string, days: number = 30): {
    total: number;
    count: number;
    period: string;
  } {
    const employeeCommissions = this.getCommissionsByPhone(phone);
    
    if (employeeCommissions.length === 0) {
      return { total: 0, count: 0, period: `${days} days` };
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    const filtered = employeeCommissions.filter((c) => {
      const commDate = this.parseDate(c.milestoneDate);
      return commDate >= startDate && commDate <= now;
    });

    const total = filtered.reduce((sum, c) => sum + c.amount, 0);

    return {
      total,
      count: filtered.length,
      period: `${days} days`,
    };
  }

  getCommissionBreakdown(phone: string, days: number = 30): {
    breakdown: Array<{ source: string; amount: number; count: number }>;
    total: number;
  } {
    const employeeCommissions = this.getCommissionsByPhone(phone);

    if (employeeCommissions.length === 0) {
      return { breakdown: [], total: 0 };
    }

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);

    const filtered = employeeCommissions.filter((c) => {
      const commDate = this.parseDate(c.milestoneDate);
      return commDate >= startDate && commDate <= now;
    });

    // Group by commission source
    const grouped = filtered.reduce((acc, c) => {
      const source = c.commissionSource || 'Other';
      if (!acc[source]) {
        acc[source] = { amount: 0, count: 0 };
      }
      acc[source].amount += c.amount;
      acc[source].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const breakdown = Object.entries(grouped).map(([source, data]) => ({
      source,
      amount: data.amount,
      count: data.count,
    }));

    const total = breakdown.reduce((sum, b) => sum + b.amount, 0);

    return { breakdown, total };
  }

  getEmployeeInfo(phone: string): {
    name: string;
    phone: string;
    employeeId: string;
  } | null {
    const normalizedPhone = this.normalizePhone(phone);
    const record = this.commissions.find(
      (c) => this.normalizePhone(c.employeePhone) === normalizedPhone
    );

    if (!record) {
      return null;
    }

    return {
      name: record.employeeName,
      phone: record.employeePhone,
      employeeId: record.employeeIdNumber,
    };
  }

  getRecentTransactions(phone: string, limit: number = 5): Array<{
    customerName: string;
    amount: number;
    date: string;
    source: string;
    accountType: string;
  }> {
    const employeeCommissions = this.getCommissionsByPhone(phone);

    return employeeCommissions
      .sort((a, b) => this.parseDate(b.milestoneDate).getTime() - this.parseDate(a.milestoneDate).getTime())
      .slice(0, limit)
      .map((c) => ({
        customerName: c.customerName,
        amount: c.amount,
        date: c.milestoneDate,
        source: c.commissionSource,
        accountType: c.accountType,
      }));
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  getCommissionsByMonth(phone: string, month: number, year: number): {
    total: number;
    count: number;
    breakdown: Array<{ source: string; amount: number; count: number }>;
  } {
    const employeeCommissions = this.getCommissionsByPhone(phone);

    if (employeeCommissions.length === 0) {
      return { total: 0, count: 0, breakdown: [] };
    }

    const filtered = employeeCommissions.filter((c) => {
      const commDate = this.parseDate(c.milestoneDate);
      return commDate.getMonth() === month - 1 && commDate.getFullYear() === year;
    });

    const grouped = filtered.reduce((acc, c) => {
      const source = c.commissionSource || 'Other';
      if (!acc[source]) {
        acc[source] = { amount: 0, count: 0 };
      }
      acc[source].amount += c.amount;
      acc[source].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const breakdown = Object.entries(grouped).map(([source, data]) => ({
      source,
      amount: data.amount,
      count: data.count,
    }));

    const total = filtered.reduce((sum, c) => sum + c.amount, 0);

    return { total, count: filtered.length, breakdown };
  }

  /**
   * Find employee by ID number or name (case-insensitive partial match)
   */
  async findEmployeeByIdOrName(searchTerm: string): Promise<{
    employeeId: string;
    employeeName: string;
    employeePhone: string;
  } | null> {
    const term = searchTerm.trim().toLowerCase();

    // First try exact ID match
    const byId = this.commissions.find(
      (c) => c.employeeIdNumber.toLowerCase() === term
    );
    if (byId) {
      return {
        employeeId: byId.employeeIdNumber,
        employeeName: byId.employeeName,
        employeePhone: byId.employeePhone,
      };
    }

    // Then try name match (partial)
    const byName = this.commissions.find((c) =>
      c.employeeName.toLowerCase().includes(term)
    );
    if (byName) {
      return {
        employeeId: byName.employeeIdNumber,
        employeeName: byName.employeeName,
        employeePhone: byName.employeePhone,
      };
    }

    return null;
  }

  /**
   * Get commission summary with breakdown for flow service
   */
  async getCommissionSummaryData(
    phone: string,
    period: number,
  ): Promise<{
    totalAmount: number;
    period: number;
    breakdown: Array<{ source: string; amount: number }>;
  }> {
    const result = this.getCommissionBreakdown(phone, period);

    return {
      totalAmount: result.total,
      period,
      breakdown: result.breakdown.map((b) => ({
        source: b.source,
        amount: b.amount,
      })),
    };
  }

  /**
   * Get detailed milestone breakdown by week with customer names
   */
  async getMilestoneDetail(
    phone: string,
    period: number,
    source: string,
  ): Promise<{
    source: string;
    weeks: Array<{
      weekLabel: string;
      customers: Array<{ customerName: string; amount: number }>;
      weekTotal: number;
    }>;
  }> {
    const employeeCommissions = this.getCommissionsByPhone(phone);

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - period);

    // Filter by date and source
    const filtered = employeeCommissions.filter((c) => {
      const commDate = this.parseDate(c.milestoneDate);
      return (
        commDate >= startDate &&
        commDate <= now &&
        c.commissionSource === source
      );
    });

    // Group by week
    const weekMap = new Map<
      string,
      Array<{ customerName: string; amount: number }>
    >();

    filtered.forEach((c) => {
      const weekLabel = c.week; // e.g., "Week 6"
      if (!weekMap.has(weekLabel)) {
        weekMap.set(weekLabel, []);
      }
      weekMap.get(weekLabel)!.push({
        customerName: c.customerName,
        amount: c.amount,
      });
    });

    // Convert to array and sort by week number
    const weeks = Array.from(weekMap.entries())
      .map(([weekLabel, customers]) => {
        const weekTotal = customers.reduce((sum, c) => sum + c.amount, 0);
        return { weekLabel, customers, weekTotal };
      })
      .sort((a, b) => {
        // Extract week number for sorting
        const aNum = parseInt(a.weekLabel.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.weekLabel.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });

    return { source, weeks };
  }
}

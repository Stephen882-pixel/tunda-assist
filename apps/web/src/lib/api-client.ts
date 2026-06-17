import { CommissionData, LeadStatus, CommissionPeriod } from './types';
import { mockCommissionData, mockLeads } from './mock-data';

// Mock API client — replace with real fetch calls when integrating
export class ApiClient {

  async getCommissionData(period: CommissionPeriod): Promise<CommissionData> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = mockCommissionData[period];
        resolve(data || mockCommissionData['14_days']);
      }, 500); // Simulate network delay
    });
  }

  async getLeadStatus(leadId: string): Promise<LeadStatus> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lead = mockLeads[leadId] || mockLeads['default'];
        resolve(lead);
      }, 500); // Simulate network delay
    });
  }

  async detectIntent(_userInput: string): Promise<{ intent: string; parameters: Record<string, unknown> }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Intent detection would happen on the backend
        resolve({
          intent: 'commission_summary',
          parameters: { period: '14_days' },
        });
      }, 300);
    });
  }
}

export const apiClient = new ApiClient();

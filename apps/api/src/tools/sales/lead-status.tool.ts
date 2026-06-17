import { Injectable } from '@nestjs/common';

interface LeadInfo {
  leadId: string;
  customerName: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lastContact: string;
  nextAction: string;
  conversionValue?: number;
  notes: string;
}

// Mock lead data
const MOCK_LEADS: Record<string, LeadInfo> = {
  'LEAD-001': {
    leadId: 'LEAD-001',
    customerName: 'John Kamau',
    status: 'qualified',
    lastContact: '2026-04-27',
    nextAction: 'Schedule farm visit for system demo',
    conversionValue: 64999,
    notes: '2-acre farm near Naivasha, interested in RainMaker Kubwa',
  },
  'LEAD-002': {
    leadId: 'LEAD-002',
    customerName: 'Mary Wanjiku',
    status: 'converted',
    lastContact: '2026-04-28',
    nextAction: 'Installation scheduled for May 5th',
    conversionValue: 44999,
    notes: 'Purchased RainMaker 2S with PAYGO plan. Very satisfied.',
  },
  'LEAD-003': {
    leadId: 'LEAD-003',
    customerName: 'Peter Ochieng',
    status: 'contacted',
    lastContact: '2026-04-20',
    nextAction: 'Follow up call needed',
    notes: 'Expressed interest but concerned about deposit amount',
  },
  'LEAD-004': {
    leadId: 'LEAD-004',
    customerName: 'Grace Mutiso',
    status: 'new',
    lastContact: '2026-04-29',
    nextAction: 'Initial contact call scheduled',
    notes: 'New lead from referral program. Has 3-acre vegetable farm.',
  },
  'LEAD-005': {
    leadId: 'LEAD-005',
    customerName: 'David Kipchoge',
    status: 'lost',
    lastContact: '2026-04-10',
    nextAction: 'None - closed lost',
    notes: 'Decided to go with competitor due to lower prices',
  },
};

@Injectable()
export class LeadStatusTool {
  execute(leadId: string): string {
    // Normalize the lead ID (remove spaces, convert to uppercase)
    const normalizedId = leadId.trim().toUpperCase();

    // Try to find the lead
    const lead =
      MOCK_LEADS[normalizedId] ?? MOCK_LEADS['LEAD-001']; // Default fallback

    let response = `Lead Information:\n\n`;
    response += `Lead ID: ${lead.leadId}\n`;
    response += `Customer: ${lead.customerName}\n`;
    response += `Status: ${this.formatStatus(lead.status)}\n`;
    response += `Last Contact: ${lead.lastContact}\n`;
    response += `Next Action: ${lead.nextAction}\n`;

    if (lead.conversionValue) {
      response += `Expected Value: KES ${lead.conversionValue.toLocaleString()}\n`;
    }

    response += `\nNotes: ${lead.notes}\n`;

    // Add contextual advice based on status
    if (lead.status === 'new') {
      response += `\n💡 Tip: Make initial contact within 24 hours for best conversion rates.`;
    } else if (lead.status === 'contacted') {
      response += `\n💡 Tip: Follow up within 3 days to maintain engagement.`;
    } else if (lead.status === 'qualified') {
      response += `\n💡 Tip: Schedule a demo or farm visit to move toward conversion.`;
    } else if (lead.status === 'converted') {
      response += `\n✅ Great work! This lead is now a customer.`;
    }

    return response;
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      new: '🆕 New Lead',
      contacted: '📞 Contacted',
      qualified: '✓ Qualified',
      converted: '✅ Converted',
      lost: '❌ Lost',
    };
    return statusMap[status] ?? status;
  }
}

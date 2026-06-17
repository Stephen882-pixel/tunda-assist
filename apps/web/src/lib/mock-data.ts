import { CommissionData, LeadStatus } from './types';

export const mockCommissionData: Record<string, CommissionData> = {
  '14_days': {
    period: '14_days',
    totalCommission: 35000,
    transportCommission: 15000,
    salesCommission: 20000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 8000 },
      { customer: 'Maina Kamau', amount: 6500 },
      { customer: 'Sarah Wanjiku', amount: 5500 },
    ],
    transportBreakdown: [
      { week: 'Week 1 (Jan 6 – Jan 12)', amount: 7000 },
      { week: 'Week 2 (Jan 13 – Jan 19)', amount: 8000 },
    ],
    milestoneBreakdown: {
      cds2: 8000,
      jsf: 7000,
      transportAllowance: 9000,
      tv: 6000,
      directDrip: 5000,
    },
    milestoneDetails: {
      cds2: [
        { customer: 'Jack Odhiambo', amount: 3500 },
        { customer: 'Maina Kamau', amount: 2500 },
        { customer: 'Sarah Wanjiku', amount: 2000 },
      ],
      jsf: [
        { customer: 'Peter Njoroge', amount: 3000 },
        { customer: 'Grace Akinyi', amount: 2500 },
        { customer: 'David Kimani', amount: 1500 },
      ],
      transportAllowance: [
        { week: 'Week 1 (Jan 6 – Jan 12)', amount: 4500 },
        { week: 'Week 2 (Jan 13 – Jan 19)', amount: 4500 },
      ],
      tv: [
        { customer: 'Lucy Muthoni', amount: 2500 },
        { customer: 'James Kipchoge', amount: 2000 },
        { customer: 'Anne Wairimu', amount: 1500 },
      ],
      directDrip: [
        { customer: 'Simon Kiptoo', amount: 2000 },
        { customer: 'Mary Nyambura', amount: 1800 },
        { customer: 'Paul Omondi', amount: 1200 },
      ],
    },
  },
  '30_days': {
    period: '30_days',
    totalCommission: 72000,
    transportCommission: 32000,
    salesCommission: 40000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 12000 },
      { customer: 'Maina Kamau', amount: 10000 },
      { customer: 'Sarah Wanjiku', amount: 9000 },
      { customer: 'Peter Njoroge', amount: 9000 },
    ],
    transportBreakdown: [
      { week: 'Week 1 (Dec 25 – Dec 31)', amount: 7500 },
      { week: 'Week 2 (Jan 1 – Jan 7)', amount: 8000 },
      { week: 'Week 3 (Jan 8 – Jan 14)', amount: 8500 },
      { week: 'Week 4 (Jan 15 – Jan 21)', amount: 8000 },
    ],
    milestoneBreakdown: {
      cds2: 16000,
      jsf: 15000,
      transportAllowance: 19000,
      tv: 13000,
      directDrip: 9000,
    },
    milestoneDetails: {
      cds2: [
        { customer: 'Jack Odhiambo', amount: 6000 },
        { customer: 'Maina Kamau', amount: 5000 },
        { customer: 'Sarah Wanjiku', amount: 3000 },
        { customer: 'Peter Njoroge', amount: 2000 },
      ],
      jsf: [
        { customer: 'Grace Akinyi', amount: 5500 },
        { customer: 'David Kimani', amount: 4500 },
        { customer: 'Emma Williams', amount: 3000 },
        { customer: 'John Doe', amount: 2000 },
      ],
      transportAllowance: [
        { week: 'Week 1 (Dec 25 – Dec 31)', amount: 4750 },
        { week: 'Week 2 (Jan 1 – Jan 7)', amount: 4750 },
        { week: 'Week 3 (Jan 8 – Jan 14)', amount: 4750 },
        { week: 'Week 4 (Jan 15 – Jan 21)', amount: 4750 },
      ],
      tv: [
        { customer: 'Simon Kiptoo', amount: 5000 },
        { customer: 'Mary Nyambura', amount: 4000 },
        { customer: 'Paul Omondi', amount: 2500 },
        { customer: 'Jane Achieng', amount: 1500 },
      ],
      directDrip: [
        { customer: 'Tom Mutua', amount: 3500 },
        { customer: 'Alice Njeri', amount: 3000 },
        { customer: 'Robert Kibet', amount: 1500 },
        { customer: 'Nancy Chebet', amount: 1000 },
      ],
    },
  },
  '60_days': {
    period: '60_days',
    totalCommission: 156000,
    transportCommission: 66000,
    salesCommission: 90000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 28000 },
      { customer: 'Maina Kamau', amount: 22000 },
      { customer: 'Sarah Wanjiku', amount: 18000 },
      { customer: 'Peter Njoroge', amount: 12000 },
      { customer: 'Grace Akinyi', amount: 10000 },
    ],
    transportBreakdown: [
      { week: 'Week 1–2', amount: 16000 },
      { week: 'Week 3–4', amount: 17000 },
      { week: 'Week 5–6', amount: 16500 },
      { week: 'Week 7–8', amount: 16500 },
    ],
    milestoneBreakdown: {
      cds2: 35000,
      jsf: 32000,
      transportAllowance: 39000,
      tv: 28000,
      directDrip: 22000,
    },
    milestoneDetails: {
      cds2: [
        { customer: 'Jack Odhiambo', amount: 12000 },
        { customer: 'Maina Kamau', amount: 10000 },
        { customer: 'Sarah Wanjiku', amount: 7000 },
        { customer: 'Peter Njoroge', amount: 4000 },
        { customer: 'Grace Akinyi', amount: 2000 },
      ],
      jsf: [
        { customer: 'David Kimani', amount: 11000 },
        { customer: 'Emma Williams', amount: 9000 },
        { customer: 'John Doe', amount: 6500 },
        { customer: 'Mike Johnson', amount: 3500 },
        { customer: 'Lucy Muthoni', amount: 2000 },
      ],
      transportAllowance: [
        { week: 'Week 1–2 (Nov 23 – Dec 6)', amount: 9750 },
        { week: 'Week 3–4 (Dec 7 – Dec 20)', amount: 9750 },
        { week: 'Week 5–6 (Dec 21 – Jan 3)', amount: 9750 },
        { week: 'Week 7–8 (Jan 4 – Jan 17)', amount: 9750 },
      ],
      tv: [
        { customer: 'Jane Achieng', amount: 10000 },
        { customer: 'Tom Mutua', amount: 8000 },
        { customer: 'Alice Njeri', amount: 5500 },
        { customer: 'Robert Kibet', amount: 3000 },
        { customer: 'Nancy Chebet', amount: 1500 },
      ],
      directDrip: [
        { customer: 'Martin Otieno', amount: 8000 },
        { customer: 'Betty Wangari', amount: 6500 },
        { customer: 'Samuel Karanja', amount: 4500 },
        { customer: 'Ruth Mwangi', amount: 2000 },
        { customer: 'Daniel Rotich', amount: 1000 },
      ],
    },
  },
  '90_days': {
    period: '90_days',
    totalCommission: 258000,
    transportCommission: 108000,
    salesCommission: 150000,
    currency: 'KES',
    salesBreakdown: [
      { customer: 'Jack Odhiambo', amount: 45000 },
      { customer: 'Maina Kamau', amount: 38000 },
      { customer: 'Sarah Wanjiku', amount: 30000 },
      { customer: 'Peter Njoroge', amount: 22000 },
      { customer: 'Grace Akinyi', amount: 15000 },
    ],
    transportBreakdown: [
      { week: 'Month 1', amount: 35000 },
      { week: 'Month 2', amount: 36000 },
      { week: 'Month 3', amount: 37000 },
    ],
    milestoneBreakdown: {
      cds2: 58000,
      jsf: 53000,
      transportAllowance: 65000,
      tv: 46000,
      directDrip: 36000,
    },
    milestoneDetails: {
      cds2: [
        { customer: 'Jack Odhiambo', amount: 20000 },
        { customer: 'Maina Kamau', amount: 16000 },
        { customer: 'Sarah Wanjiku', amount: 12000 },
        { customer: 'Peter Njoroge', amount: 6000 },
        { customer: 'Grace Akinyi', amount: 4000 },
      ],
      jsf: [
        { customer: 'David Kimani', amount: 18000 },
        { customer: 'Emma Williams', amount: 15000 },
        { customer: 'John Doe', amount: 11000 },
        { customer: 'Mike Johnson', amount: 6000 },
        { customer: 'Lucy Muthoni', amount: 3000 },
      ],
      transportAllowance: [
        { week: 'Month 1 (Oct 23 – Nov 22)', amount: 21650 },
        { week: 'Month 2 (Nov 23 – Dec 22)', amount: 21650 },
        { week: 'Month 3 (Dec 23 – Jan 21)', amount: 21700 },
      ],
      tv: [
        { customer: 'Jane Achieng', amount: 17000 },
        { customer: 'Tom Mutua', amount: 13000 },
        { customer: 'Alice Njeri', amount: 9000 },
        { customer: 'Robert Kibet', amount: 5000 },
        { customer: 'Nancy Chebet', amount: 2000 },
      ],
      directDrip: [
        { customer: 'Martin Otieno', amount: 13000 },
        { customer: 'Betty Wangari', amount: 10000 },
        { customer: 'Samuel Karanja', amount: 7000 },
        { customer: 'Ruth Mwangi', amount: 4000 },
        { customer: 'Daniel Rotich', amount: 2000 },
      ],
    },
  },
};

export const mockLeads: Record<string, LeadStatus> = {
  john: {
    leadId: 'lead-john-001',
    leadName: 'John Doe',
    status: 'active',
    lastContact: '2024-01-18 02:30 PM',
    conversionValue: 15000,
    notes: 'High-value prospect, interested in premium plan',
  },
  smith: {
    leadId: 'lead-smith-002',
    leadName: 'Sarah Smith',
    status: 'qualified',
    lastContact: '2024-01-17 10:15 AM',
    conversionValue: 8500,
    notes: 'Ready for proposal',
  },
  johnson: {
    leadId: 'lead-johnson-003',
    leadName: 'Mike Johnson',
    status: 'pending',
    lastContact: '2024-01-10 03:45 PM',
    conversionValue: 5000,
    notes: 'Waiting for budget approval',
  },
  williams: {
    leadId: 'lead-williams-004',
    leadName: 'Emma Williams',
    status: 'closed',
    lastContact: '2024-01-08 11:20 AM',
    conversionValue: 25000,
    notes: 'Successfully closed deal',
  },
  default: {
    leadId: 'lead-unknown-001',
    leadName: 'Unknown Lead',
    status: 'pending',
    lastContact: 'Not contacted',
    notes: 'Lead not found in system',
  },
};

export const commissionPeriodOptions = [
  { id: '1', label: '14 days', value: '14_days' },
  { id: '2', label: '30 days', value: '30_days' },
  { id: '3', label: '60 days', value: '60_days' },
  { id: '4', label: '90 days', value: '90_days' },
  { id: '5', label: 'Custom', value: 'custom' },
];

export const mainMenuOptions = [
  {
    id: 'check_commissions',
    label: 'Check my commissions',
    value: 'commissions',
  },
  {
    id: 'check_leads',
    label: 'Check customer or Leads',
    value: 'leads',
  },
  {
    id: 'calculate',
    label: 'Calculate Commissions',
    value: 'calculate',
  },
];

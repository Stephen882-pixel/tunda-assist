import { IntentDetectionResult, CommissionPeriod } from './types';

export class IntentDetector {
  private commissionKeywords = ['commission', 'earnings', 'income', 'revenue', 'payout', 'check'];
  private breakdownKeywords = ['breakdown', 'detailed', 'detail', 'how much', 'where', 'from'];
  private leadKeywords = ['lead', 'customer', 'prospect', 'client', 'contact', 'person'];
  private periodKeywords: Record<CommissionPeriod, string[]> = {
    '14_days': ['14', 'two weeks', '2 weeks'],
    '30_days': ['30', 'month', 'one month'],
    '60_days': ['60', 'two months'],
    '90_days': ['90', 'three months', 'quarter'],
    'custom': ['custom'],
  };

  detect(userInput: string): IntentDetectionResult {
    const input = userInput.toLowerCase().trim();

    // Detect if it's a greeting
    if (this.isGreeting(input)) {
      return {
        intent: 'greeting',
        confidence: 1,
        parameters: {},
      };
    }

    // Detect if it's about commissions
    if (this.hasKeywords(input, this.commissionKeywords)) {
      // Check if breakdown is requested
      if (this.hasKeywords(input, this.breakdownKeywords)) {
        const period = this.extractPeriod(input);
        return {
          intent: 'commission_breakdown',
          confidence: 0.9,
          parameters: {
            period: period || '14_days',
          },
        };
      }

      // Summary commission info
      const period = this.extractPeriod(input);
      return {
        intent: 'commission_summary',
        confidence: 0.85,
        parameters: {
          period: period || '14_days',
        },
      };
    }

    // Detect if it's about leads
    if (this.hasKeywords(input, this.leadKeywords)) {
      const leadId = this.extractLeadId(input);
      return {
        intent: 'lead_status',
        confidence: 0.8,
        parameters: {
          leadId: leadId || undefined,
        },
      };
    }

    // Default to custom question
    return {
      intent: 'custom_question',
      confidence: 0.3,
      parameters: {
        customInput: input,
      },
    };
  }

  private isGreeting(input: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(g => input.includes(g));
  }

  private hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  }

  private extractPeriod(input: string): CommissionPeriod | undefined {
    for (const [period, keywords] of Object.entries(this.periodKeywords)) {
      if (keywords.some(k => input.includes(k))) {
        return period as CommissionPeriod;
      }
    }
    return undefined;
  }

  private extractLeadId(input: string): string | undefined {
    // Look for patterns like "lead john", "customer smith", etc.
    const patterns = [
      /lead\s+(\w+)/i,
      /customer\s+(\w+)/i,
      /prospect\s+(\w+)/i,
      /contact\s+(\w+)/i,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    return undefined;
  }
}

export const intentDetector = new IntentDetector();

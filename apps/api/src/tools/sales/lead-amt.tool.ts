import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { normalizeKenyaPhoneForAmt } from './employee-amt.tool';

export const LEAD_SOURCE_OPTIONS = [
  'Self Registration Whatsapp',
  'Stockist',
  'X Marketing',
  'Influencer Marketing',
  'N/A',
  'Whatsapp',
  'Website',
  'Walk-In',
] as const;

export const PRODUCT_OF_INTEREST_OPTIONS = [
  'CSD1+RM2S MAX',
  'RainMaker 2CKubwa (3.5)',
  'Aftersales PayG',
  'Kilimo Boost',
  'Insurance KE',
  'Insurance IKE',
  'Extra Items',
  'Test Product 5',
] as const;

export const WATER_SOURCE_OPTIONS = [
  'Rainwater Harvesting',
  'Rain',
  'Lake',
  'Shallow Water',
  'River',
  'Dam',
] as const;

export const LEAD_CATEGORY_OPTIONS = ['HOT', 'WARM', 'COLD'] as const;

type SalesAppRequestPayload = {
  method: 'POST';
  endpoint: string;
  body: {
    firstName: string;
    lastName: string;
    entityType: string;
    customerTypeId: number;
    mobilePhone: string;
    agentId: string;
    companyRegionId: number;
    location: string;
    productOfInterest: string;
    nearestLandmark: string;
    leadSource: string;
    preferredLanguage: string;
    purchaseDate: string;
    waterSource: string;
    leadCategory: string;
  };
  config: {
    headers: {
      'x-form-id': number;
      'x-form-version': string;
    };
  };
};

@Injectable()
export class LeadAmtTool {
  private readonly logger = new Logger(LeadAmtTool.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * POST sales-app request proxy: creates a lead. Uses the same `employee_id` as the
   * AMT id returned from `validate_sunculture_agent` (the agent’s record id).
   */
  async createLead(args: {
    validated_employee_id: number;
    firstName: string;
    lastName: string;
    customer_type: 'individual' | 'distributor';
    mobilePhone: string;
    location: string;
    nearestLandmark: string;
    productOfInterest: string;
    leadSource: string;
    preferredLanguage: 'en' | 'fr' | 'sw';
    purchaseDate: string;
    waterSource: string;
    leadCategory: 'HOT' | 'WARM' | 'COLD';
    companyRegionId?: number;
  }): Promise<string> {
    const formId = this.configService.get<string>('amt.leadFormId') ?? '19';
    const formVersion = this.configService.get<string>('amt.leadFormVersion') ?? '175';
    const url = this.configService.get<string>('amt.salesAppRequestUrl');
    const apiKey = this.configService.get<string>('amt.apiKey') ?? '';
    const agentAmtId = args.validated_employee_id;

    if (!url || !apiKey) {
      this.logger.error('AMT lead: missing salesAppRequestUrl or apiKey');
      return 'Lead service is not configured. Contact IT to set AMT_SALES_APP_REQUEST_URL and AMT_API_KEY.';
    }
    if (!Number.isInteger(agentAmtId) || agentAmtId < 1) {
      return 'Missing or invalid validated employee id. Call validate_sunculture_agent first, then use the AMT employee record id in validated_employee_id.';
    }

    const phone = normalizeKenyaPhoneForAmt(args.mobilePhone);
    if (!phone.ok) {
      return 'Customer phone could not be normalised. ' + phone.message;
    }

    if (!this.isAllowed(LEAD_SOURCE_OPTIONS, args.leadSource, 'lead source')) {
      return `Invalid lead source. Choose one: ${this.joinList(LEAD_SOURCE_OPTIONS)}. If you are not sure, ask the user.`;
    }
    if (!this.isAllowed(WATER_SOURCE_OPTIONS, args.waterSource, 'water source')) {
      return `Invalid water source. Choose one: ${this.joinList(WATER_SOURCE_OPTIONS)}.`;
    }
    if (!args.purchaseDate?.trim()) {
      return 'purchaseDate is required (e.g. TWO_WEEKS as used in the sales form). If unsure, ask the user for their expected purchase timeline.';
    }
    if (!this.isAllowed(LEAD_CATEGORY_OPTIONS, args.leadCategory, 'leadCategory')) {
      return `Invalid lead category. Use: ${this.joinList(LEAD_CATEGORY_OPTIONS)}.`;
    }

    const entityType = args.customer_type === 'distributor' ? 'DISTRIBUTOR' : 'INDIVIDUAL';
    const customerTypeId = args.customer_type === 'distributor' ? 2 : 1;

    const payload: SalesAppRequestPayload = {
      method: 'POST',
      endpoint: '/leads',
      body: {
        firstName: args.firstName.trim(),
        lastName: args.lastName.trim(),
        entityType,
        customerTypeId,
        mobilePhone: phone.e164,
        agentId: String(agentAmtId),
        companyRegionId: args.companyRegionId ?? 1,
        location: args.location.trim(),
        productOfInterest: args.productOfInterest.trim(),
        nearestLandmark: args.nearestLandmark.trim(),
        leadSource: args.leadSource,
        preferredLanguage: args.preferredLanguage,
        purchaseDate: args.purchaseDate,
        waterSource: args.waterSource,
        leadCategory: args.leadCategory,
      },
      config: {
        headers: {
          'x-form-id': parseInt(String(formId), 10) || 19,
          'x-form-version': String(formVersion),
        },
      },
    };

    this.logger.log(
      `AMT create lead: agentAmtId=${String(agentAmtId)} customerPhone=${phone.e164}`,
    );

    try {
      const res = await axios.post<unknown>(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          employee_id: String(agentAmtId),
          api_key: apiKey,
        },
        timeout: 45000,
        validateStatus: () => true,
      });
      if (res.status >= 200 && res.status < 300) {
        if (this.isFailureBody(res.data)) {
          return (
            this.messageFromData(res.data) ??
            'The lead service returned an error. The lead may already exist or a value was invalid.'
          );
        }
        return (
          'Success: the lead was submitted. ' +
          `Customer ${payload.body.firstName} ${payload.body.lastName}, phone ${phone.e164}, ` +
          `product: ${payload.body.productOfInterest}, source: ${payload.body.leadSource}.`
        );
      }
      return this.explainStatus(res.status, res.data);
    } catch (error: unknown) {
      this.logger.error('AMT create lead failed', error);
      return this.explainError(error);
    }
  }

  private isFailureBody(data: unknown): boolean {
    if (data == null) {
      return false;
    }
    if (typeof data === 'object' && 'success' in data) {
      return (data as { success: unknown }).success === false;
    }
    if (typeof data === 'object' && 'error' in data) {
      return (data as { error: unknown }).error != null;
    }
    return false;
  }

  private explainStatus(status: number, data: unknown): string {
    const msg = this.messageFromData(data);
    if (status === 409 || status === 422) {
      return msg
        ? `${msg} The lead may already exist or a field did not pass validation.`
        : this.duplicateOrConflictMessage();
    }
    if (status === 404) {
      return 'The lead service endpoint was not found. Check AMT_SALES_APP_REQUEST_URL and that the test API is available.';
    }
    if (msg) {
      return `Could not create the lead: ${msg}`;
    }
    return this.duplicateOrConflictMessage();
  }

  private messageFromData(data: unknown): string | null {
    if (data == null) {
      return null;
    }
    if (typeof data === 'object' && 'message' in data) {
      const m = (data as { message: unknown }).message;
      if (typeof m === 'string') {
        return m;
      }
    }
    if (typeof data === 'string') {
      return data;
    }
    return null;
  }

  private isAllowed<T extends readonly string[]>(
    list: T,
    value: string,
    _label: string,
  ): boolean {
    return (list as readonly string[]).includes(value);
  }

  private joinList(list: readonly string[]): string {
    return list.join(' | ');
  }

  private explainError(error: unknown): string {
    if (axios.isAxiosError(error) && error.response) {
      return this.explainStatus(error.response.status, error.response.data);
    }
    return this.duplicateOrConflictMessage();
  }

  private duplicateOrConflictMessage(): string {
    return (
      'The lead could not be created. It may already exist, or a required value was invalid. ' +
      'Check customer phone, product, and that your agent id was set from a successful validate_sunculture_agent step. ' +
      'If the problem continues, use the Sales App or ask support.'
    );
  }
}

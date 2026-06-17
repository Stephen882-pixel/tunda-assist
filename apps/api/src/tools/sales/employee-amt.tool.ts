import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/** AMT GET /employeeByPhoneNumber/:phone */
interface AmtEmployeeData {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  status: string;
  department: string;
  role: string;
  primaryRole: string;
  country: string;
  commissionPayplan: string;
  duration?: string;
  supervisor?: string;
}

interface AmtEmployeeByPhoneResponse {
  success: boolean;
  data?: AmtEmployeeData;
}

/**
 * Normalise Kenyan mobile numbers to 254XXXXXXXXX (12 digits) for AMT.
 */
export function normalizeKenyaPhoneForAmt(
  input: string,
):
  | { ok: true; e164: string }
  | { ok: false; message: string } {
  const digits = input.replace(/\D/g, '');
  if (!digits) {
    return {
      ok: false,
      message:
        'No digits found. Ask for a full mobile number (e.g. 2547XX XXX XXX or 07XX XXX XXX).',
    };
  }
  if (digits.startsWith('254') && digits.length === 12) {
    return { ok: true, e164: digits };
  }
  if (digits.startsWith('254') && digits.length > 12) {
    return { ok: true, e164: digits.slice(0, 12) };
  }
  if (digits.length === 9 && digits.startsWith('7')) {
    return { ok: true, e164: `254${digits}` };
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return { ok: true, e164: `254${digits.slice(1)}` };
  }
  if (digits.length === 10 && digits.startsWith('7')) {
    return { ok: true, e164: `254${digits}` };
  }
  return {
    ok: false,
    message:
      'Phone format not recognised. Ask for a Kenya number: 07XXXXXXXX, 7XXXXXXXX, or 2547XXXXXXXX.',
  };
}

@Injectable()
export class EmployeeAmtTool {
  private readonly logger = new Logger(EmployeeAmtTool.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Step 1 of agent flows (create lead, commissions, etc.): confirm the caller is a
   * registered SunCulture employee in AMT using their work mobile number.
   */
  async validateEmployeeByPhone(
    rawPhone: string,
  ): Promise<string> {
    const normalized = normalizeKenyaPhoneForAmt(rawPhone);
    if (!normalized.ok) {
      return (
        'Could not parse that as a valid Kenya phone number. ' + normalized.message
      );
    }

    const baseUrl = this.configService.get<string>('amt.baseUrl');
    const employeeId = this.configService.get<string>('amt.employeeId');
    const apiKey = this.configService.get<string>('amt.apiKey');

    if (!baseUrl || !employeeId || !apiKey) {
      this.logger.error('AMT credentials missing for employeeByPhoneNumber');
      return (
        'The team directory service is not configured on this server. ' +
        'Please try again later or contact IT.'
      );
    }

    const url = `${baseUrl}/employeeByPhoneNumber/${encodeURIComponent(normalized.e164)}`;

    try {
      const result = await axios.get<AmtEmployeeByPhoneResponse>(url, {
        headers: {
          employee_id: employeeId,
          api_key: apiKey,
        },
        timeout: 20000,
        validateStatus: (s) => s === 200,
      });
      const body = result.data;
      if (!body?.success || !body.data) {
        this.logger.warn(`AMT employeeByPhone: success=false for ${normalized.e164}`);
        return this.failedValidationUserMessage();
      }
      return this.formatSuccess(body.data, normalized.e164);
    } catch (error: unknown) {
      this.logger.error(
        `AMT employeeByPhoneNumber failed for ${normalized.e164}`,
        error,
      );
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return this.failedValidationUserMessage();
        }
      }
      return this.failedValidationUserMessage();
    }
  }

  private failedValidationUserMessage(): string {
    return (
      'We could not validate your agent details for that phone number in our internal directory (AMT). ' +
      'Please check the number matches your SunCulture-registered mobile, including country code 254, and try again. ' +
      'If it still fails, contact your supervisor or IT support.'
    );
  }

  private formatSuccess(emp: AmtEmployeeData, phoneUsed: string): string {
    const payplan = emp.commissionPayplan || 'n/a';
    const supervisor = emp.supervisor ? ` Supervisor: ${emp.supervisor}.` : '';
    return [
      'Verified: you are a registered SunCulture team member in our system (AMT).',
      `Name: ${emp.name}.`,
      `Phone on file: ${emp.phoneNumber || phoneUsed}.`,
      `Email: ${emp.email || 'n/a'}.`,
      `Department: ${emp.department || 'n/a'}.`,
      `Role: ${emp.role || 'n/a'} (primary: ${emp.primaryRole || 'n/a'}).`,
      `Status: ${emp.status || 'n/a'}.`,
      `Country: ${emp.country || 'n/a'}.`,
      `Commission pay plan: ${payplan} (${emp.duration || 'n/a'}).${supervisor}`,
      '',
      `AMT employee record id: **${String(emp.id)}**. ` +
        'When you create a lead, pass this number as `validated_employee_id` in the create_sunculture_lead tool.',
      '',
      'You are cleared to continue (e.g. create a lead, or ask about commission details in a follow-up).',
    ]
      .filter(Boolean)
      .join(' ');
  }
}

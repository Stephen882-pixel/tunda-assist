import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface AmtAccount {
  id: number;
  accountType: string;
  accountStatus: string;
  status: string;
  productName: string;
  accountBalance: number;
  totalPaid: number;
  nextInstallmentDate: string | null;
  nextInstallmentAmount: number;
  depositAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  cashValue: number;
  totalPaygPriceInclVat: number;
  payplanName: string;
  jsfDate: string | null;
  dispatchDate: string | null;
  installationDate: string | null;
}

interface AmtCustomer {
  id: number;
  name: string;
  identificationNumber: string;
  phoneNumber: string;
  gender: string;
  location: string;
  creditCheck: string;
  salesAgentName: string;
  accounts: AmtAccount[];
}

interface AmtResponse {
  success: boolean;
  data: AmtCustomer;
}

@Injectable()
export class AccountTool {
  private readonly logger = new Logger(AccountTool.name);

  constructor(private readonly configService: ConfigService) {}

  async getAccountInfo(nationalId: string): Promise<string> {
    const baseUrl = this.configService.get<string>('amt.baseUrl');
    const employeeId = this.configService.get<string>('amt.employeeId');
    const apiKey = this.configService.get<string>('amt.apiKey');

    let response: AmtResponse;

    try {
      const result = await axios.get<AmtResponse>(`${baseUrl}/customerInfo`, {
        params: { identificationNumber: nationalId },
        headers: {
          employee_id: employeeId,
          api_key: apiKey,
        },
        timeout: 15000,
      });
      response = result.data;
    } catch (error: unknown) {
      this.logger.error(`AMT API call failed for ID ${nationalId}`, error);

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return (
          `I was not able to find an account linked to National ID ${nationalId}. ` +
          'Could you double-check the number? Or I can look it up using your phone number instead — ' +
          'you can also dial *384*02# from your phone to check your balance directly.'
        );
      }

      return (
        'I am having trouble reaching the account system right now. ' +
        'You can check your balance directly by dialing *384*02# from your phone, ' +
        'or call our support line on 0800 721 042 and the team will pull it up for you.'
      );
    }

    if (!response.success || !response.data) {
      return (
        `I could not find an account for National ID ${nationalId}. ` +
        'Please check the number and try again, or dial *384*02# to check your balance directly.'
      );
    }

    return this.formatAccountResponse(response.data);
  }

  private formatAccountResponse(customer: AmtCustomer): string {
    const accounts = customer.accounts ?? [];

    if (accounts.length === 0) {
      return (
        `I can see your profile, ${customer.name}, but there are no active accounts linked to it yet. ` +
        'If you recently made a deposit, it may take a day or two to reflect. ' +
        'You can also call our support line on 0800 721 042 for more details.'
      );
    }

    // Surface the most relevant account — prefer Current/Active over others
    const primary = accounts.find((a) => a.status === 'Current') ?? accounts[0];

    const parts: string[] = [];

    parts.push(`Good news — I can see your account, ${customer.name}.`);

    parts.push(
      `You have a ${primary.productName} on our ${primary.accountType} plan. ` +
        `Your account status is ${primary.accountStatus}.`,
    );

    if (primary.totalPaid > 0) {
      parts.push(
        `You have paid a total of KES ${primary.totalPaid.toLocaleString()} so far.`,
      );
    }

    if (primary.accountBalance > 0) {
      parts.push(
        `Your current outstanding balance is KES ${primary.accountBalance.toLocaleString()}.`,
      );
    }

    if (primary.nextInstallmentDate && primary.nextInstallmentAmount > 0) {
      parts.push(
        `Your next instalment of KES ${primary.nextInstallmentAmount.toLocaleString()} is due on ${primary.nextInstallmentDate}.`,
      );
    }

    if (primary.accountStatus !== 'Current') {
      parts.push(
        'To bring your account up to date, pay via M-Pesa Paybill 862451 using your National ID as the account number. ' +
          'Your system will unlock automatically once the payment goes through.',
      );
    }

    if (accounts.length > 1) {
      parts.push(
        `You also have ${accounts.length - 1} other account${accounts.length > 2 ? 's' : ''} on file. ` +
          'Would you like details on any of those as well?',
      );
    }

    parts.push(
      'Is there anything specific about your account you would like to know?',
    );

    return parts.join(' ');
  }
}

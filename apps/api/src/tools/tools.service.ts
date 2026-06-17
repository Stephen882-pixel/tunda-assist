import { Injectable, Logger } from '@nestjs/common';
import { AboutTool, AboutCategory } from './product/about.tool';
import {
  ProductsTool,
  ProductQueryType,
  ProductLine,
  ProductVariant,
} from './product/products.tool';
import { PricingTool, PricingQueryType } from './product/pricing.tool';
import {
  ObjectionHandlingTool,
  ObjectionType,
} from './support/objection-handling.tool';
import { FarmRoiTool, CropType } from './product/farm-roi.tool';
import {
  TroubleshootingTool,
  TroubleshootingIssueType,
} from './support/troubleshooting.tool';
import { AccountTool } from './sales/account.tool';
import { EmployeeAmtTool } from './sales/employee-amt.tool';
import { LeadAmtTool } from './sales/lead-amt.tool';
import { CommissionSummaryTool } from './commission/commission-summary.tool';
import { CommissionBreakdownTool } from './commission/commission-breakdown.tool';
import { LeadStatusTool } from './sales/lead-status.tool';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  constructor(
    private readonly aboutTool: AboutTool,
    private readonly productsTool: ProductsTool,
    private readonly pricingTool: PricingTool,
    private readonly objectionHandlingTool: ObjectionHandlingTool,
    private readonly farmRoiTool: FarmRoiTool,
    private readonly troubleshootingTool: TroubleshootingTool,
    private readonly accountTool: AccountTool,
    private readonly employeeAmtTool: EmployeeAmtTool,
    private readonly leadAmtTool: LeadAmtTool,
    private readonly commissionSummaryTool: CommissionSummaryTool,
    private readonly commissionBreakdownTool: CommissionBreakdownTool,
    private readonly leadStatusTool: LeadStatusTool,
  ) {}

  async execute(
    toolName: string,
    args: Record<string, unknown>,
  ): Promise<string> {
    this.logger.log(
      `Executing tool: ${toolName} with args: ${JSON.stringify(args)}`,
    );

    switch (toolName) {
      case 'about_sunculture':
        return this.aboutTool.getInfo(
          (args.category as AboutCategory) ?? 'general',
        );

      case 'get_product_info':
        return this.productsTool.getProductInfo(
          (args.query_type as ProductQueryType) ?? 'catalog_overview',
          args.product_line as ProductLine | undefined,
          args.variant as ProductVariant | undefined,
          args.farm_size_acres as number | undefined,
        );

      case 'get_pricing':
        return this.pricingTool.getPricingInfo(
          (args.query_type as PricingQueryType) ?? 'product_price',
          args.product_code as string | undefined,
        );

      case 'handle_objection':
        return this.objectionHandlingTool.handleObjection(
          args.objection_type as ObjectionType,
        );

      case 'calculate_farm_roi':
        return this.farmRoiTool.calculateRoi(
          (args.crop_type as CropType) ?? 'other',
          (args.farm_size_acres as number) ?? 1,
          (args.monthly_fuel_spend_kes as number) ?? 0,
        );

      case 'troubleshoot_system':
        return this.troubleshootingTool.diagnose(
          (args.issue_type as TroubleshootingIssueType) ?? 'pump_not_starting',
        );

      case 'check_account':
        return this.accountTool.getAccountInfo(args.national_id as string);

      case 'validate_sunculture_agent':
        return this.employeeAmtTool.validateEmployeeByPhone(
          String(args.phone ?? ''),
        );

      case 'create_sunculture_lead': {
        const id = Number(args.validated_employee_id);
        const preferred = String(args.preferredLanguage ?? '');
        const allowedLang = ['en', 'fr', 'sw'] as const;
        const lang = allowedLang.includes(preferred as (typeof allowedLang)[number])
          ? (preferred as (typeof allowedLang)[number])
          : null;
        if (lang == null) {
          return 'preferredLanguage must be en, fr, or sw (codes for English, French, Swahili).';
        }
        const cat = String(args.leadCategory ?? '');
        const allowedCat = ['HOT', 'WARM', 'COLD'] as const;
        if (!allowedCat.includes(cat as (typeof allowedCat)[number])) {
          return 'leadCategory must be HOT, WARM, or COLD.';
        }
        return this.leadAmtTool.createLead({
          validated_employee_id: id,
          firstName: String(args.firstName ?? ''),
          lastName: String(args.lastName ?? ''),
          customer_type:
            String(args.customer_type ?? 'individual').toLowerCase() ===
            'distributor'
              ? 'distributor'
              : 'individual',
          mobilePhone: String(args.mobilePhone ?? ''),
          location: String(args.location ?? ''),
          nearestLandmark: String(args.nearestLandmark ?? ''),
          productOfInterest: String(args.productOfInterest ?? ''),
          leadSource: String(args.leadSource ?? ''),
          preferredLanguage: lang,
          purchaseDate: String(args.purchaseDate ?? ''),
          waterSource: String(args.waterSource ?? ''),
          leadCategory: cat as (typeof allowedCat)[number],
          companyRegionId: (() => {
            if (args.companyRegionId == null) {
              return undefined;
            }
            const n = Number(args.companyRegionId);
            return Number.isInteger(n) && n > 0 ? n : undefined;
          })(),
        });
      }

      case 'get_commission_summary': {
        type Period = '14_days' | '30_days' | '60_days' | '90_days';
        const period = (args.period as Period) ?? '30_days';
        const phone = String(args.phone ?? '');
        return this.commissionSummaryTool.execute(period, phone);
      }

      case 'get_commission_breakdown': {
        type Period = '14_days' | '30_days' | '60_days' | '90_days';
        const period = (args.period as Period) ?? '30_days';
        const phone = String(args.phone ?? '');
        return this.commissionBreakdownTool.execute(period, phone);
      }

      case 'get_lead_status': {
        const leadId = String(args.lead_id ?? '');
        return this.leadStatusTool.execute(leadId);
      }

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}

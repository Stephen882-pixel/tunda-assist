import { Injectable, Logger } from '@nestjs/common';
import { ToolsService } from '../tools/tools.service';
import { PricingQueryType } from '../tools/product/pricing.tool';
import {
  ProductLine,
  ProductQueryType,
  ProductVariant,
} from '../tools/product/products.tool';
import { TroubleshootingIssueType } from '../tools/support/troubleshooting.tool';
import { AboutCategory } from '../tools/product/about.tool';

const CHAT_SCRIPT = {
  greeting:
    'Hi there, this is Ivy from SunCulture support. How can I help you today?',
  fallback:
    'Can you tell me what is happening with your system, your account, or the product you want?',
  unsupported:
    'I mainly help with SunCulture products, pricing, payments, accounts, and troubleshooting. For jobs or careers, please check SunCulture’s official website or social pages.',
  checkInfo: 'Let me check that for you, just a moment.',
  frustration:
    'I understand that can be frustrating. Let me help you sort this out.',
  troubleshootQuestion:
    'Is the solar panel clean and in direct sunlight, and are there any lights or indicators on the controller?',
  productQuestion:
    'How big is your farm in acres, and how deep is your water source?',
  newCustomer:
    'That is okay. I can still help you choose a SunCulture system. How big is your farm in acres, and how deep is your water source?',
  pricingQuestion:
    'Which product are you asking about: RainMaker2S, RainMaker Kubwa, Surface Pump, or a Battery package?',
  accountQuestion:
    'Is there anything specific about your account you would like to know?',
  objectionQuestion: 'What is your biggest concern right now?',
  nextHelp: 'How can I help you next?',
};

export interface GenerateReplyInput {
  channel: 'telegram' | 'vapi';
  userId: string;
  sessionId?: string;
  message: string;
}

type ObjectionType =
  | 'price_too_expensive'
  | 'deposit_too_high'
  | 'solar_company_distrust'
  | 'what_if_it_breaks'
  | 'need_to_consult_family'
  | 'let_me_think'
  | 'water_source_too_deep'
  | 'already_have_petrol_pump'
  | 'fraud_concerns'
  | 'volume_requirements_unclear';

type ToolInvocation =
  | {
      toolName: 'get_pricing';
      args: { query_type: PricingQueryType; product_code?: string };
    }
  | {
      toolName: 'get_product_info';
      args: {
        query_type: ProductQueryType;
        product_line?: ProductLine;
        variant?: ProductVariant;
        farm_size_acres?: number;
      };
    }
  | {
      toolName: 'troubleshoot_system';
      args: { issue_type: TroubleshootingIssueType };
    }
  | {
      toolName: 'about_sunculture';
      args: { category: AboutCategory };
    }
  | {
      toolName: 'check_account';
      args: { national_id: string };
    }
  | {
      toolName: 'handle_objection';
      args: { objection_type: ObjectionType };
    };

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);

  constructor(private readonly toolsService: ToolsService) {}

  async generateReply(input: GenerateReplyInput): Promise<string> {
    const message = input.message.trim();
    const normalized = message.toLowerCase();

    this.logger.log(
      `Generating ${input.channel} reply for user ${input.userId} in session ${input.sessionId ?? 'n/a'}`,
    );

    if (!message) {
      return 'Please send your question and I will help.';
    }

    if (this.isGreeting(normalized)) {
      return CHAT_SCRIPT.greeting;
    }

    if (normalized === '/start') {
      return CHAT_SCRIPT.greeting;
    }

    if (this.isJobQuery(normalized)) {
      return CHAT_SCRIPT.unsupported;
    }

    if (this.isNewCustomerMessage(normalized)) {
      return CHAT_SCRIPT.newCustomer;
    }

    const toolCall = this.selectToolInvocation(normalized);
    if (!toolCall) {
      return CHAT_SCRIPT.fallback;
    }

    const reply = await this.toolsService.execute(
      toolCall.toolName,
      toolCall.args,
    );
    return input.channel === 'telegram'
      ? this.formatTelegramReply(reply, toolCall.toolName, normalized)
      : reply;
  }

  private selectToolInvocation(message: string): ToolInvocation | null {
    const nationalId = this.extractNationalId(message);
    const farmSizeAcres = this.extractFarmSize(message);
    const productCode = this.matchProductCode(message);
    const productLine = this.matchProductLine(message);
    const variant = this.matchVariant(message);

    if (this.isAccountQuery(message)) {
      if (nationalId) {
        return {
          toolName: 'check_account',
          args: { national_id: nationalId },
        };
      }

      return {
        toolName: 'about_sunculture',
        args: { category: 'account_management' },
      };
    }

    if (this.isObjection(message)) {
      return {
        toolName: 'handle_objection',
        args: { objection_type: this.matchObjectionType(message) },
      };
    }

    if (this.isTroubleshootingQuery(message)) {
      return {
        toolName: 'troubleshoot_system',
        args: { issue_type: this.matchTroubleshootingType(message) },
      };
    }

    if (this.isPricingQuery(message)) {
      return {
        toolName: 'get_pricing',
        args: {
          query_type: this.matchPricingType(message),
          product_code: productCode,
        },
      };
    }

    if (this.isProductQuery(message)) {
      return {
        toolName: 'get_product_info',
        args: {
          query_type: this.matchProductQueryType(message, farmSizeAcres),
          product_line: productLine,
          variant,
          farm_size_acres: farmSizeAcres,
        },
      };
    }

    if (this.isCompanyInfoQuery(message)) {
      return {
        toolName: 'about_sunculture',
        args: { category: this.matchAboutCategory(message) },
      };
    }

    return null;
  }

  private isGreeting(message: string): boolean {
    return /^(hi|hello|hey|good morning|good afternoon|good evening)\b/.test(
      message,
    );
  }

  private isJobQuery(message: string): boolean {
    return /(job|jobs|career|careers|vacancy|vacancies|recruitment|hiring|advertisement|advert)/.test(
      message,
    );
  }

  private isNewCustomerMessage(message: string): boolean {
    return /(not an existing client|not a client|new customer|new client|not registered|i am new|first time customer)/.test(
      message,
    );
  }

  private isPricingQuery(message: string): boolean {
    return /(price|pricing|cost|deposit|monthly|paygo|installment|instalment|payment plan|payment|payments|how much|quote|cash price|refer)/.test(
      message,
    );
  }

  private matchPricingType(message: string): PricingQueryType {
    if (/(refer|referral)/.test(message)) {
      return 'refer_and_earn';
    }

    if (
      /(paygo|pay as you grow|lipa polepole|financing|finance)/.test(message)
    ) {
      return 'paygo_explanation';
    }

    if (/deposit/.test(message)) {
      return 'deposit_info';
    }

    if (
      /(price|pricing|cost|monthly|how much|cash price|quote)/.test(message)
    ) {
      return 'product_price';
    }

    return 'all_products';
  }

  private isProductQuery(message: string): boolean {
    return /(product|products|pump|rainmaker|climatesmart|climate smart|battery|direct|surface pump|pump model|spec|feature|compare|farm size|acre|borehole|well|river)/.test(
      message,
    );
  }

  private matchProductQueryType(
    message: string,
    farmSizeAcres?: number,
  ): ProductQueryType {
    if (/(compare|difference|vs\b|versus)/.test(message)) {
      return 'compare_lines';
    }

    if (
      /(add-on|addon|tv|drip kit|ground stand|river pump stand)/.test(message)
    ) {
      return 'add_ons';
    }

    if (/(spec|feature|warranty|monitoring|mppt)/.test(message)) {
      return 'features';
    }

    if (
      farmSizeAcres ||
      /(farm size|acre|recommend|which product|which system|best for|interested in a pump|need a pump|want a pump)/.test(
        message,
      )
    ) {
      return 'recommend_by_farm_size';
    }

    if (this.matchVariant(message)) {
      return 'variant_details';
    }

    if (this.matchProductLine(message)) {
      return 'product_line_overview';
    }

    return 'catalog_overview';
  }

  private matchProductLine(message: string): ProductLine | undefined {
    if (/(climatesmart direct|climate smart direct|\bdirect\b)/.test(message)) {
      return 'climate_smart_direct';
    }

    if (
      /(climatesmart battery|climate smart battery|\bbattery\b|csb2?)/.test(
        message,
      )
    ) {
      return 'climate_smart_battery';
    }

    return undefined;
  }

  private matchVariant(message: string): ProductVariant | undefined {
    if (/(2s max|rm2s max)/.test(message)) {
      return 'rainmaker_2s_max';
    }

    if (/(2c kubwa|rm2ck|2ck|kubwa)/.test(message)) {
      return 'rainmaker_2c_kubwa';
    }

    if (/(rainmaker ?2c|rm2c)/.test(message)) {
      return 'rainmaker_2c';
    }

    if (/(rainmaker ?2s|rm2s)/.test(message)) {
      return 'rainmaker_2s';
    }

    return undefined;
  }

  private matchProductCode(message: string): string | undefined {
    const codeByPattern: Array<[RegExp, string]> = [
      [/(csd rm2s max|rainmaker ?2s max|rm2s max)/, 'csd_rm2s_max'],
      [
        /(csd rm2s|climatesmart direct.*2s|climate smart direct.*2s)/,
        'csd_rm2s',
      ],
      [/(csd rm2ck|2c kubwa|rm2ck|2ck)/, 'csd_rm2ck'],
      [/(surface pump)/, 'csd_surface_pump'],
      [/(falcon.*rm2ck)/, 'falcon_rm2ck'],
      [/(falcon.*surface pump)/, 'falcon_sp_max'],
      [/(csb2.*rm2s)/, 'csb2_rm2s'],
      [/(csb2.*rm2ck|csb2.*2ck)/, 'csb2_rm2ck'],
      [/(csb2.*surface pump)/, 'csb2_surface_pump'],
      [/(swap-?out)/, 'csb1_swapout'],
      [/(upgrade)/, 'csb2_upgrade'],
      [/(battery.*drip.*tv|drip.*tv)/, 'csb_rm2_drip_tv'],
      [/(battery.*drip|drip kit)/, 'csb_rm2_drip'],
      [/(battery.*tv|\btv\b)/, 'csb_rm2_tv'],
      [/(battery|best seller|home power)/, 'csb_rm2'],
      [/(rainmaker ?2s|rm2s)/, 'csd_rm2s'],
    ];

    const match = codeByPattern.find(([pattern]) => pattern.test(message));
    return match?.[1];
  }

  private isTroubleshootingQuery(message: string): boolean {
    return /(not working|not starting|won't start|wont start|low water|no water|locked|charging|solar panel|controller|red light|amber light|drip|broken|damaged|technician|repair|fault)/.test(
      message,
    );
  }

  private matchTroubleshootingType(message: string): TroubleshootingIssueType {
    if (/(locked|lock|arrears|unlock)/.test(message)) {
      return 'system_locked';
    }

    if (/(battery|not charging|charge|charging)/.test(message)) {
      return 'battery_not_charging';
    }

    if (/(solar panel|panel|shade|shading)/.test(message)) {
      return 'solar_panel_issue';
    }

    if (
      /(controller|green light|red light|amber light|blinking light|no lights)/.test(
        message,
      )
    ) {
      return 'controller_lights';
    }

    if (/(drip|drip tape|filter|pressure regulator)/.test(message)) {
      return 'drip_irrigation_issue';
    }

    if (/(broken|damaged|field engineer|technician|visit)/.test(message)) {
      return 'escalate_technician';
    }

    if (/(low water|weak flow|reduced output|slow water)/.test(message)) {
      return 'low_water_output';
    }

    return 'pump_not_starting';
  }

  private isAccountQuery(message: string): boolean {
    return /(account|balance|loan|arrears|statement|next instalment|next installment|national id|id number|payment status|owed|owing|overdue|due date)/.test(
      message,
    );
  }

  private isCompanyInfoQuery(message: string): boolean {
    return /(sunculture|contact|phone number|support line|toll[- ]free|branch|office|country|headquarters|where are you|insurance|protect|kilimo boost|paybill|mpesa|payment options|website)/.test(
      message,
    );
  }

  private matchAboutCategory(message: string): AboutCategory {
    if (/(paybill|mpesa|payment option|bank transfer)/.test(message)) {
      return 'payment_options';
    }

    if (
      /(contact|phone number|support line|toll[- ]free|website)/.test(message)
    ) {
      return 'contact';
    }

    if (/(insurance|protect|turaco|hospital cash)/.test(message)) {
      return 'insurance';
    }

    if (/(kilimo boost|input financing)/.test(message)) {
      return 'kilimo_boost';
    }

    if (/(branch|office|service centre|service center)/.test(message)) {
      return 'branches';
    }

    if (/(country|countries|where do you operate)/.test(message)) {
      return 'countries';
    }

    if (/(headquarters|founded)/.test(message)) {
      return 'headquarters';
    }

    if (/(product|what do you sell)/.test(message)) {
      return 'products';
    }

    if (/(what do you do|about sunculture|who are you|company)/.test(message)) {
      return 'what_we_do';
    }

    return 'general';
  }

  private isObjection(message: string): boolean {
    return /(expensive|too high|costly|can't afford|fraud|scam|not sure|let me think|wife|husband|family|already have petrol pump|what if it breaks|deep water)/.test(
      message,
    );
  }

  private matchObjectionType(message: string): ObjectionType {
    if (
      /(expensive|costly|can't afford|cannot afford|too expensive)/.test(
        message,
      )
    ) {
      return 'price_too_expensive';
    }

    if (/deposit/.test(message)) {
      return 'deposit_too_high';
    }

    if (/(fraud|scam|trust)/.test(message)) {
      return 'fraud_concerns';
    }

    if (/(what if it breaks|breaks|reliability|warranty)/.test(message)) {
      return 'what_if_it_breaks';
    }

    if (/(wife|husband|family|consult)/.test(message)) {
      return 'need_to_consult_family';
    }

    if (/let me think|not sure/.test(message)) {
      return 'let_me_think';
    }

    if (/petrol pump|diesel pump/.test(message)) {
      return 'already_have_petrol_pump';
    }

    if (/deep water|too deep/.test(message)) {
      return 'water_source_too_deep';
    }

    return 'volume_requirements_unclear';
  }

  private extractNationalId(message: string): string | undefined {
    const match = message.match(/\b\d{6,12}\b/);
    return match?.[0];
  }

  private extractFarmSize(message: string): number | undefined {
    const match = message.match(/\b(\d+(?:\.\d+)?)\s*(acre|acres)\b/);
    return match ? Number(match[1]) : undefined;
  }

  private formatTelegramReply(
    reply: string,
    toolName: ToolInvocation['toolName'],
    message: string,
  ): string {
    const compact = reply.replace(/\s+/g, ' ').trim();
    const sentences = compact
      .match(/[^.!?]+[.!?]?/g)
      ?.map((part) => part.trim()) ?? [compact];

    if (toolName === 'get_product_info') {
      const opener = this.isInterestMessage(message)
        ? 'I can help with that.'
        : undefined;
      return this.composeTelegramReply(
        opener,
        this.limitSentences(sentences, 2),
        CHAT_SCRIPT.productQuestion,
      );
    }

    if (toolName === 'get_pricing') {
      return this.composeTelegramReply(
        undefined,
        this.limitSentences(sentences, 2),
        CHAT_SCRIPT.pricingQuestion,
      );
    }

    if (toolName === 'troubleshoot_system') {
      const opener = this.isFrustratedMessage(message)
        ? CHAT_SCRIPT.frustration
        : 'Let me help you sort this out.';
      return this.composeTelegramReply(
        opener,
        this.limitSentences(sentences, 2),
        CHAT_SCRIPT.troubleshootQuestion,
      );
    }

    if (toolName === 'check_account') {
      return this.composeTelegramReply(
        CHAT_SCRIPT.checkInfo,
        this.limitSentences(sentences, 2),
        CHAT_SCRIPT.accountQuestion,
      );
    }

    if (toolName === 'handle_objection') {
      return this.composeTelegramReply(
        'I understand your concern.',
        this.limitSentences(sentences, 2),
        CHAT_SCRIPT.objectionQuestion,
      );
    }

    return this.composeTelegramReply(
      undefined,
      this.limitSentences(sentences, 2),
      CHAT_SCRIPT.nextHelp,
    );
  }

  private limitSentences(sentences: string[], maxSentences: number): string {
    const selected = sentences
      .filter(Boolean)
      .slice(0, maxSentences)
      .join(' ')
      .trim();

    if (!selected) {
      return 'I am here to help.';
    }

    return selected;
  }

  private composeTelegramReply(
    opener: string | undefined,
    body: string,
    followUp?: string,
  ): string {
    const parts = [opener, body, followUp]
      .filter(Boolean)
      .map((part) => part?.trim())
      .filter(Boolean);

    return parts.join(' ').trim();
  }

  private isFrustratedMessage(message: string): boolean {
    return /(not working|problem|issue|stuck|frustrat|annoy|urgent|broken|damaged|fault)/.test(
      message,
    );
  }

  private isInterestMessage(message: string): boolean {
    return /(interested|need|want|looking for)/.test(message);
  }
}

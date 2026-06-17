import { Injectable } from '@nestjs/common';

export type PricingQueryType =
  | 'all_products'
  | 'product_price'
  | 'paygo_explanation'
  | 'deposit_info'
  | 'refer_and_earn';

interface PricingEntry {
  code: string;
  name: string;
  cash_kes: number;
  deposit_kes: number;
  months: number;
  monthly_kes: number;
  best_for: string;
  note?: string;
}

// Pricing currently loaded for the chatbot.
const KENYA_PRICING: PricingEntry[] = [
  {
    code: 'csd_rm2s',
    name: 'RainMaker2S NC + ClimateSmart Direct',
    cash_kes: 44999,
    deposit_kes: 2769,
    months: 24,
    monthly_kes: 2769,
    best_for: 'up to 1 acre, lower-cost entry package',
    note: 'March 2026 limited-time offer',
  },
  {
    code: 'csd_rm2ck',
    name: 'RainMaker Kubwa + ClimateSmart Direct',
    cash_kes: 64999,
    deposit_kes: 3809,
    months: 24,
    monthly_kes: 3809,
    best_for: 'up to 2 acres, higher-flow pumping',
    note: 'March 2026 promotional pricing',
  },
  {
    code: 'csd_rm2s_max',
    name: 'ClimateSmart Direct',
    cash_kes: 64999,
    deposit_kes: 5999,
    months: 24,
    monthly_kes: 3299,
    best_for: 'standard brochure direct-irrigation package',
    note: 'Standard brochure pricing',
  },
  {
    code: 'csd_surface_pump',
    name: 'SR1 Surface Pump + ClimateSmart Direct',
    cash_kes: 59999,
    deposit_kes: 3529,
    months: 24,
    monthly_kes: 3529,
    best_for: 'river or open-water pumping',
    note: 'March 2026 promotional pricing',
  },
  {
    code: 'falcon_rm2ck',
    name: 'RainMaker2C Kubwa',
    cash_kes: 92999,
    deposit_kes: 7999,
    months: 24,
    monthly_kes: 4599,
    best_for: 'up to 2 acres on the standard brochure',
    note: 'Standard brochure pricing',
  },
  {
    code: 'falcon_sp_max',
    name: 'ClimateSmart Battery + TV',
    cash_kes: 99999,
    deposit_kes: 8999,
    months: 24,
    monthly_kes: 4599,
    best_for: 'home energy plus TV package',
    note: 'Standard brochure pricing',
  },
  {
    code: 'csb_rm2',
    name: 'RainMaker2 + ClimateSmart Battery',
    cash_kes: 99999,
    deposit_kes: 5329,
    months: 30,
    monthly_kes: 4999,
    best_for: 'up to 2 acres plus home power',
    note: 'Limited-stock CSB1 bundle',
  },
  {
    code: 'csb_rm2_tv',
    name: 'RainMaker2 + ClimateSmart Battery + TV',
    cash_kes: 129999,
    deposit_kes: 11999,
    months: 36,
    monthly_kes: 4599,
    best_for: 'irrigation, home energy, and TV',
    note: 'Standard brochure pricing',
  },
  {
    code: 'csb_rm2_drip',
    name: 'RainMaker2 + ClimateSmart Battery + Direct Drip',
    cash_kes: 128999,
    deposit_kes: 10999,
    months: 36,
    monthly_kes: 4599,
    best_for: 'irrigation, home energy, and drip irrigation',
    note: 'Standard brochure pricing',
  },
  {
    code: 'csb_rm2_drip_tv',
    name: 'RainMaker2 + ClimateSmart Battery + TV + Direct Drip',
    cash_kes: 149999,
    deposit_kes: 30999,
    months: 36,
    monthly_kes: 4599,
    best_for: 'full bundle with irrigation, TV, and drip',
    note: 'Standard brochure pricing',
  },
  {
    code: 'csb2_rm2s',
    name: 'RainMaker2S + CSB2',
    cash_kes: 104999,
    deposit_kes: 7999,
    months: 30,
    monthly_kes: 5149,
    best_for: 'advanced battery package for smaller farms',
    note: 'October 2025 flyer pricing',
  },
  {
    code: 'csb2_rm2ck',
    name: 'RainMaker Kubwa Max + CSB2',
    cash_kes: 104999,
    deposit_kes: 7999,
    months: 30,
    monthly_kes: 5149,
    best_for: 'advanced battery package for higher-flow pumping',
    note: 'October 2025 flyer pricing',
  },
  {
    code: 'csb2_surface_pump',
    name: 'SR1 Surface Pump + CSB2',
    cash_kes: 79999,
    deposit_kes: 6999,
    months: 30,
    monthly_kes: 3899,
    best_for: 'open-water pumping with the newer CSB2 controller',
    note: 'October 2025 flyer pricing',
  },
  {
    code: 'csb1_swapout',
    name: 'Refurbished RainMaker2 + ClimateSmart Battery',
    cash_kes: 59999,
    deposit_kes: 4499,
    months: 21,
    monthly_kes: 3999,
    best_for: 'lower-cost refurbished bundle',
    note: 'Valid while stocks last',
  },
  {
    code: 'csb2_upgrade',
    name: 'Refurbished ClimateSmart Direct',
    cash_kes: 29999,
    deposit_kes: 2499,
    months: 18,
    monthly_kes: 2279,
    best_for: 'lowest-cost refurbished direct package',
    note: 'Valid while stocks last',
  },
];

@Injectable()
export class PricingTool {
  getPricingInfo(queryType: PricingQueryType, productCode?: string): string {
    switch (queryType) {
      case 'all_products':
        return this.allProducts();
      case 'product_price':
        return this.productPrice(productCode);
      case 'paygo_explanation':
        return this.paygoExplanation();
      case 'deposit_info':
        return this.depositInfo(productCode);
      case 'refer_and_earn':
        return this.referAndEarn();
      default:
        return this.allProducts();
    }
  }

  private allProducts(): string {
    const lines = KENYA_PRICING.map(
      (product) =>
        `${product.name}: deposit KES ${product.deposit_kes.toLocaleString()}, KES ${product.monthly_kes.toLocaleString()} monthly for ${product.months} months. Best for ${product.best_for}.`,
    );

    return (
      'Here are the current SunCulture prices I can share. ' +
      lines.join(' | ') +
      ' Cash prices are also available if you want a specific package.'
    );
  }

  private productPrice(productCode?: string): string {
    if (!productCode) {
      return (
        'The entry-level package is RainMaker2S NC with ClimateSmart Direct at KES 2,769 deposit and KES 2,769 monthly for 24 months. ' +
        'If you want home power too, RainMaker2 with ClimateSmart Battery is KES 5,329 deposit and KES 4,999 monthly for 30 months.'
      );
    }

    const product = KENYA_PRICING.find((item) => item.code === productCode);
    if (!product) {
      return (
        'I could not find that exact package right now. ' +
        'Tell me whether you want Direct, Battery, CSB2, Kubwa, or Surface Pump and I will point you to the closest option.'
      );
    }

    return (
      `${product.name} costs KES ${product.cash_kes.toLocaleString()} cash. ` +
      `On Lipa Polepole, the deposit is KES ${product.deposit_kes.toLocaleString()} and the monthly payment is KES ${product.monthly_kes.toLocaleString()} for ${product.months} months. ` +
      `Best for: ${product.best_for}. ` +
      (product.note ? `${product.note}.` : '')
    ).trim();
  }

  private paygoExplanation(): string {
    return (
      'Lipa Polepole means you pay a deposit first, then fixed monthly payments over time instead of paying all the cash upfront. ' +
      'The current packages range from 18 to 36 months depending on the product.'
    );
  }

  private depositInfo(productCode?: string): string {
    if (productCode) {
      const product = KENYA_PRICING.find((item) => item.code === productCode);
      if (product) {
        return (
          `The deposit for ${product.name} is KES ${product.deposit_kes.toLocaleString()}. ` +
          `After that, you pay KES ${product.monthly_kes.toLocaleString()} per month for ${product.months} months.`
        );
      }
    }

    return 'Deposits currently range from KES 2,499 for refurbished ClimateSmart Direct to KES 30,999 for the full RainMaker2 plus ClimateSmart Battery plus TV plus Direct Drip bundle.';
  }

  private referAndEarn(): string {
    return 'SunCulture has a Refer and Earn program. If your referral installs a system, you earn KES 2,000 after the installation is complete.';
  }
}

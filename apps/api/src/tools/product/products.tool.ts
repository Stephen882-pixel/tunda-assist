import { Injectable } from '@nestjs/common';

export type ProductQueryType =
  | 'catalog_overview'
  | 'product_line_overview'
  | 'variant_details'
  | 'compare_lines'
  | 'recommend_by_farm_size'
  | 'add_ons'
  | 'features';

export type ProductLine = 'climate_smart_direct' | 'climate_smart_battery';

export type ProductVariant =
  | 'rainmaker_2s'
  | 'rainmaker_2s_max'
  | 'rainmaker_2c_kubwa'
  | 'rainmaker_2c';

interface VariantInfo {
  name: string;
  summary: string;
  includes: string[];
  addOns?: string[];
  note?: string;
}

const DIRECT_VARIANTS: Record<string, VariantInfo> = {
  rainmaker_2s: {
    name: 'RainMaker2S NC + ClimateSmart Direct',
    summary:
      'A battery-free solar irrigation package for farms up to 1 acre. The March 2026 promotional package includes a submersible pump, CSD controller, one 330W panel, 50m cable, and 50m 25mm HDPE pipe.',
    includes: [
      'submersible pump',
      'ClimateSmart Direct controller',
      '330W solar panel',
      '50m electric cable',
      '50m 25mm HDPE pipe',
    ],
  },
  rainmaker_2s_max: {
    name: 'RainMaker2S + CSB2',
    summary:
      'A CSB2-based package for farmers who want irrigation plus stored solar power. The CSB2 uses LFP battery chemistry, 30Ah, 960Wh, and charges in about 3 hours in good sunlight.',
    includes: [
      'CSB2 controller',
      '7 bulbs',
      'pump',
      'stilling tube',
      'pump cable',
      'solar panel',
      'water pipe',
    ],
    note: 'CSB2 can run up to 4 hours of pumping plus 5 hours of lights per full charge.',
  },
  rainmaker_2c_kubwa: {
    name: 'RainMaker Kubwa + ClimateSmart Direct',
    summary:
      'A higher-flow Direct package for farms up to 2 acres. It includes a submersible pump, CSD controller, two 330W panels, 50m cable, and 50m 40mm HDPE pipe.',
    includes: [
      'submersible pump',
      'ClimateSmart Direct controller',
      '2 x 330W solar panels',
      '50m electric cable',
      '50m 40mm HDPE pipe',
      'necessary fittings',
    ],
    note: 'The Kubwa line delivers about 2,500 litres per hour at 15ft head.',
  },
};

const BATTERY_VARIANTS: Record<string, VariantInfo> = {
  rainmaker_2s: {
    name: 'RainMaker2 + ClimateSmart Battery',
    summary:
      'A solar irrigation and home-energy package optimized for up to 2 acres. It uses a 444Wh, 15Ah lithium-ion battery, reaches a maximum head of 65m, and supports lights and USB charging.',
    includes: [
      'submersible pump',
      '50m electric cable',
      'ClimateSmart Battery',
      '310W roof-mounted or 160W portable panel',
      '100m 25mm HDPE pipe',
      '4 sprinklers',
      '4 LED lights',
      '2 USB charging ports',
    ],
    addOns: ['32-inch TV', 'Direct Drip Irrigation'],
  },
  rainmaker_2c: {
    name: 'RainMaker Kubwa Max + CSB2',
    summary:
      'A higher-flow package using the newer CSB2 controller. CSB2 is compatible with RainMaker Kubwa Max, RainMaker Kubwa, RainMaker2S-NC, and SR1 Surface Pump.',
    includes: [
      'CSB2 controller',
      '7 bulbs',
      'pump',
      'stilling tube',
      'pump cable',
      'solar panel',
      'water pipe',
      'head unit',
    ],
    addOns: [
      '32-inch TV',
      'Direct Drip Irrigation',
      'portable panels at extra cost',
    ],
    note: 'CSB2 adds 8 output ports, IP54 splash resistance, tamper protection, and a battery lifespan of around 2,000 cycles.',
  },
};

@Injectable()
export class ProductsTool {
  getProductInfo(
    queryType: ProductQueryType,
    productLine?: ProductLine,
    variant?: ProductVariant,
    farmSizeAcres?: number,
  ): string {
    switch (queryType) {
      case 'catalog_overview':
        return this.catalogOverview();
      case 'product_line_overview':
        return this.productLineOverview(productLine);
      case 'variant_details':
        return this.variantDetails(productLine, variant);
      case 'compare_lines':
        return this.compareLines();
      case 'recommend_by_farm_size':
        return this.recommendByFarmSize(farmSizeAcres);
      case 'add_ons':
        return this.addOns();
      case 'features':
        return this.commonFeatures();
      default:
        return this.catalogOverview();
    }
  }

  private catalogOverview(): string {
    return (
      'SunCulture offers ClimateSmart Direct and ClimateSmart Battery systems for solar irrigation. ' +
      'ClimateSmart Direct is the lower-cost, battery-free line for irrigation only. ClimateSmart Battery adds stored solar power for lighting, charging, and TV or drip bundles. ' +
      'Current packages include RainMaker2S NC, RainMaker Kubwa, SR1 Surface Pump, and CSB2-based options.'
    );
  }

  private productLineOverview(productLine?: ProductLine): string {
    if (productLine === 'climate_smart_direct') {
      return (
        'ClimateSmart Direct is SunCulture’s battery-free solar irrigation line. ' +
        'It is the lower-cost option for irrigation only, with key packages including RainMaker2S NC for up to 1 acre, RainMaker Kubwa for up to 2 acres, and SR1 Surface Pump for river or open-water setups.'
      );
    }

    if (productLine === 'climate_smart_battery') {
      return (
        'ClimateSmart Battery combines irrigation with stored solar power for home use. ' +
        'The classic ClimateSmart Battery package uses a 444Wh battery, while the newer CSB2 uses 30Ah and 960Wh, with support for lights, charging, and TV add-ons.'
      );
    }

    return this.catalogOverview();
  }

  private variantDetails(
    productLine?: ProductLine,
    variant?: ProductVariant,
  ): string {
    if (productLine === 'climate_smart_direct' && variant) {
      const selected = DIRECT_VARIANTS[variant as keyof typeof DIRECT_VARIANTS];
      if (!selected) {
        return 'I could not find that Direct variant. The current knowledge loaded includes RainMaker2S NC and RainMaker Kubwa direct packages.';
      }

      return (
        `${selected.name}: ${selected.summary} ` +
        `Included in the package: ${selected.includes.join(', ')}. ` +
        (selected.note ? `${selected.note} ` : '')
      ).trim();
    }

    if (productLine === 'climate_smart_battery' && variant) {
      const selected =
        BATTERY_VARIANTS[variant as keyof typeof BATTERY_VARIANTS];
      if (!selected) {
        return 'I could not find that Battery variant. The current knowledge loaded includes RainMaker2 with ClimateSmart Battery and CSB2-based packages.';
      }

      return (
        `${selected.name}: ${selected.summary} ` +
        `Included in the package: ${selected.includes.join(', ')}. ` +
        (selected.addOns?.length
          ? `Add-ons or related bundles: ${selected.addOns.join(', ')}. `
          : '') +
        (selected.note ? `${selected.note} ` : '')
      ).trim();
    }

    return 'Tell me which package you mean, for example RainMaker2S NC, RainMaker Kubwa, SR1 Surface Pump, or a CSB2 package, and I will give you the details.';
  }

  private compareLines(): string {
    return (
      'ClimateSmart Direct is simpler and lower cost because it is battery-free and focused on irrigation. ' +
      'ClimateSmart Battery adds energy storage for pumping beyond peak sunlight and for lights, charging, and TV bundles. ' +
      'CSB2 is the newer battery platform, with a 960Wh battery, 8 output ports, 7 bulbs, and support for four pump types.'
    );
  }

  private recommendByFarmSize(farmSizeAcres?: number): string {
    if (!farmSizeAcres) {
      return 'To recommend the right pump, tell me your farm size in acres and whether your water source is a borehole, shallow well, river, or open water.';
    }

    if (farmSizeAcres <= 1) {
      return (
        `For a ${farmSizeAcres}-acre farm, RainMaker2S NC with ClimateSmart Direct is the clearest fit from the March 2026 pricing sheet. ` +
        'If you also want stored power for lights or charging, ask about RainMaker2 with ClimateSmart Battery or the CSB2-based options.'
      );
    }

    if (farmSizeAcres <= 2) {
      return (
        `For a ${farmSizeAcres}-acre farm, RainMaker Kubwa with ClimateSmart Direct is the main higher-flow option. ` +
        'If your source is river or open water, SR1 Surface Pump is also worth considering.'
      );
    }

    return (
      `For a ${farmSizeAcres}-acre farm, you may need a tailored setup. ` +
      'Most standard packages are designed for farms up to about 2 acres, so this would be best confirmed with the sales team.'
    );
  }

  private addOns(): string {
    return (
      'Direct Drip Irrigation and a 32-inch solar TV are key add-ons. ' +
      'They also mention bundled Battery plus TV packages and a drip system covering about 500 square metres with pipe, regulator, filtration, connectors, and fittings.'
    );
  }

  private commonFeatures(): string {
    return (
      'Common package features include solar-powered pumping, cable and pipe kits, free installation and training, and a 3-year pump-system warranty. ' +
      'The newer CSB2 specifically adds LFP battery chemistry, 8 output ports, 7 bulbs, IP54 splash resistance, and tamper protection.'
    );
  }
}

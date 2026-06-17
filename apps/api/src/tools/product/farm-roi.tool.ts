import { Injectable } from '@nestjs/common';

export type CropType =
  | 'tomatoes'
  | 'onions'
  | 'cabbages'
  | 'passion_fruit'
  | 'capsicum'
  | 'other';

// Reference yield and price data per acre (conservative, 2026 Kenya market)
const CROP_DATA: Record<
  Exclude<CropType, 'other'>,
  {
    yield_kg_per_acre: number;
    price_kes_per_kg: number;
    label: string;
    note: string;
  }
> = {
  tomatoes: {
    yield_kg_per_acre: 15000,
    price_kes_per_kg: 40,
    label: 'tomatoes',
    note: 'With consistent irrigation you can sell in dry season when rain-fed crops fail — tomatoes can spike to KES 60–70 per kilo when supply is low. That is 50–75% more per kilo.',
  },
  onions: {
    yield_kg_per_acre: 10000,
    price_kes_per_kg: 70,
    label: 'onions',
    note: 'Onions yield 8,000–12,000 kg per acre. Peak dry season prices of KES 60–80 per kilo make this one of the most profitable irrigated crops.',
  },
  cabbages: {
    yield_kg_per_acre: 20000,
    price_kes_per_kg: 20,
    label: 'cabbages',
    note: 'Cabbages yield 20,000 or more kilos per acre. At KES 15–25 per kilo the volumes make the numbers work.',
  },
  passion_fruit: {
    yield_kg_per_acre: 0, // uses monthly revenue model
    price_kes_per_kg: 0,
    label: 'passion fruit',
    note: 'Passion fruit generates KES 40,000 or more per month per acre at full yield — making it one of the highest-value perennial crops for irrigated farmers.',
  },
  capsicum: {
    yield_kg_per_acre: 12500,
    price_kes_per_kg: 65,
    label: 'capsicum',
    note: 'Capsicum yields 10,000–15,000 kg per acre at KES 50–80 per kilo — strong returns with reliable water.',
  },
};

// Typical farm input costs per acre per season (conservative estimates)
const FARM_COSTS_PER_ACRE = {
  seeds: 15000,
  fertilizer_and_manure: 45000,
  land_prep_and_drip_lines: 40000,
  labor_and_crop_protection: 50000,
};

const PAYGO_MONTHLY_REFERENCE = 5000; // conservative mid-range CSB + RM2

@Injectable()
export class FarmRoiTool {
  calculateRoi(
    cropType: CropType,
    farmSizeAcres: number,
    monthlyFuelSpendKes: number,
  ): string {
    if (cropType === 'passion_fruit') {
      return this.passionFruitRoi(farmSizeAcres, monthlyFuelSpendKes);
    }

    if (cropType === 'other') {
      return this.genericRoi(farmSizeAcres, monthlyFuelSpendKes);
    }

    const crop = CROP_DATA[cropType];
    const acres = Math.max(0.5, farmSizeAcres);

    const grossRevenue = crop.yield_kg_per_acre * crop.price_kes_per_kg * acres;
    const seeds = FARM_COSTS_PER_ACRE.seeds * acres;
    const fertilizer = FARM_COSTS_PER_ACRE.fertilizer_and_manure * acres;
    const landPrep = FARM_COSTS_PER_ACRE.land_prep_and_drip_lines * acres;
    const labor = FARM_COSTS_PER_ACRE.labor_and_crop_protection * acres;
    const sunCulturePayments = PAYGO_MONTHLY_REFERENCE * 6; // 6-month season

    const totalFarmCosts = seeds + fertilizer + landPrep + labor;
    const totalCosts = totalFarmCosts + sunCulturePayments;
    const netProfit = grossRevenue - totalCosts;
    const annualFuelSaved = monthlyFuelSpendKes * 12;

    return (
      `Here is the financial picture for ${acres} acres of ${crop.label} with reliable solar irrigation. ` +
      `Based on what we see from farmers using SunCulture systems: ` +
      `Gross revenue — ${crop.yield_kg_per_acre * acres >= 1000 ? Math.round((crop.yield_kg_per_acre * acres) / 1000) + ',000' : crop.yield_kg_per_acre * acres} kilos at KES ${crop.price_kes_per_kg} per kilo — KES ${grossRevenue.toLocaleString()} in one season. ` +
      `Farm input costs: seeds around KES ${seeds.toLocaleString()}, fertilizer and manure around KES ${fertilizer.toLocaleString()}, land preparation and drip lines around KES ${landPrep.toLocaleString()}, labour and crop protection around KES ${labor.toLocaleString()}. ` +
      `Your SunCulture monthly payments over a six-month season add around KES ${sunCulturePayments.toLocaleString()}. ` +
      `Total costs for the season: around KES ${totalCosts.toLocaleString()}. ` +
      `That leaves you with a net profit of roughly KES ${netProfit.toLocaleString()} — in one season, on ${acres} acres. ` +
      `And that is the conservative number. ` +
      (monthlyFuelSpendKes > 0
        ? `On top of that, the KES ${monthlyFuelSpendKes.toLocaleString()} you are currently spending on fuel every month — that is KES ${annualFuelSaved.toLocaleString()} a year — goes back to zero with SunCulture. That money stays in your pocket. `
        : '') +
      `${crop.note} ` +
      `Does that feel in the range of what you would expect for your farm?`
    );
  }

  private passionFruitRoi(
    farmSizeAcres: number,
    monthlyFuelSpendKes: number,
  ): string {
    const acres = Math.max(0.5, farmSizeAcres);
    const monthlyRevenue = 40000 * acres;
    const annualRevenue = monthlyRevenue * 12;
    const annualFuelSaved = monthlyFuelSpendKes * 12;

    return (
      `Passion fruit is one of the strongest cases for solar irrigation. ` +
      `At full yield, farmers typically earn KES ${monthlyRevenue.toLocaleString()} or more per month from ${acres} acres — that is around KES ${annualRevenue.toLocaleString()} a year. ` +
      `As a perennial crop, consistent water is everything — without reliable irrigation, you lose yield in every dry month. ` +
      `Your SunCulture monthly payment is around KES 4,999 to 5,619 depending on the system. ` +
      `That is a small fraction of what the farm can produce once water is consistent. ` +
      (monthlyFuelSpendKes > 0
        ? `And the KES ${monthlyFuelSpendKes.toLocaleString()} you currently spend on fuel — KES ${annualFuelSaved.toLocaleString()} a year — drops to zero. `
        : '') +
      `Does that match what you are seeing on your farm currently?`
    );
  }

  private genericRoi(
    farmSizeAcres: number,
    monthlyFuelSpendKes: number,
  ): string {
    const acres = Math.max(0.5, farmSizeAcres);
    const annualFuelSaved = monthlyFuelSpendKes * 12;
    const fiveYearFuelCost = annualFuelSaved * 5;

    return (
      `Even without knowing your specific crop, the financial case for solar irrigation is clear. ` +
      (monthlyFuelSpendKes > 0
        ? `You currently spend KES ${monthlyFuelSpendKes.toLocaleString()} per month on fuel — KES ${annualFuelSaved.toLocaleString()} a year, KES ${fiveYearFuelCost.toLocaleString()} over five years. That never stops. ` +
          `Our monthly PAYGO payment is close to what you already spend on fuel, but it stops after 28 to 36 months. After that, your water costs nothing. ` +
          `Over five years, you spend two to three times more on fuel than the total cost of our system. `
        : `Solar irrigation removes fuel costs entirely and gives you control over your water year-round, not just when it rains. `) +
      `For ${acres} acres, our system can deliver up to 1,100 to 2,750 litres per hour depending on the model, covering your irrigation needs consistently. ` +
      `Can you tell me what crop you are growing? That will let me give you a much more specific income estimate.`
    );
  }
}

import { Injectable } from '@nestjs/common';

const SUNCULTURE_INFO = {
  mission:
    "SunCulture's mission is to improve the quality of life of farmers in Africa by building and commercializing life-changing solar-powered irrigation and energy solutions. We help smallholder farmers increase their crop yields, reduce costs, and earn more income.",

  what_we_do:
    'SunCulture designs, manufactures, finances, and services IoT-enabled solar energy and irrigation systems for smallholder farmers across sub-Saharan Africa. Our products replace expensive diesel pumps and eliminate dependence on rain-fed agriculture, giving farmers control over their water supply year-round.',

  products: [
    {
      name: 'RainMaker2',
      description:
        'Our flagship solar water pump — delivers approximately 2x the flow rate of the original RainMaker. Ideal for farmers irrigating 1–5 acres. Comes with drip irrigation kit, solar panels, and a submersible pump.',
    },
    {
      name: 'ClimateSmart',
      description:
        'An IoT-connected solar energy system with remote monitoring for 12V and 24V appliances. Powers irrigation, lighting, phone charging, and small appliances from a single solar setup.',
    },
    {
      name: 'ClimateSmart Battery 2 (CSB2)',
      description:
        'A solar home energy solution providing reliable household electricity — lighting, phone charging, and appliances — for off-grid households.',
    },
  ],

  financing:
    'We offer Pay-As-You-Grow financing — locally called Lipa Polepole. Instead of paying a large upfront cost, customers make small monthly instalments over 24–36 months. This makes solar irrigation accessible to farmers who could never afford it outright. The monthly payment includes insurance, free delivery, and free installation.',

  impact: {
    systems_sold: '45,000+',
    yield_increase: 'Up to 300% increase in crop yields',
    water_reduction:
      'Up to 80% reduction in water usage compared to flood irrigation',
    farmers_with_increased_income:
      '87% of SunCulture farmers report increased income',
    farmers_with_increased_production:
      '93% of SunCulture farmers report increased production',
    market_position:
      'Largest provider of smallholder farmer solar irrigation systems in sub-Saharan Africa, with ~50% market share in East Africa',
  },

  countries:
    "We operate in 8+ countries across sub-Saharan Africa: Kenya (headquarters), Uganda, Côte d'Ivoire, Ethiopia, Togo, Zambia, Rwanda, Cameroon, Ghana, Morocco, and Senegal.",

  headquarters: 'Nairobi, Kenya',

  founded: '2012',

  funding: 'SunCulture has raised over $59 million in total funding.',

  contact:
    'Toll-free support line: 0800 721 042. Main office: +254 700 327 002. Website: www.sunculture.com. Check your balance or make payments via USSD: dial *384*02# from your phone. You can also reach us on social media @sunculturekenya on Facebook, Instagram, YouTube, TikTok, LinkedIn, and Twitter.',

  payment_options: {
    mpesa_cash: {
      label: 'M-Pesa Cash Payment',
      paybill: '921162',
      account: 'Your National ID number',
    },
    mpesa_lipa_polepole: {
      label: 'M-Pesa Lipa Polepole (Monthly Instalments)',
      paybill: '862451',
      account: 'Your National ID number',
    },
    bank_stanbic: {
      label: 'Bank Transfer — Stanbic Bank',
      account_name: 'SunCulture Kenya Ltd',
      account_number: '0100 006 181 699',
      branch: 'International Life House',
      swift: 'SBICKENX',
      branch_code: '008',
      bank_code: '31',
    },
    bank_im: {
      label: 'Bank Transfer — I&M Bank',
      account_name: 'SunCulture Kenya Limited',
      account_number: '01900743981210',
      branch: 'Riverside Branch',
      swift: 'IMBLKENA',
      branch_code: '019',
      bank_code: '57',
    },
    balance_check:
      'Dial *384*02# from your phone to check your balance at any time.',
    security_note:
      'IMPORTANT: SunCulture never asks customers to pay via a personal M-Pesa number. All payments go through official SunCulture company accounts only — Paybill 921162 for cash or Paybill 862451 for instalments.',
  },

  insurance: {
    program: 'SunCulture Protect',
    partner: 'Turaco',
    included:
      'Automatically included for all new PAYG customers at no extra cost.',
    benefits: {
      life_insurance:
        'KES 50,000 payout to your family in the event of your death.',
      hospital_cash:
        'KES 1,000 per night for hospital stays registered by the Ministry of Health — up to 30 nights per year.',
    },
    how_it_works:
      "Coverage starts from your loan issue date and renews monthly as long as payments are made on time. If a payment is missed, coverage is discontinued. To reinstate, simply pay the current month's instalment — no back-pay required.",
    how_to_claim: {
      call: '0800 221 245 (Turaco toll-free)',
      whatsapp: '0768 387 245',
      documents:
        'Copy of National ID plus hospital discharge summary (for hospital cash) or death certificate (for life insurance).',
      processing:
        'Payments processed within 3 business days to M-PESA or Airtel Money.',
    },
  },

  kilimo_boost: {
    what_is_it:
      'Kilimo Boost is an input financing program for smallholder farmers. It lets you access agricultural inputs immediately and repay in monthly instalments.',
    who_qualifies:
      'Existing SunCulture customers (PAYG or Cash) who have been a customer for more than 6 months. PAYG customers must be in "current," "advance," or "complete" payment status.',
    how_it_works:
      'You pay a 10% deposit to SunCulture, who covers the full input cost upfront. You then repay the rest monthly: 10% principal plus a 3% monthly management fee, with the full balance payable in the last month.',
    amounts: [
      { range: 'KES 5,000 – 10,000', repayment_period: '5 months' },
      { range: 'KES 10,000 – 15,000', repayment_period: '6 months' },
      { range: 'KES 15,000 – 20,000', repayment_period: '7 months' },
    ],
    important:
      'Kilimo Boost is for agricultural inputs only — seeds, fertiliser, crop protection. Using it for non-agricultural products is a breach of contract.',
    default_consequences:
      'A missed payment makes the full balance immediately due. SunCulture may remotely deactivate your pump until the arrears are cleared.',
  },

  branches: {
    head_office: 'Nairobi — Muthangari Drive & Gath Road',
    sales_and_service_centres: [
      'Thika',
      'Mutithi',
      'Machakos',
      'Mitunguu',
      'Siaya',
      'Matanya',
      'Nakuru',
      'Eldoret',
      'Kitale',
      'Kisumu',
      'Busia',
      'Emali',
      'Kilifi',
      'Webuye',
      'Meru',
    ],
    additional_branches: [
      'Bomet',
      'Bungoma',
      'Chuka',
      'Homabay',
      'Iten',
      'Kapsabet',
      'Kakamega',
      'Kericho',
      'Kimana',
      'Kitui',
      'Makindu',
      'Malindi',
      'Migori',
      'Nyeri',
      'Taveta',
      'Ukunda',
    ],
  },

  free_services: {
    warranty:
      '3-year warranty on the pump, panel, and controller. 2-year warranty on the drip irrigation system. 2-year warranty on the ClimateSmart Battery and TV.',
    delivery: 'Free delivery to the nearest Fargo Courier branch.',
    installation:
      'Free installation and training — a SunCulture technician sets up your system and shows you how to use it.',
    after_sales:
      'After-sales support is included. Call our toll-free line 0800 721 042 anytime.',
  },

  account_management: {
    balance_check:
      'Dial *384*02# from your phone to check your loan balance at any time.',
    locking:
      'Systems lock automatically if your account goes into arrears. This happens remotely — you do not need to bring the system in.',
    unlocking:
      'Your system unlocks automatically once your payment is confirmed. There is no need to call us — the unlock happens within minutes of payment.',
    app: 'You can also manage your account via the MySunCulture app — search "SunCulture" on Google Play.',
    ussd: 'USSD: dial *384*02# to check balance, make payments, or access the Refer and Earn program.',
  },
};

export type AboutCategory =
  | 'mission'
  | 'what_we_do'
  | 'products'
  | 'financing'
  | 'impact'
  | 'countries'
  | 'headquarters'
  | 'founded'
  | 'funding'
  | 'contact'
  | 'payment_options'
  | 'insurance'
  | 'kilimo_boost'
  | 'branches'
  | 'free_services'
  | 'account_management'
  | 'general';

@Injectable()
export class AboutTool {
  getInfo(category: AboutCategory = 'general'): string {
    switch (category) {
      case 'mission':
        return SUNCULTURE_INFO.mission;

      case 'what_we_do':
        return SUNCULTURE_INFO.what_we_do;

      case 'products': {
        const list = SUNCULTURE_INFO.products
          .map((p) => `${p.name}: ${p.description}`)
          .join(' | ');
        return `SunCulture currently offers three main products: ${list}`;
      }

      case 'financing':
        return SUNCULTURE_INFO.financing;

      case 'impact': {
        const i = SUNCULTURE_INFO.impact;
        return (
          `SunCulture has sold over ${i.systems_sold} systems. ` +
          `${i.yield_increase}. ${i.water_reduction}. ` +
          `${i.farmers_with_increased_income}. ${i.farmers_with_increased_production}. ` +
          `${i.market_position}.`
        );
      }

      case 'countries':
        return SUNCULTURE_INFO.countries;

      case 'headquarters':
        return `SunCulture is headquartered in ${SUNCULTURE_INFO.headquarters}, founded in ${SUNCULTURE_INFO.founded}.`;

      case 'founded':
        return `SunCulture was founded in ${SUNCULTURE_INFO.founded}.`;

      case 'funding':
        return SUNCULTURE_INFO.funding;

      case 'contact':
        return SUNCULTURE_INFO.contact;

      case 'payment_options': {
        const p = SUNCULTURE_INFO.payment_options;
        return (
          `To make a cash payment, use M-Pesa Paybill ${p.mpesa_cash.paybill} with your National ID as the account number. ` +
          `For your monthly Lipa Polepole instalments, use M-Pesa Paybill ${p.mpesa_lipa_polepole.paybill} with your National ID as the account number. ` +
          `For bank transfers, we accept payments via Stanbic Bank — account name SunCulture Kenya Ltd, account number ${p.bank_stanbic.account_number}, branch ${p.bank_stanbic.branch}. ` +
          `We also accept I&M Bank — account name SunCulture Kenya Limited, account number ${p.bank_im.account_number}, ${p.bank_im.branch}. ` +
          `To check your balance any time, dial ${p.balance_check.split('Dial ')[1]} ` +
          `${p.security_note}`
        );
      }

      case 'insurance': {
        const ins = SUNCULTURE_INFO.insurance;
        return (
          `All SunCulture PAYG customers are automatically enrolled in ${ins.program}, our insurance program in partnership with ${ins.partner} — at no extra cost. ` +
          `You are covered for ${ins.benefits.life_insurance} ` +
          `You also get ${ins.benefits.hospital_cash} ` +
          `${ins.how_it_works} ` +
          `To make a claim, call Turaco on ${ins.how_to_claim.call} or send your documents via WhatsApp to ${ins.how_to_claim.whatsapp}. ` +
          `You will need: ${ins.how_to_claim.documents} ` +
          `${ins.how_to_claim.processing}`
        );
      }

      case 'kilimo_boost': {
        const kb = SUNCULTURE_INFO.kilimo_boost;
        const amounts = kb.amounts
          .map((a) => `${a.range} — repay over ${a.repayment_period}`)
          .join('; ');
        return (
          `${kb.what_is_it} ` +
          `${kb.who_qualifies} ` +
          `${kb.how_it_works} ` +
          `Financing amounts: ${amounts}. ` +
          `${kb.important} ` +
          `${kb.default_consequences}`
        );
      }

      case 'branches': {
        const b = SUNCULTURE_INFO.branches;
        const centres = b.sales_and_service_centres.join(', ');
        return (
          `Our head office is in ${b.head_office}. ` +
          `We have Sales and Service Centres in: ${centres}. ` +
          `We also have additional branches in many other towns across Kenya — if you are unsure of your nearest branch, our toll-free line 0800 721 042 can help you find it.`
        );
      }

      case 'free_services': {
        const fs = SUNCULTURE_INFO.free_services;
        return (
          `Every SunCulture system comes with these included at no extra cost: ` +
          `${fs.warranty} ` +
          `${fs.delivery} ` +
          `${fs.installation} ` +
          `${fs.after_sales}`
        );
      }

      case 'account_management': {
        const am = SUNCULTURE_INFO.account_management;
        return (
          `To check your loan balance, ${am.balance_check} ` +
          `${am.locking} ` +
          `${am.unlocking} ` +
          `${am.ussd} ` +
          `${am.app}`
        );
      }

      case 'general':
      default: {
        const i = SUNCULTURE_INFO.impact;
        return (
          `SunCulture is a Nairobi-based company founded in ${SUNCULTURE_INFO.founded} that designs, manufactures, and finances solar-powered irrigation and energy systems for smallholder farmers across sub-Saharan Africa. ` +
          `Our mission is to improve the quality of life of farmers by making clean, reliable energy and water access affordable. ` +
          `We offer Lipa Polepole — Pay-As-You-Grow financing — so farmers pay in small monthly instalments over 24–36 months, including insurance, free delivery, and free installation. ` +
          `We have sold over ${i.systems_sold} systems across 8+ countries, and 93% of our customers report increased crop production. ` +
          `Toll-free support: 0800 721 042.`
        );
      }
    }
  }
}

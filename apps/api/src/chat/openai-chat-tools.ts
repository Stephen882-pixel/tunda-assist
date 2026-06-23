import type { ChatCompletionTool } from 'openai/resources/chat/completions';

/**
 * OpenAI `tools` array mirroring the executors in
 * [ToolsService](src/tools/tools.service.ts). Keep in sync with Vapi dashboard tools if they overlap.
 */
export const openAiChatTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'about_sunculture',
      description:
        'SunCulture company and operations: mission, products, impact, contact, paybills, insurance, branches, account management, etc.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: [
              'mission',
              'what_we_do',
              'products',
              'financing',
              'impact',
              'countries',
              'headquarters',
              'founded',
              'funding',
              'contact',
              'payment_options',
              'insurance',
              'kilimo_boost',
              'branches',
              'free_services',
              'account_management',
              'general',
            ],
            description: 'Topic category to retrieve',
          },
        },
        required: ['category'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_info',
      description:
        'Product catalog, line details, variants, comparisons, and recommendations by farm size.',
      parameters: {
        type: 'object',
        properties: {
          query_type: {
            type: 'string',
            enum: [
              'catalog_overview',
              'product_line_overview',
              'variant_details',
              'compare_lines',
              'recommend_by_farm_size',
              'add_ons',
              'features',
            ],
          },
          product_line: {
            type: 'string',
            enum: ['climate_smart_direct', 'climate_smart_battery'],
            description: 'Optional product line when relevant',
          },
          variant: {
            type: 'string',
            enum: [
              'rainmaker_2s',
              'rainmaker_2s_max',
              'rainmaker_2c_kubwa',
              'rainmaker_2c',
            ],
            description:
              'Optional product variant for detailed or comparison queries',
          },
          farm_size_acres: {
            type: 'number',
            description: 'Farm size in acres, when needed for recommendations',
          },
        },
        required: ['query_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_pricing',
      description:
        'Product pricing, PAYGO, deposits, or Refer and Earn; never invent numbers.',
      parameters: {
        type: 'object',
        properties: {
          query_type: {
            type: 'string',
            enum: [
              'all_products',
              'product_price',
              'paygo_explanation',
              'deposit_info',
              'refer_and_earn',
            ],
          },
          product_code: {
            type: 'string',
            description:
              'e.g. csd_rm2s for a specific line item when user asks for one product',
          },
        },
        required: ['query_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'handle_objection',
      description:
        'Use scripted responses for user hesitation or pushback; always pick the closest objection type.',
      parameters: {
        type: 'object',
        properties: {
          objection_type: {
            type: 'string',
            enum: [
              'price_too_expensive',
              'deposit_too_high',
              'solar_company_distrust',
              'what_if_it_breaks',
              'need_to_consult_family',
              'let_me_think',
              'water_source_too_deep',
              'already_have_petrol_pump',
              'fraud_concerns',
              'volume_requirements_unclear',
            ],
          },
        },
        required: ['objection_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculate_farm_roi',
      description:
        'Project income / ROI and compare to typical spend; use after crop and farm size are known (or with reasonable defaults).',
      parameters: {
        type: 'object',
        properties: {
          crop_type: {
            type: 'string',
            enum: [
              'tomatoes',
              'onions',
              'cabbages',
              'passion_fruit',
              'capsicum',
              'other',
            ],
          },
          farm_size_acres: { type: 'number' },
          monthly_fuel_spend_kes: {
            type: 'number',
            description: 'Optional, default 0',
          },
        },
        required: ['crop_type', 'farm_size_acres'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'troubleshoot_system',
      description:
        'Diagnosis steps for system issues, or escalation to a technician when needed.',
      parameters: {
        type: 'object',
        properties: {
          issue_type: {
            type: 'string',
            enum: [
              'pump_not_starting',
              'low_water_output',
              'system_locked',
              'battery_not_charging',
              'solar_panel_issue',
              'controller_lights',
              'drip_irrigation_issue',
              'escalate_technician',
            ],
          },
        },
        required: ['issue_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_account',
      description:
        'Look up a customer account by National ID. Only when the user has given their ID.',
      parameters: {
        type: 'object',
        properties: {
          national_id: { type: 'string' },
        },
        required: ['national_id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'validate_sunculture_agent',
      description:
        'First step for internal SunCulture staff flows: look up a registered employee/agent in AMT by the mobile number on their HR profile. ' +
        'Use when the user (acting as a SunCulture agent) wants to create a lead, check commissions, or similar sales/ops actions that require an authenticated agent. ' +
        'Do not call this until the user has given a phone number. If they only expressed intent, ask for their SunCulture-registered mobile (Kenya: 07… or 2547…). ' +
        'If validation fails, relay the tool result; do not invent success.',
      parameters: {
        type: 'object',
        properties: {
          phone: {
            type: 'string',
            description:
              'Mobile number as typed by the user; may include spaces (will be normalised to 254…).',
          },
          inquiry_type: {
            type: 'string',
            enum: ['create_lead', 'commissions', 'other'],
            description: 'What the user is trying to do (for context; optional).',
          },
        },
        required: ['phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_sunculture_lead',
      description:
        'After validate_sunculture_agent succeeds, submit a new customer lead to the sales app (AMT). ' +
        'Requires the AMT employee record id from validation as validated_employee_id. ' +
        'Collect all required fields from the user; use exact dropdown labels for lead source and water source. ' +
        'For product of interest, use the exact label from the Sales App list (examples: CSD1+RM2S MAX, RainMaker 2CKubwa (3.5), …); if unsure, ask which product. ' +
        'Preferred language codes: en (English), fr (French), sw (Swahili). ' +
        'Purchase timeline: use the form’s value e.g. TWO_WEEKS when that matches the user’s intent.',
      parameters: {
        type: 'object',
        properties: {
          validated_employee_id: {
            type: 'number',
            description:
              'AMT employee record id from the validate_sunculture_agent result (integer).',
          },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          customer_type: {
            type: 'string',
            enum: ['individual', 'distributor'],
            description: 'Maps to individual vs distributor customer type in AMT.',
          },
          mobilePhone: {
            type: 'string',
            description: 'Customer mobile; Kenya formats accepted, normalised to 254…',
          },
          location: { type: 'string' },
          nearestLandmark: { type: 'string' },
          productOfInterest: {
            type: 'string',
            description:
              'Exact product label as in the Sales App (e.g. CSD1+RM2S MAX). More products exist in the app than listed in docs.',
          },
          leadSource: {
            type: 'string',
            enum: [
              'Self Registration Whatsapp',
              'Stockist',
              'X Marketing',
              'Influencer Marketing',
              'N/A',
              'Whatsapp',
              'Website',
              'Walk-In',
            ],
            description: 'Must match a Sales App lead source option exactly.',
          },
          preferredLanguage: {
            type: 'string',
            enum: ['en', 'fr', 'sw'],
            description: 'English, French, or Swahili (API codes).',
          },
          purchaseDate: {
            type: 'string',
            description:
              'Expected purchase window code from the form (e.g. TWO_WEEKS). Ask the user if unclear.',
          },
          waterSource: {
            type: 'string',
            enum: [
              'Rainwater Harvesting',
              'Rain',
              'Lake',
              'Shallow Water',
              'River',
              'Dam',
            ],
          },
          leadCategory: {
            type: 'string',
            enum: ['HOT', 'WARM', 'COLD'],
          },
          companyRegionId: {
            type: 'number',
            description: 'Optional company region; defaults to 1 if omitted.',
          },
        },
        required: [
          'validated_employee_id',
          'firstName',
          'lastName',
          'customer_type',
          'mobilePhone',
          'location',
          'nearestLandmark',
          'productOfInterest',
          'leadSource',
          'preferredLanguage',
          'purchaseDate',
          'waterSource',
          'leadCategory',
        ],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_commission_summary',
      description:
        'Get total commission earnings for a SunCulture employee for a specific time period. Ask for their phone number if not provided. Use this when users ask about their total earnings, commissions, or income.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['14_days', '30_days', '60_days', '90_days'],
            description:
              'Time period for commission calculation (default: 30_days)',
          },
          phone: {
            type: 'string',
            description:
              "Employee's registered phone number (format: 254... or 07...). Ask the user for this if not provided.",
          },
        },
        required: ['period', 'phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_commission_breakdown',
      description:
        'Get detailed breakdown of commission sources (CDS2 sales, JSF sales, etc.) for a SunCulture employee. Ask for their phone number if not provided. Use when users want to see where their commissions came from.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['14_days', '30_days', '60_days', '90_days'],
            description:
              'Time period for the breakdown (default: 30_days)',
          },
          phone: {
            type: 'string',
            description:
              "Employee's registered phone number (format: 254... or 07...). Ask the user for this if not provided.",
          },
        },
        required: ['period', 'phone'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_ticket',
      description:
        'Create a support ticket when an agent reports a problem, discrepancy, or issue they need help resolving. ' +
        'Use when the user says things like "I have a problem", "my commissions are wrong", "I want to report an issue", or any similar complaint. ' +
        'Ask for their employee ID and name if not already known from the conversation.',
      parameters: {
        type: 'object',
        properties: {
          agent_id: {
            type: 'string',
            description: 'Employee ID of the agent raising the ticket.',
          },
          agent_name: {
            type: 'string',
            description: 'Full name of the agent.',
          },
          category: {
            type: 'string',
            enum: ['commission', 'payment', 'technical', 'other'],
            description: 'Category that best describes the issue.',
          },
          description: {
            type: 'string',
            description: 'Clear description of the problem in the agent\'s own words.',
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            description: 'Urgency of the issue (default: MEDIUM).',
          },
        },
        required: ['agent_id', 'agent_name', 'category', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_lead_status',
      description:
        'Look up information about a specific lead or customer by their lead ID. Returns status, last contact date, next actions, and conversion value.',
      parameters: {
        type: 'object',
        properties: {
          lead_id: {
            type: 'string',
            description:
              'Lead identifier (e.g., LEAD-001, LEAD-002). Ask the user for this if not provided.',
          },
        },
        required: ['lead_id'],
      },
    },
  },
];

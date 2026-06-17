export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  vapiApiKey: process.env.VAPI_API_KEY,
  publicUrl: process.env.PUBLIC_URL,
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
    maxContextMessages: parseInt(
      process.env.OPENAI_MAX_CONTEXT_MESSAGES ?? '40',
      10,
    ),
    maxToolIterations: parseInt(
      process.env.OPENAI_MAX_TOOL_ITERATIONS ?? '8',
      10,
    ),
  },
  chatSocket: {
    /** Optional. If set, client must send this value (e.g. in auth payload) to use the native chat namespace. */
    sharedSecret: process.env.CHAT_SOCKET_SECRET ?? '',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
  },
  amt: {
    baseUrl: process.env.AMT_BASE_URL ?? 'https://amt-test.sunculture.io/api',
    employeeId: process.env.AMT_EMPLOYEE_ID ?? '',
    apiKey: process.env.AMT_API_KEY ?? '',
    /** POST .../sales-app/request (lead creation); defaults to test stack */
    salesAppRequestUrl:
      process.env.AMT_SALES_APP_REQUEST_URL ??
      'https://amt-test.sunculture.io/api/sales-app/request',
    leadFormId: process.env.AMT_LEAD_FORM_ID ?? '19',
    leadFormVersion: process.env.AMT_LEAD_FORM_VERSION ?? '175',
  },
});

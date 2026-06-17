import { config as loadEnv } from 'dotenv';
import axios from 'axios';

loadEnv();

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const publicUrl = process.env.PUBLIC_URL;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }

  if (!publicUrl) {
    throw new Error('PUBLIC_URL is required');
  }

  if (!secret) {
    throw new Error('TELEGRAM_WEBHOOK_SECRET is required');
  }

  const webhookUrl = `${publicUrl}/telegram/webhook`;
  const response = await axios.post(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ['message'],
      drop_pending_updates: true,
    },
  );

  console.log(JSON.stringify(response.data, null, 2));
}

main().catch((error: unknown) => {
  if (axios.isAxiosError(error)) {
    console.error(error.response?.data ?? error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});

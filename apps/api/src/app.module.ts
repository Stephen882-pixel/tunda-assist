import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VapiModule } from './vapi/vapi.module';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { CallReportsModule } from './call-reports/call-reports.module';
import configuration from './config/configuration';
import { AiModule } from './ai/ai.module';
import { TelegramModule } from './telegram/telegram.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    CommonModule,
    AiModule,
    CallReportsModule,
    VapiModule,
    TelegramModule,
    ChatModule,
  ],
})
export class AppModule {}

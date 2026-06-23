import { Module } from '@nestjs/common';
import { CommissionToolsModule } from './commission/commission.module';
import { SalesToolsModule } from './sales/sales.module';
import { ProductToolsModule } from './product/product.module';
import { SupportToolsModule } from './support/support.module';
import { ToolsService } from './tools.service';
import { TicketsModule } from '@/tickets/tickets.module';

@Module({
  imports: [
    CommissionToolsModule,
    SalesToolsModule,
    ProductToolsModule,
    SupportToolsModule,
    TicketsModule,
  ],
  providers: [ToolsService],
  exports: [ToolsService, CommissionToolsModule],
})
export class ToolsModule {}

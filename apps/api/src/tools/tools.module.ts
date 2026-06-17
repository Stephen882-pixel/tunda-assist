import { Module } from '@nestjs/common';
import { CommissionToolsModule } from './commission/commission.module';
import { SalesToolsModule } from './sales/sales.module';
import { ProductToolsModule } from './product/product.module';
import { SupportToolsModule } from './support/support.module';
import { ToolsService } from './tools.service';

@Module({
  imports: [
    CommissionToolsModule,
    SalesToolsModule,
    ProductToolsModule,
    SupportToolsModule,
  ],
  providers: [ToolsService],
  exports: [ToolsService, CommissionToolsModule],
})
export class ToolsModule {}

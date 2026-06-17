import { Module } from '@nestjs/common';
import { AboutTool } from './about.tool';
import { FarmRoiTool } from './farm-roi.tool';
import { PricingTool } from './pricing.tool';
import { ProductsTool } from './products.tool';

@Module({
  providers: [AboutTool, FarmRoiTool, PricingTool, ProductsTool],
  exports: [AboutTool, FarmRoiTool, PricingTool, ProductsTool],
})
export class ProductToolsModule {}

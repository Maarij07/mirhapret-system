import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion, PromoCode, PromoCodeUsage } from '../../entities';
import { PromotionsService } from './promotions.service';
import { PromotionsController, PromoCodesController } from './promotions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, PromoCode, PromoCodeUsage]),
  ],
  controllers: [PromotionsController, PromoCodesController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}

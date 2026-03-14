import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { CreatePromotionDto, UpdatePromotionDto, CreatePromoCodeDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('promotions')
export class PromotionsController {
  constructor(private promotionsService: PromotionsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  async getAllPromotions() {
    const promotions = await this.promotionsService.getAllPromotions();
    return {
      message: 'All promotions retrieved successfully',
      data: promotions,
    };
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  async getActivePromotions() {
    const promotions = await this.promotionsService.getActivePromotions();
    return {
      message: 'Active promotions retrieved successfully',
      data: promotions,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async createPromotion(@Body() createPromotionDto: CreatePromotionDto, @CurrentUser() user: any) {
    const promotion = await this.promotionsService.createPromotion(createPromotionDto, user.id);
    return {
      message: 'Promotion created successfully',
      data: promotion,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  async updatePromotion(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    const promotion = await this.promotionsService.updatePromotion(id, updatePromotionDto);
    return {
      message: 'Promotion updated successfully',
      data: promotion,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async deletePromotion(@Param('id') id: string) {
    await this.promotionsService.deletePromotion(id);
    return {
      message: 'Promotion deleted successfully',
    };
  }
}

@Controller('promo-codes')
export class PromoCodesController {
  constructor(private promotionsService: PromotionsService) {}

  @Get(':code/validate')
  @UseGuards(JwtAuthGuard)
  async validatePromoCode(@Param('code') code: string, @CurrentUser() user: any) {
    const promoCode = await this.promotionsService.validatePromoCode(code);

    // Check per-user limit
    const isValid = await this.promotionsService.validateUserPromoCodeLimit(
      user.id,
      promoCode.id,
    );

    if (!isValid) {
      return {
        message: 'Promo code usage limit reached for this user',
        data: null,
        valid: false,
      };
    }

    return {
      message: 'Promo code is valid',
      data: promoCode,
      valid: true,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async createPromoCode(@Body() createPromoCodeDto: CreatePromoCodeDto, @CurrentUser() user: any) {
    const promoCode = await this.promotionsService.createPromoCode(createPromoCodeDto, user.id);
    return {
      message: 'Promo code created successfully',
      data: promoCode,
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  async updatePromoCode(
    @Param('id') id: string,
    @Body() updateData: Partial<CreatePromoCodeDto>,
  ) {
    const promoCode = await this.promotionsService.updatePromoCode(id, updateData);
    return {
      message: 'Promo code updated successfully',
      data: promoCode,
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async deletePromoCode(@Param('id') id: string) {
    await this.promotionsService.deletePromoCode(id);
    return {
      message: 'Promo code deleted successfully',
    };
  }
}

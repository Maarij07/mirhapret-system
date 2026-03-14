import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Promotion, PromoCode, PromoCodeUsage } from '../../entities';
import { CreatePromotionDto, UpdatePromotionDto, CreatePromoCodeDto } from './dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
    @InjectRepository(PromoCode)
    private promoCodesRepository: Repository<PromoCode>,
    @InjectRepository(PromoCodeUsage)
    private usageRepository: Repository<PromoCodeUsage>,
  ) {}

  // ─── PROMOTIONS ──────────────────────────────────────────────────────────────

  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionsRepository.find({
      where: {
        is_active: true,
        start_date: LessThanOrEqual(now),
        end_date: MoreThanOrEqual(now),
      },
      order: { created_at: 'DESC' },
    });
  }

  async getAllPromotions(): Promise<Promotion[]> {
    return this.promotionsRepository.find({ order: { created_at: 'DESC' } });
  }

  async getPromotionsByScope(scope: string): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      where: { promotion_scope: scope as any, is_active: true },
    });
  }

  async findPromotionById(id: string): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({ where: { id } });
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    return promotion;
  }

  async createPromotion(createPromotionDto: CreatePromotionDto, createdById: string): Promise<Promotion> {
    if (new Date(createPromotionDto.start_date) >= new Date(createPromotionDto.end_date)) {
      throw new BadRequestException('Start date must be before end date');
    }
    if (createPromotionDto.promotion_scope === 'category' && !createPromotionDto.category_id) {
      throw new BadRequestException('Category ID is required for category promotions');
    }
    if (createPromotionDto.promotion_scope === 'product' && !createPromotionDto.product_id) {
      throw new BadRequestException('Product ID is required for product promotions');
    }

    const promotion = this.promotionsRepository.create({
      ...createPromotionDto,
      promotion_scope: createPromotionDto.promotion_scope as any,
      discount_type: createPromotionDto.discount_type as any,
      is_active: createPromotionDto.is_active ?? true,
      requires_login: createPromotionDto.requires_login ?? false,
      created_by_id: createdById as any,
    });

    return this.promotionsRepository.save(promotion);
  }

  async updatePromotion(id: string, updatePromotionDto: UpdatePromotionDto): Promise<Promotion> {
    await this.findPromotionById(id);

    if (updatePromotionDto.start_date && updatePromotionDto.end_date) {
      if (new Date(updatePromotionDto.start_date) >= new Date(updatePromotionDto.end_date)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    await this.promotionsRepository.update(id, updatePromotionDto as any);
    return this.findPromotionById(id);
  }

  async deletePromotion(id: string): Promise<void> {
    await this.findPromotionById(id);
    await this.promotionsRepository.delete(id);
  }

  // ─── PROMO CODES ─────────────────────────────────────────────────────────────

  async validatePromoCode(code: string): Promise<PromoCode> {
    const now = new Date();

    const promoCode = await this.promoCodesRepository.findOne({
      where: {
        code: code.toUpperCase(),
        is_active: true,
      },
    });

    if (!promoCode) {
      throw new NotFoundException('Promo code not found or inactive');
    }

    if (now < promoCode.start_date || now > promoCode.end_date) {
      throw new BadRequestException('Promo code is expired or not yet valid');
    }

    if (promoCode.usage_limit && promoCode.usage_count >= promoCode.usage_limit) {
      throw new BadRequestException('Promo code usage limit reached');
    }

    return promoCode;
  }

  async getPromoCodeByCode(code: string): Promise<PromoCode> {
    const promoCode = await this.promoCodesRepository.findOne({
      where: { code: code.toUpperCase() },
    });
    if (!promoCode) {
      throw new NotFoundException('Promo code not found');
    }
    return promoCode;
  }

  async findPromoCodeById(id: string): Promise<PromoCode> {
    const promoCode = await this.promoCodesRepository.findOne({ where: { id } });
    if (!promoCode) {
      throw new NotFoundException(`Promo code with ID ${id} not found`);
    }
    return promoCode;
  }

  async createPromoCode(createPromoCodeDto: CreatePromoCodeDto, createdById: string): Promise<PromoCode> {
    if (new Date(createPromoCodeDto.start_date) >= new Date(createPromoCodeDto.end_date)) {
      throw new BadRequestException('Start date must be before end date');
    }

    const existing = await this.promoCodesRepository.findOne({
      where: { code: createPromoCodeDto.code.toUpperCase() },
    });
    if (existing) {
      throw new BadRequestException('Promo code already exists');
    }

    const promoCode = this.promoCodesRepository.create({
      ...createPromoCodeDto,
      code: createPromoCodeDto.code.toUpperCase(),
      discount_type: createPromoCodeDto.discount_type as any,
      applicable_categories: createPromoCodeDto.applicable_categories || [],
      is_active: createPromoCodeDto.is_active ?? true,
      requires_login: createPromoCodeDto.requires_login ?? false,
      usage_count: 0,
      created_by_id: createdById as any,
    });

    return this.promoCodesRepository.save(promoCode);
  }

  async updatePromoCode(id: string, updateData: Partial<CreatePromoCodeDto>): Promise<PromoCode> {
    await this.findPromoCodeById(id);

    if (updateData.start_date && updateData.end_date) {
      if (new Date(updateData.start_date) >= new Date(updateData.end_date)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    await this.promoCodesRepository.update(id, updateData as any);
    return this.findPromoCodeById(id);
  }

  async deletePromoCode(id: string): Promise<void> {
    await this.findPromoCodeById(id);
    await this.promoCodesRepository.delete(id);
  }

  // ─── PROMO CODE USAGE ────────────────────────────────────────────────────────

  async trackPromoCodeUsage(
    promoCodeId: string,
    orderId: string,
    discountAmount: number,
    userId?: string,
  ): Promise<PromoCodeUsage> {
    const usage = this.usageRepository.create({
      promo_code_id: promoCodeId as any,
      order_id: orderId as any,
      discount_amount: discountAmount,
      user_id: userId as any,
    });

    await this.usageRepository.save(usage);
    await this.promoCodesRepository.increment({ id: promoCodeId }, 'usage_count', 1);

    return usage;
  }

  async getUserPromoCodeUsageCount(userId: string, promoCodeId: string): Promise<number> {
    return this.usageRepository.count({
      where: {
        user_id: userId as any,
        promo_code_id: promoCodeId as any,
      },
    });
  }

  async validateUserPromoCodeLimit(userId: string, promoCodeId: string): Promise<boolean> {
    const promoCode = await this.findPromoCodeById(promoCodeId);
    if (!promoCode.per_user_limit) return true;
    const usageCount = await this.getUserPromoCodeUsageCount(userId, promoCodeId);
    return usageCount < promoCode.per_user_limit;
  }
}

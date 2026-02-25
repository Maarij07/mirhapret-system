import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsBoolean,
  IsDate,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePromotionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['percentage', 'fixed', 'bogo'])
  @IsOptional()
  discount_type?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_value?: number;

  @IsEnum(['category', 'product', 'store', 'global'])
  @IsOptional()
  promotion_scope?: string;

  @IsUUID()
  @IsOptional()
  category_id?: string;

  @IsUUID()
  @IsOptional()
  product_id?: string;

  @IsUUID()
  @IsOptional()
  store_id?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @IsBoolean()
  @IsOptional()
  requires_login?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_purchase_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  usage_limit?: number;
}

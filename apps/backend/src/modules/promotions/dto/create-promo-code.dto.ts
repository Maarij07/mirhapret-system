import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDate,
  IsIn,
  IsArray,
  Min,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromoCodeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['percentage', 'fixed'])
  discount_type: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  discount_value: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  min_purchase_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  max_discount_amount?: number;

  @IsArray()
  @IsOptional()
  applicable_categories?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  usage_limit?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  per_user_limit?: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  end_date: Date;

  @IsBoolean()
  @IsOptional()
  requires_login?: boolean;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}

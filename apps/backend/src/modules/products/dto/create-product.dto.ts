import {
  IsString,
  IsNumber,
  IsUUID,
  IsOptional,
  IsArray,
  Min,
  MinLength,
  MaxLength,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(300)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost_price?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_rate?: number;

  @IsString()
  @IsOptional()
  main_image?: string;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  @IsOptional()
  available_sizes?: string[];

  @IsString()
  @IsOptional()
  size_guide_html?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsBoolean()
  @IsOptional()
  is_featured?: boolean;

  @IsString()
  @IsOptional()
  barcode?: string;
}

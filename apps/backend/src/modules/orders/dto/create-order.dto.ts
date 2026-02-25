import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEmail,
  IsObject,
  ValidateNested,
  Min,
  MinLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @IsString()
  @IsOptional()
  product_name?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsString()
  @IsOptional()
  product_size?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  total?: number;
}

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  street_address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  province: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  postal_code: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateOrderDto {
  @IsEmail()
  @IsNotEmpty()
  customer_email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  customer_phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  customer_first_name: string;

  @IsString()
  @MinLength(2)
  @IsOptional()
  customer_last_name?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsObject()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  shipping_address: AddressDto;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  billing_address?: AddressDto;

  @IsNumber()
  @Min(0)
  @IsOptional()
  tax_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  shipping_amount?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount_amount?: number;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  customer_id?: string;
}

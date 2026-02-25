import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class AnalyticsFilterDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  start_date?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  end_date?: Date;

  @IsString()
  @IsOptional()
  category_id?: string;

  @IsString()
  @IsOptional()
  product_id?: string;

  @IsString()
  @IsOptional()
  store_id?: string;
}

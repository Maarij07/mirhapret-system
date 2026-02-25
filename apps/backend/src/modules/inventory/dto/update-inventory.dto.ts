import { IsNumber, Min, IsOptional } from 'class-validator';

export class UpdateInventoryDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reserved_quantity?: number;
}

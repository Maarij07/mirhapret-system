import { IsOptional, IsArray, IsString, IsObject } from 'class-validator';

export class UpdateImageDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  context?: Record<string, any>;
}

import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class TrackProductDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  session_id?: string;

  @IsString()
  @IsOptional()
  ip_address?: string;

  @IsString()
  @IsOptional()
  user_agent?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration_seconds?: number;
}

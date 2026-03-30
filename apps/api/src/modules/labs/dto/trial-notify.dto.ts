import { IsEnum, IsOptional, IsString } from 'class-validator';

export class TrialNotifyDto {
  @IsEnum(['whatsapp', 'email', 'both'])
  channel!: 'whatsapp' | 'email' | 'both';

  @IsOptional()
  @IsString()
  message?: string;
}

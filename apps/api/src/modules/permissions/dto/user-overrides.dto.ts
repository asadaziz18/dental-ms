import { IsObject } from 'class-validator';
import type { ScreenKey } from '@dental-ms/shared-types';

export class SetUserOverridesDto {
  @IsObject()
  overrides!: Partial<Record<ScreenKey, boolean>>;
}

import { IsArray, IsIn, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SyncOperationDto {
  @IsString()
  entity!: string;

  @IsIn(['create', 'update', 'delete'])
  operation!: 'create' | 'update' | 'delete';

  @IsObject()
  payload!: Record<string, unknown>;

  /** Client-side temp id; server returns serverId for creates so client can replace in Dexie */
  @IsOptional()
  @IsString()
  clientId?: string;
}

export class PushSyncDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncOperationDto)
  operations!: SyncOperationDto[];
}

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  MaxLength,
  IsEmail,
} from 'class-validator';

export class CreateLabVendorDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(255)
  contactPerson!: string;

  @IsString()
  @MaxLength(50)
  phone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  whatsapp?: string | null;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string | null;

  @IsOptional()
  @IsString()
  address?: string | null;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsArray()
  @IsString({ each: true })
  specializations!: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

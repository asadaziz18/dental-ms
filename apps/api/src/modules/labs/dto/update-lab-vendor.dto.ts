import { PartialType } from '@nestjs/mapped-types';
import { CreateLabVendorDto } from './create-lab-vendor.dto';

export class UpdateLabVendorDto extends PartialType(CreateLabVendorDto) {}

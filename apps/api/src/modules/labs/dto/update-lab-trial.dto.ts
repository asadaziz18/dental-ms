import { PartialType } from '@nestjs/mapped-types';
import { CreateLabTrialDto } from './create-lab-trial.dto';

export class UpdateLabTrialDto extends PartialType(CreateLabTrialDto) {}

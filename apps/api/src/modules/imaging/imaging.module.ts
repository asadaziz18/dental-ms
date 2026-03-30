import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Imaging } from '../../database/entities/imaging.entity';
import { Patient } from '../../database/entities/patient.entity';
import { S3StorageService } from './storage/s3-storage.service';
import { LocalStorageService } from './storage/local-storage.service';
import { STORAGE_SERVICE } from './storage/storage.interface';
import type { IStorageService } from './storage/storage.interface';
import { ImagingService } from './imaging.service';
import { ImagingController } from './imaging.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Imaging, Patient]),
  ],
  controllers: [ImagingController],
  providers: [
    {
      provide: STORAGE_SERVICE,
      useFactory: (config: ConfigService): IStorageService => {
        const driver = config.get('STORAGE_DRIVER', 's3');
        if (driver === 'local') {
          return new LocalStorageService(config);
        }
        return new S3StorageService(config);
      },
      inject: [ConfigService],
    },
    ImagingService,
  ],
  exports: [ImagingService, STORAGE_SERVICE],
})
export class ImagingModule {}

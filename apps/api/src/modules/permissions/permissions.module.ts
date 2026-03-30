import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleScreenPermission } from '../../database/entities/role-screen-permission.entity';
import { UserScreenOverride } from '../../database/entities/user-screen-override.entity';
import { User } from '../../database/entities/user.entity';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleScreenPermission, UserScreenOverride, User]),
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}

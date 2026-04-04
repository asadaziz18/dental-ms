import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { PlatformSettingsService } from './platform-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateBookingSlipFooterDto } from './dto/update-booking-slip-footer.dto';

@Controller('platform-settings')
@UseGuards(JwtAuthGuard)
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  /** Footer for slips, receipts, reports PDFs, and user manual. Readable by any signed-in user. */
  @Get('booking-slip')
  getBookingSlipSettings() {
    return this.platformSettingsService.getBookingSlipSettings();
  }

  @Put('booking-slip')
  @UseGuards(RolesGuard)
  @Roles('SuperAdmin')
  async updateBookingSlipFooter(@Body() dto: UpdateBookingSlipFooterDto) {
    if (dto.productOwnerFooter !== undefined) {
      await this.platformSettingsService.setBookingSlipProductOwnerFooter(
        dto.productOwnerFooter,
      );
    }
    return this.platformSettingsService.getBookingSlipSettings();
  }
}

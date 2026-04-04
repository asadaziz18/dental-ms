import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformSetting } from '../../database/entities/platform-setting.entity';
import { PLATFORM_SETTING_BOOKING_SLIP_FOOTER } from './platform-settings.constants';

@Injectable()
export class PlatformSettingsService {
  constructor(
    @InjectRepository(PlatformSetting)
    private readonly repo: Repository<PlatformSetting>,
  ) {}

  async getBookingSlipSettings(): Promise<{ productOwnerFooter: string | null }> {
    const row = await this.repo.findOne({
      where: { key: PLATFORM_SETTING_BOOKING_SLIP_FOOTER },
    });
    const v = row?.value?.trim();
    return { productOwnerFooter: v ? v : null };
  }

  async setBookingSlipProductOwnerFooter(footer: string | null): Promise<void> {
    const normalized =
      footer == null || typeof footer !== 'string'
        ? null
        : footer.trim() === ''
          ? null
          : footer.trim();
    let row = await this.repo.findOne({
      where: { key: PLATFORM_SETTING_BOOKING_SLIP_FOOTER },
    });
    if (!row) {
      row = this.repo.create({
        key: PLATFORM_SETTING_BOOKING_SLIP_FOOTER,
        value: normalized,
      });
    } else {
      row.value = normalized;
    }
    await this.repo.save(row);
  }
}

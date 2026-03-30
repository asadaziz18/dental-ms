import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, In } from 'typeorm';
import { SubscriptionInvoice } from '../../database/entities/subscription-invoice.entity';
import { BranchSubscription } from '../../database/entities/branch-subscription.entity';
import { Branch } from '../../database/entities/branch.entity';
import { SubscriptionPlan } from '../../database/entities/subscription-plan.entity';

@Injectable()
export class SubscriptionInvoicesService {
  constructor(
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
    @InjectRepository(BranchSubscription)
    private readonly subRepo: Repository<BranchSubscription>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async listByBranch(branchId: string) {
    return this.invoiceRepo.find({
      where: { branchId },
      relations: ['plan'],
      order: { dueDate: 'DESC' },
    });
  }

  async listAll() {
    return this.invoiceRepo.find({
      relations: ['plan', 'branch'],
      order: { dueDate: 'DESC' },
    });
  }

  async markAsPaid(id: string) {
    const inv = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['plan'],
    });
    if (!inv) throw new NotFoundException('Invoice not found');
    inv.status = 'paid';
    inv.paidAt = new Date();
    await this.invoiceRepo.save(inv);

    const sub = await this.subRepo.findOne({ where: { branchId: inv.branchId } });
    if (sub && (sub.status === 'past_due' || sub.status === 'grace')) {
      sub.status = 'active';
      await this.subRepo.save(sub);
    }
    return inv;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const prefix = 'INV-' + new Date().getFullYear() + '-';
    const last = await this.invoiceRepo
      .createQueryBuilder('i')
      .where('i.invoiceNumber LIKE :prefix', { prefix: prefix + '%' })
      .orderBy('i.invoiceNumber', 'DESC')
      .getOne();
    const nextNum = last
      ? parseInt(last.invoiceNumber.replace(prefix, ''), 10) + 1
      : 1;
    return prefix + String(nextNum).padStart(5, '0');
  }

  async issueInvoicesForPeriod() {
    const now = new Date();
    const subs = await this.subRepo.find({
      where: { status: In(['active', 'trialing'] as const) },
      relations: ['plan'],
    });
    const created: SubscriptionInvoice[] = [];
    for (const sub of subs) {
      const periodEnd = new Date(sub.currentPeriodEnd);
      if (periodEnd > now) continue;
      const nextStart = new Date(periodEnd);
      const nextEnd = new Date(nextStart);
      nextEnd.setMonth(nextEnd.getMonth() + 1);
      const amount = sub.plan.billingInterval === 'year' ? sub.plan.priceYearly : sub.plan.priceMonthly;
      const dueDate = new Date(nextStart);
      dueDate.setDate(dueDate.getDate() + 14);
      const invoiceNumber = await this.getNextInvoiceNumber();
      const inv = this.invoiceRepo.create({
        branchId: sub.branchId,
        planId: sub.planId,
        invoiceNumber,
        amount,
        status: 'sent',
        dueDate,
        periodStart: nextStart,
        periodEnd: nextEnd,
      });
      await this.invoiceRepo.save(inv);
      sub.currentPeriodStart = nextStart;
      sub.currentPeriodEnd = nextEnd;
      await this.subRepo.save(sub);
      created.push(inv);
    }
    return created;
  }

  async moveOverdueToGrace() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unpaid = await this.invoiceRepo.find({
      where: { status: 'sent', dueDate: LessThanOrEqual(today) },
    });
    const branchIds = [...new Set(unpaid.map((i) => i.branchId))];
    await this.subRepo.update(
      { branchId: In(branchIds), status: 'active' as const },
      { status: 'grace' },
    );
    return branchIds.length;
  }

  async suspendAfterGrace(graceDays: number = 7) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - graceDays);
    const subs = await this.subRepo.find({
      where: { status: 'grace' },
    });
    let suspended = 0;
    for (const sub of subs) {
      const unpaid = await this.invoiceRepo.findOne({
        where: { branchId: sub.branchId, status: 'sent' },
      });
      if (unpaid && new Date(unpaid.dueDate) <= cutoff) {
        sub.status = 'suspended';
        await this.subRepo.save(sub);
        suspended++;
      }
    }
    return suspended;
  }
}

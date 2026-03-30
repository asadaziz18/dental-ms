import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { SubscriptionPlan } from '../entities/subscription-plan.entity';
import { Tenant } from '../entities/tenant.entity';
import { Branch } from '../entities/branch.entity';
import { BranchSubscription } from '../entities/branch-subscription.entity';
import { User } from '../entities/user.entity';
import { Patient } from '../entities/patient.entity';
import { Procedure } from '../entities/procedure.entity';
import { LabVendor } from '../entities/lab-vendor.entity';
import { LabOrder } from '../entities/lab-order.entity';
import { LabTrial } from '../entities/lab-trial.entity';
import type { PlanFeatures } from '../entities/subscription-plan.entity';

const SALT_ROUNDS = 10;

const PLANS = [
  {
    name: 'Starter',
    slug: 'starter',
    description: 'For single-branch clinics',
    priceMonthly: '5000',
    priceYearly: '50000',
    features: {
      maxBranches: 1,
      maxUsers: 5,
      maxPatients: 500,
      storageGb: 2,
      imaging: true,
      reports: true,
      inventory: true,
    } as PlanFeatures,
  },
  {
    name: 'Growth',
    slug: 'growth',
    description: 'For growing multi-branch practices',
    priceMonthly: '15000',
    priceYearly: '150000',
    features: {
      maxBranches: 5,
      maxUsers: 25,
      maxPatients: 5000,
      storageGb: 20,
      imaging: true,
      reports: true,
      inventory: true,
    } as PlanFeatures,
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Custom limits and pricing',
    priceMonthly: '0',
    priceYearly: '0',
    features: {
      maxBranches: -1,
      maxUsers: -1,
      maxPatients: -1,
      storageGb: -1,
      imaging: true,
      reports: true,
      inventory: true,
    } as PlanFeatures,
  },
];

const TENANT = { name: 'City Smile Dental', slug: 'city-smile' };

const BRANCH_MAIN = {
  name: 'Main Branch',
  code: 'KHI-01',
  address: '123 Dental Street, Karachi',
  city: 'Karachi',
  phone: '+92-300-1234567',
  email: null as string | null,
  openingTime: '09:00',
  closingTime: '18:00',
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const SUB_BRANCHES = [
  {
    name: 'North Campus Clinic',
    code: 'KHI-02',
    city: 'Karachi',
    address: 'North Campus, Karachi',
    phone: '+92-300-1234568',
    openingTime: '10:00',
    closingTime: '19:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  {
    name: 'Defence Branch',
    code: 'KHI-03',
    city: 'Karachi',
    address: 'Defence Area, Karachi',
    phone: '+92-300-1234569',
    openingTime: '09:00',
    closingTime: '17:00',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
];

const PROCEDURES = [
  { code: 'D0120', name: 'Periodic Oral Evaluation', defaultFee: '500' },
  { code: 'D0210', name: 'Full Mouth X-Ray', defaultFee: '1500' },
  { code: 'D1110', name: 'Adult Teeth Cleaning', defaultFee: '2000' },
  { code: 'D2140', name: 'Amalgam Filling (1 surface)', defaultFee: '3000' },
  { code: 'D2740', name: 'Porcelain Crown', defaultFee: '15000' },
  { code: 'D3310', name: 'Root Canal (anterior)', defaultFee: '12000' },
  { code: 'D3330', name: 'Root Canal (molar)', defaultFee: '18000' },
  { code: 'D4341', name: 'Scaling & Root Planing', defaultFee: '5000' },
  { code: 'D7140', name: 'Simple Extraction', defaultFee: '4000' },
  { code: 'D8080', name: 'Orthodontic Treatment (monthly)', defaultFee: '8000' },
];

async function runSeed() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();

  try {
    const planRepo = qr.manager.getRepository(SubscriptionPlan);
    const tenantRepo = qr.manager.getRepository(Tenant);
    const branchRepo = qr.manager.getRepository(Branch);
    const subRepo = qr.manager.getRepository(BranchSubscription);
    const userRepo = qr.manager.getRepository(User);
    const patientRepo = qr.manager.getRepository(Patient);
    const procedureRepo = qr.manager.getRepository(Procedure);

    // —— 1. Plans ——
    for (const p of PLANS) {
      const existing = await planRepo.findOne({ where: { slug: p.slug } });
      if (existing) {
        console.log(`⏭️ Plan: ${p.name}`);
        continue;
      }
      await planRepo.insert({
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceYearly: p.priceYearly,
        billingInterval: 'month',
        features: p.features as any,
        isActive: true,
      });
      console.log(`✅ Plan: ${p.name}`);
    }

    // —— 2. Tenant ——
    let tenant = await tenantRepo.findOne({ where: { slug: TENANT.slug } });
    if (!tenant) {
      await tenantRepo.insert({ name: TENANT.name, slug: TENANT.slug });
      tenant = await tenantRepo.findOne({ where: { slug: TENANT.slug } }) ?? null;
      if (tenant) console.log(`✅ Tenant: ${tenant.name}`);
    } else {
      console.log(`⏭️ Tenant: ${TENANT.name}`);
    }
    if (!tenant) throw new Error('Failed to get or create tenant');
    const tenantId = tenant.id;

    // —— 3. Main Branch ——
    let branch = await branchRepo.findOne({ where: { code: BRANCH_MAIN.code, tenantId } });
    if (!branch) {
      await branchRepo.insert({
        tenantId,
        parentBranchId: null,
        name: BRANCH_MAIN.name,
        code: BRANCH_MAIN.code,
        address: BRANCH_MAIN.address,
        city: BRANCH_MAIN.city,
        phone: BRANCH_MAIN.phone,
        email: BRANCH_MAIN.email,
        isActive: true,
        openingTime: BRANCH_MAIN.openingTime,
        closingTime: BRANCH_MAIN.closingTime,
        workingDays: BRANCH_MAIN.workingDays,
      });
      branch = await branchRepo.findOne({ where: { code: BRANCH_MAIN.code, tenantId } }) ?? null;
      if (branch) console.log(`✅ Branch: ${branch.name}`);
    } else {
      console.log(`⏭️ Branch: ${BRANCH_MAIN.name}`);
    }
    if (!branch) throw new Error('Failed to get or create branch');
    const branchId = branch.id;

    // —— 4. Sub-branches ——
    for (const sub of SUB_BRANCHES) {
      const existingSubBranch = await branchRepo.findOne({
        where: { tenantId, code: sub.code },
      });
      if (existingSubBranch) {
        console.log(`⏭️ Sub-branch: ${sub.name}`);
        continue;
      }
      await branchRepo.insert({
        tenantId,
        parentBranchId: branchId,
        name: sub.name,
        code: sub.code,
        address: sub.address,
        city: sub.city,
        phone: sub.phone,
        email: null,
        isActive: true,
        openingTime: sub.openingTime,
        closingTime: sub.closingTime,
        workingDays: sub.workingDays,
      });
      console.log(`✅ Sub-branch: ${sub.name}`);
    }

    // —— 5. Subscription (Growth plan, active) ——
    const growthPlan = await planRepo.findOne({ where: { slug: 'growth' } });
    if (!growthPlan) throw new Error('Growth plan not found');

    const existingSub = await subRepo.findOne({ where: { branchId } });
    const periodStart = new Date();
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + 30);

    if (!existingSub) {
      await subRepo.insert({
        branchId,
        planId: growthPlan.id,
        status: 'active',
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      });
      console.log(`✅ BranchSubscription: City Smile Dental (Growth, active)`);
    } else {
      console.log(`⏭️ BranchSubscription: already exists for branch`);
    }

    // —— 6. Users ——
    const usersToSeed = [
      {
        email: 'superadmin@dentalms.com',
        password: 'Admin@1234',
        fullName: 'Super Admin',
        role: 'SuperAdmin' as const,
        branchId: null as string | null,
      },
      {
        email: 'branchadmin@citysmile.com',
        password: 'Admin@1234',
        fullName: 'Branch Admin',
        role: 'BranchAdmin' as const,
        branchId,
      },
      {
        email: 'dr.ahmed@citysmile.com',
        password: 'Doctor@1234',
        fullName: 'Dr. Ahmed Raza',
        role: 'Doctor' as const,
        branchId,
      },
      {
        email: 'dr.sara@citysmile.com',
        password: 'Doctor@1234',
        fullName: 'Dr. Sara Khan',
        role: 'Doctor' as const,
        branchId,
      },
      {
        email: 'receptionist@citysmile.com',
        password: 'Staff@1234',
        fullName: 'Fatima Malik',
        role: 'Receptionist' as const,
        branchId,
      },
      {
        email: 'nurse@citysmile.com',
        password: 'Staff@1234',
        fullName: 'Ayesha Noor',
        role: 'Nurse' as const,
        branchId,
      },
    ];

    for (const u of usersToSeed) {
      const existing = await userRepo.findOne({ where: { email: u.email } });
      if (existing) {
        console.log(`⏭️ User: ${u.email}`);
        continue;
      }
      const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);
      await userRepo.insert({
        email: u.email,
        passwordHash,
        fullName: u.fullName,
        role: u.role,
        branchId: u.branchId,
        isActive: true,
      });
      console.log(`✅ User: ${u.email}`);
    }

    // —— 7. Patients ——
    const patientsToSeed = [
      { firstName: 'Ali', lastName: 'Hassan', email: 'ali@gmail.com', dateOfBirth: '1990-05-10', medicalHistory: 'Blood group: O+' },
      { firstName: 'Zara', lastName: 'Ahmed', email: 'zara@gmail.com', dateOfBirth: '1985-03-22', medicalHistory: 'Blood group: A+' },
      { firstName: 'Usman', lastName: 'Tariq', email: 'usman@gmail.com', dateOfBirth: '1995-11-15', medicalHistory: 'Blood group: B+' },
    ];

    for (const p of patientsToSeed) {
      const existing = await patientRepo.findOne({
        where: { branchId, email: p.email },
      });
      if (existing) {
        console.log(`⏭️ Patient: ${p.firstName} ${p.lastName}`);
        continue;
      }
      await patientRepo.insert({
        branchId,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        dateOfBirth: p.dateOfBirth,
        medicalHistory: p.medicalHistory,
      });
      console.log(`✅ Patient: ${p.firstName} ${p.lastName}`);
    }

    // —— 8. Procedure catalog ——
    for (const proc of PROCEDURES) {
      const existing = await procedureRepo.findOne({ where: { code: proc.code } });
      if (existing) {
        console.log(`⏭️ Procedure: ${proc.code}`);
        continue;
      }
      await procedureRepo.insert({
        code: proc.code,
        name: proc.name,
        defaultFee: proc.defaultFee,
      });
      console.log(`✅ Procedure: ${proc.code} — ${proc.name}`);
    }

    // —— 9. Lab vendors ——
    const labVendorRepo = qr.manager.getRepository(LabVendor);
    const labVendorsToSeed = [
      {
        name: 'Crown Masters Lab',
        contactPerson: 'Imran Sheikh',
        phone: '+92-321-1234567',
        whatsapp: '+92-321-1234567',
        email: 'info@crownmasters.com',
        city: 'Karachi',
        specializations: ['crown_bridge', 'veneer_laminate', 'implant'],
        isActive: true,
      },
      {
        name: 'DentoPro Orthodontics Lab',
        contactPerson: 'Sana Mirza',
        phone: '+92-333-9876543',
        whatsapp: '+92-333-9876543',
        email: 'orders@dentopro.com',
        city: 'Karachi',
        specializations: ['orthodontic', 'denture'],
        isActive: true,
      },
    ];
    let vendor1: LabVendor | null = null;
    for (const v of labVendorsToSeed) {
      const existing = await labVendorRepo.findOne({ where: { name: v.name, tenantId } });
      if (existing) {
        console.log(`⏭️ Lab vendor: ${v.name}`);
        if (v.name === 'Crown Masters Lab') vendor1 = existing;
        continue;
      }
      const inserted = await labVendorRepo.save(
        labVendorRepo.create({
          tenantId,
          name: v.name,
          contactPerson: v.contactPerson,
          phone: v.phone,
          whatsapp: v.whatsapp,
          email: v.email,
          city: v.city,
          specializations: v.specializations,
          isActive: v.isActive,
        }),
      );
      console.log(`✅ Lab vendor: ${v.name}`);
      if (v.name === 'Crown Masters Lab') vendor1 = inserted;
    }

    // —— 10. Lab order (sample) ——
    const labOrderRepo = qr.manager.getRepository(LabOrder);
    const labTrialRepo = qr.manager.getRepository(LabTrial);
    const aliPatient = await patientRepo.findOne({ where: { branchId, email: 'ali@gmail.com' } });
    const drAhmed = await userRepo.findOne({ where: { email: 'dr.ahmed@citysmile.com' } });
    if (aliPatient && drAhmed && vendor1) {
      const existingOrder = await labOrderRepo.findOne({
        where: { patientId: aliPatient.id, vendorId: vendor1.id },
      });
      if (!existingOrder) {
        const sentToLabAt = new Date();
        sentToLabAt.setDate(sentToLabAt.getDate() - 10);
        const expectedTrialDate = new Date();
        expectedTrialDate.setDate(expectedTrialDate.getDate() + 2);
        const year = new Date().getFullYear();
        const count = await labOrderRepo.count({ where: { tenantId } });
        const orderNumber = `LAB-${year}-${String(count + 1).padStart(4, '0')}`;
        const labOrder = await labOrderRepo.save(
          labOrderRepo.create({
            tenantId,
            branchId,
            patientId: aliPatient.id,
            doctorId: drAhmed.id,
            vendorId: vendor1.id,
            treatmentId: null,
            orderNumber,
            workType: 'crown_bridge',
            toothNumbers: ['16'],
            shade: 'A2',
            material: 'Zirconia',
            status: 'trial_in_progress',
            priority: 'normal',
            sentToLabAt,
            expectedTrialDate,
            finalDeliveryDate: null,
            labFee: '12000',
            isPaid: false,
            paidAt: null,
            attachments: [],
            createdBy: drAhmed.id,
          }),
        );
        console.log(`✅ Lab order: ${labOrder.orderNumber}`);

        const trialDate = new Date();
        trialDate.setDate(trialDate.getDate() - 3);
        await labTrialRepo.save(
          labTrialRepo.create({
            labOrderId: labOrder.id,
            trialNumber: 1,
            trialDate,
            status: 'completed',
            outcome: 'adjustments_needed',
            doctorNotes: 'Shade slightly off, adjust to A2 warmer tone',
            labInstructions: 'Please adjust shade to warmer A2, recheck occlusion',
            completedAt: trialDate,
            completedBy: drAhmed.id,
            attachments: [],
            patientNotified: true,
            patientNotifiedAt: trialDate,
            patientNotificationChannel: 'both',
          }),
        );
        console.log(`✅ Lab trial: #1 for order ${labOrder.orderNumber}`);
      } else {
        console.log(`⏭️ Lab order: already exists for Ali Hassan / Crown Masters`);
      }
    } else {
      console.log(`⏭️ Lab order: skip (patient/doctor/vendor not found)`);
    }

    await qr.commitTransaction();
    console.log('\n✅ Seed completed successfully.');
  } catch (e) {
    await qr.rollbackTransaction();
    console.error('Seed failed:', e);
    throw e;
  } finally {
    await qr.release();
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});

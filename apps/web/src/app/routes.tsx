import { Routes, Route, Navigate } from 'react-router-dom';
import { PatientListPage, PatientProfilePage, PatientNewPage } from '@/modules/patients';
import { AppointmentsCalendarPage } from '@/modules/appointments';
import { PatientTreatmentsPage, TreatmentPlanDetailPage, TreatmentsPage } from '@/modules/treatments';
import { BillingPage, PatientBillingPage, InvoiceDetailPage } from '@/modules/billing';
import { InventoryPage } from '@/modules/inventory';
import { StaffDirectoryPage, StaffDetailPage } from '@/modules/staff';
import { PatientImagingPage, ImagingGalleryPage } from '@/modules/imaging';
import { ReportsPage } from '@/modules/reports';
import {
  LabDashboardPage,
  VendorListPage,
  CreateVendorPage,
  EditVendorPage,
  VendorDetailPage,
  LabOrderListPage,
  CreateLabOrderPage,
  LabOrderDetailPage,
  EditLabOrderPage,
} from '@/modules/labs';
import { DashboardPage } from '@/modules/dashboard';
import {
  SuperAdminLayout,
  SuperAdminTenantsPage,
  SuperAdminPlansPage,
  SuperAdminInvoicesPage,
} from '@/modules/subscription/pages';
import { SettingsSubscriptionPage } from '@/modules/subscription/pages/SettingsSubscriptionPage';
import { SettingsPage } from './pages/SettingsPage';
import { RolePermissionsPage } from '@/modules/permissions';
import {
  BranchListPage,
  CreateBranchPage,
  CreateSubBranchPage,
  BranchDetailPage,
  EditBranchPage,
} from '@/modules/branches';
import { LoginPage } from '@/modules/auth';
import { AppLayout } from './AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleGuard } from './guards/RoleGuard';
import { SubscriptionGuard } from './guards/SubscriptionGuard';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/superadmin" element={<RoleGuard roles={['SuperAdmin']}><SuperAdminLayout /></RoleGuard>}>
          <Route index element={<SuperAdminTenantsPage />} />
          <Route path="plans" element={<SuperAdminPlansPage />} />
          <Route path="invoices" element={<SuperAdminInvoicesPage />} />
        </Route>
        <Route element={<SubscriptionGuard><AppLayout /></SubscriptionGuard>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientListPage />} />
        <Route path="/patients/new" element={<PatientNewPage />} />
        <Route path="/patients/:id" element={<PatientProfilePage />} />
        <Route path="/patients/:id/treatments" element={<PatientTreatmentsPage />} />
        <Route path="/patients/:patientId/treatments/:planId" element={<TreatmentPlanDetailPage />} />
        <Route path="/patients/:id/billing" element={<PatientBillingPage />} />
        <Route path="/patients/:patientId/billing/invoices/:invoiceId" element={<InvoiceDetailPage />} />
        <Route path="/appointments" element={<AppointmentsCalendarPage />} />
        <Route path="/treatments" element={<TreatmentsPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/staff" element={<StaffDirectoryPage />} />
        <Route path="/staff/:id" element={<StaffDetailPage />} />
        <Route path="/imaging" element={<ImagingGalleryPage />} />
        <Route path="/patients/:patientId/imaging" element={<PatientImagingPage />} />
        <Route path="/labs" element={<LabDashboardPage />} />
        <Route path="/labs/vendors" element={<VendorListPage />} />
        <Route path="/labs/vendors/new" element={<CreateVendorPage />} />
        <Route path="/labs/vendors/:id" element={<VendorDetailPage />} />
        <Route path="/labs/vendors/:id/edit" element={<EditVendorPage />} />
        <Route path="/labs/orders" element={<LabOrderListPage />} />
        <Route path="/labs/orders/new" element={<CreateLabOrderPage />} />
        <Route path="/labs/orders/:id" element={<LabOrderDetailPage />} />
        <Route path="/labs/orders/:id/edit" element={<EditLabOrderPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<RoleGuard roles={['SuperAdmin', 'BranchAdmin']}><SettingsPage /></RoleGuard>} />
        <Route path="/settings/role-permissions" element={<RoleGuard roles={['SuperAdmin']}><RolePermissionsPage /></RoleGuard>} />
        <Route path="/settings/branches" element={<RoleGuard roles={['SuperAdmin', 'BranchAdmin']}><BranchListPage /></RoleGuard>} />
        <Route path="/settings/branches/new" element={<RoleGuard roles={['SuperAdmin']}><CreateBranchPage /></RoleGuard>} />
        <Route path="/settings/branches/:id" element={<RoleGuard roles={['SuperAdmin', 'BranchAdmin', 'Doctor', 'Receptionist', 'Nurse']}><BranchDetailPage /></RoleGuard>} />
        <Route path="/settings/branches/:id/edit" element={<RoleGuard roles={['SuperAdmin', 'BranchAdmin']}><EditBranchPage /></RoleGuard>} />
        <Route path="/settings/branches/:id/sub/new" element={<RoleGuard roles={['SuperAdmin']}><CreateSubBranchPage /></RoleGuard>} />
        <Route path="/settings/subscription" element={<SettingsSubscriptionPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

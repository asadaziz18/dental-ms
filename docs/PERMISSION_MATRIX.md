# Permission Matrix — Dental Management System

Roles in the system: **SuperAdmin** | **BranchAdmin** | **Doctor** | **Receptionist** | **Nurse**

---

## 1. Backend API — Where roles are enforced

Controllers that use `@Roles(...)` restrict access to the listed roles. All endpoints also require **JWT + BranchGuard** (branch scoping). SuperAdmin is not restricted by branch.

| Module / Action | SuperAdmin | BranchAdmin | Doctor | Receptionist | Nurse |
|-----------------|:----------:|:-----------:|:------:|:-------------:|:-----:|
| **Branches** | | | | | |
| List branches, Get one | ✓ | ✓ | ✓ | ✓ | ✓ |
| Update branch, Update status, Get staff, Get stats | ✓ | ✓ | — | — | — |
| **Staff** | | | | | |
| List staff, Create, Update, Remove | ✓ | ✓ | — | — | — |
| **Staff commission** (no @Roles) | ✓ | ✓ | ✓* | ✓* | ✓* |
| **Staff schedule / attendance / leave** (no @Roles) | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Lab vendors** | | | | | |
| Create, Update, Update status | ✓ | ✓ | — | — | — |
| Delete vendor | ✓ | — | — | — | — |
| **Lab orders** | | | | | |
| Create order, Update order, Update status, Add attachment | ✓ | ✓ | ✓ | ✓ | — |
| Update payment | ✓ | ✓ | — | — | — |
| Create/Update trial, Notify trial | ✓ | ✓ | ✓ | ✓ | — |
| Complete trial | ✓ | ✓ | ✓ | — | — |
| **Subscription** (plans, admin, invoices) | ✓ | — | — | — | — |

\* Commission API has no @Roles; service layer may restrict by role — treat as BranchAdmin-only for setting rates.

**Modules with no `@Roles` (any authenticated user, subject to branch):**  
Patients, Appointments, Treatments, Prescriptions, Procedures, Billing (invoices/payments/insurance), Inventory, Imaging, Reports, Dashboard, Sync.

---

## 2. Frontend permission matrix (UI visibility)

The app uses `ROLE_PERMISSIONS` in `apps/web/src/modules/staff/constants.ts` to show/hide sections. This is the **intended** permission model for the UI.

| Permission | SuperAdmin | BranchAdmin | Doctor | Receptionist | Nurse |
|------------|:----------:|:-----------:|:------:|:-------------:|:-----:|
| View patients | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit patients | ✓ | ✓ | ✓ | ✓ | ✓ |
| View appointments | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit appointments | ✓ | ✓ | ✓ | ✓ | ✓ |
| View treatments | ✓ | ✓ | ✓ | ✓ | ✓ |
| Edit treatments | ✓ | ✓ | ✓ | ✓ | ✓ |
| View billing | ✓ | ✓ | — | ✓ | — |
| Edit billing | ✓ | ✓ | — | ✓ | — |
| View inventory | ✓ | ✓ | — | — | — |
| Edit inventory | ✓ | ✓ | — | — | — |
| View staff | ✓ | ✓ | — | — | — |
| Edit staff | ✓ | ✓ | — | — | — |
| View reports | ✓ | ✓ | ✓ | — | — |
| Manage branch | ✓ | ✓ | — | — | — |
| Manage all branches | ✓ | — | — | — | — |

---

## 3. Role summaries

| Role | Scope | Typical use |
|------|--------|-------------|
| **SuperAdmin** | All branches; subscription & app-wide settings | Owner / IT admin |
| **BranchAdmin** | One branch (or assigned branches); full branch config, staff, lab vendors | Branch manager |
| **Doctor** | One branch; clinical (patients, appointments, treatments, reports); no billing/inventory/staff; can complete lab trials | Dentist |
| **Receptionist** | One branch; patients, appointments, billing; no treatments, inventory, staff, reports | Front desk |
| **Nurse** | One branch; patients, appointments, treatments; no billing, inventory, staff, reports | Chair-side / assistant |

---

## 4. Notes

- **Branch scoping:** Non–SuperAdmin users only see data for their `branchId` (or allowed branches). SuperAdmin sees all branches.
- **Dashboard/Reports:** API does not restrict by role; Doctor sees only their own stats when `user.role === 'Doctor'` (server-side filter).
- **Lab Management:** Add vendor / delete vendor are BranchAdmin+ and SuperAdmin-only respectively; creating/editing orders and trials follows the matrix above.
- **Subscription:** Only SuperAdmin can manage plans and subscription admin/invoices.

---

## 5. Configurable screen access (SuperAdmin & Branch Admin)

- **SuperAdmin** can set **default screen access per role** at **Settings → Role permissions** (`/settings/role-permissions`). This defines which screens each role can see by default across the app.
- **Branch Admin** can **override screen access per staff member** in their branch: open **Staff → [staff member] → Screen access** tab. They can allow or disallow specific screens for that user (e.g. one Nurse can see Billing, another cannot).
- **Effective permissions** for a user = role defaults (from SuperAdmin) + any user-level overrides (from Branch Admin). User overrides take precedence. These are returned in `auth/me` and login/refresh as `screenPermissions` and used to show/hide nav items and guard routes.
- Backend: `GET/PUT /permissions/roles` (SuperAdmin), `GET/PUT /permissions/users/:userId` (BranchAdmin for their branch). Tables: `role_screen_permissions`, `user_screen_overrides`.

To change **default** role permissions (code/DB): update `DEFAULT_ROLE_SCREENS` in `apps/api/src/modules/permissions/default-role-screens.ts` or use the Role permissions UI (SuperAdmin).

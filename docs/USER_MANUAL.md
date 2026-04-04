# Dental MS — User Manual

**Dental MS** is a multi-branch dental practice management system. This guide explains how to sign in, move around the app, and use the main features: patients, scheduling, treatments, billing, labs, inventory, staff, imaging, and reports.

---

## 1. Before you start

### Browser and access

- Use a current version of **Chrome**, **Firefox**, **Safari**, or **Edge**.
- Your organization will give you the **web address** (URL) of the application and your **account email** and **password**.
- The app may be configured for a specific **branch**. If you see errors about branch context, contact your administrator.

### Roles

Users are assigned one of these roles. What you see in the sidebar depends on your role and any **screen permissions** your Super Admin has set.

- **SuperAdmin** — Manages tenants, subscription plans, and global settings; full access across the platform.
- **BranchAdmin** — Manages a branch: staff context, branches, settings, and day-to-day operations.
- **Doctor** — Clinical work: patients, appointments, treatments, imaging, reports.
- **Receptionist** — Front desk: patients, appointments, billing, scheduling.
- **Nurse** — Supports clinical workflows: patients, appointments, treatments as permitted.

---

## 2. Signing in and signing out

1. Open your organization’s Dental MS URL.
2. Enter your **email** and **password**.
3. Select **Sign in**. You are taken to the **Dashboard** (or the page you tried to open before login).

To sign out, use the **user menu** in the top bar.

**Development / demo:** If your environment was seeded for testing, sample accounts may be listed on the login screen. Use only credentials provided by your administrator in production.

---

## 3. Main layout

### Top bar

- **Branch switcher** — If you have access to more than one branch, choose the branch you are working in. Changing branch refreshes data for that location.
- **Sync status** — Shows whether the app is **Synced**, **Offline**, or **Syncing**. When offline, some actions are queued and sent when you are back online. You can open the sync queue and use **Sync now** when available.
- **User menu** — Account actions, including sign out.

### Sidebar navigation

Common sections (your menu may differ if permissions hide screens):

- **Dashboard** — Overview and quick metrics.
- **Patients** — Patient records and profiles.
- **Appointments** — Calendar scheduling.
- **Treatments** — Treatment plans and procedures.
- **Lab Management** — Lab vendors and orders.
- **Billing** — Invoices and payments.
- **Inventory** — Stock and supplies.
- **Staff** — Staff directory and profiles.
- **Imaging** — Imaging gallery and patient imaging.
- **Reports** — Analytics and exports.
- **Settings** — Branch management, subscription, and (for Super Admin) role permissions.

---

## 4. Dashboard

The **Dashboard** summarizes activity for the selected branch (for example, today’s appointments and revenue). Use it as your home page when you sign in.

---

## 5. Patients

### Patient list

- Open **Patients** to see all patients for the current branch.
- Use search and filters if available to find a patient quickly.

### New patient

1. Go to **Patients** and choose **New patient** (or equivalent).
2. Fill in required details (name, contact, and any other fields your clinic uses).
3. Save. The patient appears in the list and can be scheduled and billed.

### Patient profile

- Open a patient from the list to see their **profile**.
- From the profile you can move to related areas, such as **treatments**, **billing**, or **imaging**, depending on permissions.

---

## 6. Appointments

- Open **Appointments** to view the **calendar**.
- Create appointments by choosing a time slot and linking a **patient** and **provider** as your workflow requires.
- Update **status** (for example scheduled, completed, cancelled) to keep the schedule accurate.
- When the server supports it, **real-time updates** help multiple users see changes without refreshing the page.

---

## 7. Treatments

- **Treatments** (global) lists treatment activity across patients as your permissions allow.
- From a **patient’s** profile, open **Treatments** to see or manage that patient’s **treatment plans**.
- Open a plan for details, procedures, and progress according to your clinic’s process.

---

## 8. Lab management

Under **Lab Management**:

- **Vendors** — Add and maintain dental lab vendors; view and edit vendor details.
- **Orders** — Create **lab orders**, track status, and open orders for details or edits.

Follow your clinic’s workflow for when to create orders and which vendor to use.

---

## 9. Billing

- **Billing** provides branch-level billing views and actions your role allows.
- From a patient, open **Billing** to work with that patient’s **invoices**.
- On an invoice you can review line items, record **payments**, update status, and **download** or print PDFs (such as receipts) where the app provides a download button.

---

## 10. Inventory

- Open **Inventory** to manage **stock** (items, quantities, adjustments) for the branch.
- Use it to track supplies and support ordering decisions.

---

## 11. Staff

- **Staff** lists people at the branch (or organization, depending on setup).
- Open a staff member to view **profile** details used for scheduling and operations.

---

## 12. Imaging

- **Imaging** opens the **gallery** view for browsing imaging as permitted.
- From a **patient** profile, **Imaging** shows imaging associated with that patient.
- Imaging may be stored using your organization’s file storage; follow clinic policy for uploads and retention.

---

## 13. Reports

- Open **Reports** to run **analytics** for a date range and filters (for example by doctor).
- Review summaries such as revenue trends, treatment distribution, and performance metrics.
- Use **export / PDF** actions on the reports screen when you need a file copy for meetings or records.

---

## 14. Settings

Open **Settings** from the sidebar. Available items depend on your role:

- **Role permissions** (Super Admin) — Turn **screens** on or off per **role** (defaults for all branches). Users without access to a screen will not see it in the sidebar.
- **Branch management** — List branches, create branches or sub-branches, and edit branch details (address, hours, contact) as permitted.
- **Subscription and usage** — View **plan**, usage meters, and billing status for the branch.

### Subscription suspension

If a branch **subscription** is **suspended**, most of the app is unavailable until the issue is resolved. Users are directed to **Subscription** settings. **Super Admin** accounts are not blocked in the same way so they can assist tenants.

---

## 15. Super Admin (platform operators)

Users with the **SuperAdmin** role can open **Super Admin** areas (separate from the main clinic layout):

- **Tenants** — Manage customer organizations.
- **Plans** — Manage subscription **plans** and pricing.
- **Invoices** — Platform-level **invoices**.

Exact URLs and navigation depend on your deployment; use the Super Admin entry your team provides.

---

## 16. Offline and sync

- The app can work **offline** for supported actions. Pending changes may be stored locally.
- Watch the **sync** indicator in the header. When you are **online**, queued items sync to the server.
- If some items **fail** to sync, the app will warn you; retry when the network is stable.

---

## 17. Tips and troubleshooting

- **Missing menu items** — Your role or **role permissions** may hide that screen. Ask a Super Admin or Branch Admin.
- **Wrong branch data** — Check the **branch switcher** in the header.
- **Cannot load after login** — Confirm subscription is active; otherwise open **Settings → Subscription**.
- **API or connection errors** — Verify your network; if the problem persists, contact technical support with the time and what you were doing.

---

## 18. Getting help

For product training, account issues, or bugs, contact your **clinic administrator** or **Dental MS support** using the channel your organization provides.

---

*Document version: 1.0 — Dental MS User Manual*

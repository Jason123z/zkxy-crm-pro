# System Data Synchronization Fix Plan

## 1. Database RLS Policies
The admin account cannot read `contacts`, `visit_records`, `projects`, and `tasks` because the admin read policies were never created for these tables.
**Action:** Provide the user with a SQL script to create `SELECT` policies for admins on these tables.

## 2. Overview Screen
The "本月询价阶段客户情况" table is currently rendering mock data wrapped in a `.slice(0, 5)` loop.
**Action:** Update `OverviewScreen.tsx` to:
- Filter `customerData` where `status === '询价'`.
- Sort by `created_at` or `updated_at` descending.
- Map the real data to the table rows.

## 3. Customer Detail Screen (Admin)
The admin version of `CustomerDetail.tsx` lacks several fields present in the sales version, specifically regarding budget and intentions.
**Action:** Update `src/admin/pages/CustomerDetail.tsx` to:
- Add an "意向与需求" (Intention & Needs) section.
- Display `customer.product` (意向产品).
- Display `customer.budgetAmount` (预算金额).
- Display `customer.description` (需求/痛点).
- Display `customer.concerns` (客户顾虑点).
- Display `customer.solution` (解决方案).
- Display `customer.competitors` (竞品).

# Product Maintenance & Custom Option Implementation Plan

## 1. System Maintenance (Admin)
- **File:** `src/admin/pages/SystemMaintenance.tsx`
- **Action:** Add a new tab for "意向产品类型" mapping to the category `'product'`.
- **Result:** Admins can CRUD product dropdown options just like industries and visit types.

## 2. CustomerDetails (Sales)
- **File:** `src/CustomerDetails.tsx`
- **Dynamic Fetching:** Update the `fetchOptions` effect to also fetch `getSystemSettings('product')`.
- **State Management:**
  - Add `products` array state.
  - Add `isCustomProduct` boolean state to track if the select dropdown should show the custom input.
  - Add `projectProductType` and `projectProductValue` states for the Project Modal.
- **Customer Product UI:** Replace the hardcoded `<select>` (around line 454) with a combined `<select>` + conditional `<input>`. `value="项目"` will trigger the custom input field.
- **Project Modal UI:** Replace the hardcoded `<select>` (around line 758) with the combined UI. Use controlled inputs and hidden fields to ensure `FormData` captures the correct value upon submission.

## 3. SQL Migration
- Provide the user with an SQL script to populate the initial predefined product options:
  - 企业ERP管理系统 v4.0
  - 智能物流调度模块
  - CRM基础云服务

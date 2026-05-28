# AJ Empire Admin Panel - Fixes & Improvements

## GLOBAL FIXES
- [x] Fix errors that occur when entering the dashboard
- [x] Fix sidebar active tab state:
  - Active tab should remain selected when navigating into sub-pages
- [x] Replace currency symbol from `N` to `₦`
- [x] Make table rows clickable for viewing items (not only the eye icon)
- [x] Remove Support route/page completely

---

# ROLE-BASED ACCESS CONTROL

## Junior Admin Permissions
Allowed permissions:
- manage_products
- manage_orders
- analytics

### Restrict Junior Admin From Accessing:
- [x] Customers page
- [x] Promotions page
- [x] Settings page
- [x] Delivery management (if not required)
- [x] Banner management (if not required)
- [x] Any admin management routes

---

# BANNER MODULE

## Add Banner Management Page
- [x] Create Banner page/module
- [x] Allow admin upload of multiple banner images
- [x] Integrate upload with existing API docs
- [x] Add banner listing table/grid
- [x] Add delete banner functionality
- [x] Add loading and error states

---

# DASHBOARD

## Dashboard Data & UI
- [x] Fix "This Week / Month / Year" select:
  - Ensure data updates dynamically based on selected period

- [x] Implement Website Traffic values
- [x] Implement Real-time Insight values

- [x] Make Top Selling Products clickable:
  - Clicking product should navigate to product details page

- [x] Update admin header section:
  - Change "Admin User" text to "Administrator"
  - Display admin role beside the name

- [x] Implement Notifications dropdown:
  - Clicking notification icon should show admin notifications
  - Add loading state
  - Add empty state

---

# ORDERS PAGE

## Orders Table
- [x] Fix Filter button functionality
- [x] Fix More button dropdown/options
- [x] Remove bin/delete icon from orders table

---

# ORDER DETAILS PAGE (/orders/:id)

## Order Details Fixes
- [x] Fix "Email not provided" issue
- [x] Replace:
  - Home Address
  - Billing Address
  With:
  - Shipping Address only

- [x] Fix Action button dropdown/modal functionality
- [x] Ensure Orders tab remains active on sidebar while viewing single order

---

# INVENTORY

## Product Form Updates
- [x] Add `isReturnable` toggle input
  - Default value should be `true`
  - Send value to API when creating/editing product

- [x] Remove Discounted Price input field

- [x] Ensure Edit Product form contains same fields as Create Product form

- [x] Product View Page:
  - Show ALL product fields/inputs
  - Ensure no product information is hidden

---

# CUSTOMERS

## Customers Management
- [x] Fix Filter functionality

- [x] Verify and fix customer stats data:
  - Last active
  - Total orders
  - Total spent

- [x] Add deactivate customer account functionality
  - [x] Add confirmation modal
  - [x] Update customer status in API

---

# DELIVERY

## Delivery Management
- [x] Fix order status update functionality
- [x] Fix Filter button functionality

---

# PROMOTIONS

## Promotions Form
- [x] Change Banner Image input from URL field to File Upload

- [x] Coupon visibility logic:
  - Hide coupon code field when promotion type = `flashsale`
  - Show coupon code field only when type = `coupon`

---

# SETTINGS

## Admin & Logistics Settings

### Setup Password Route
- [x] Create `setupPassword` route/page
- [x] Allow invited admins to setup password

### Admin Delete Confirmation
- [x] Replace current delete confirmation popup
- [x] Use improved confirmation modal similar to customer delete modal

### Logistics Settings
- [x] Keep only one logistics toggle option:
  - "Logistics Mode"
  OR
  - "Enable Logistics"

- [x] Fetch logistics status from:
  - User Folder → Logistics

- [x] Reflect current logistics mode correctly:
  - Automatic
  - Manual

### Admin Profile
- [x] Remove admin profile picture upload requirement
- [x] Display default user icon instead
- [x] Disable/remove file upload interaction for profile image

---

# QA & TESTING

- [ ] Test all sidebar active states
- [ ] Test all filters and dropdowns
- [ ] Test role-based access restrictions
- [ ] Test all API integrations
- [ ] Test responsive layouts
- [ ] Test loading/error/empty states
- [ ] Run full regression testing before deployment
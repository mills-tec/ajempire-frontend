# User Route Group Implementation Guide

## Overview
Implementing the `(user)` route group to cleanly separate user routes from admin routes.

## Directory Structure Changes

### Before (Current Structure)
```
src/app/
├── page.tsx                    ← Home page
├── categories/                 ← User routes
├── checkoutpage/
├── pages/
├── payment/
├── product/
├── search/
├── signout/
├── admin/                      ← Admin routes (separate)
├── admin-login/
├── layout.tsx                  ← Root layout with user + global components
└── provider.tsx
```

### After (Proposed Structure)
```
src/app/
├── (user)/                     ← User route group
│   ├── layout.tsx              ← NEW: User-specific providers & layout
│   ├── page.tsx                ← Moved from src/app/page.tsx
│   ├── categories/             ← Moved from src/app/categories/
│   ├── checkoutpage/           ← Moved from src/app/checkoutpage/
│   ├── pages/                  ← Moved from src/app/pages/
│   ├── payment/                ← Moved from src/app/payment/
│   ├── product/                ← Moved from src/app/product/
│   ├── search/                 ← Moved from src/app/search/
│   └── signout/                ← Moved from src/app/signout/
├── admin/                      ← Admin routes (unchanged)
├── admin-login/                ← Admin login (unchanged)
├── layout.tsx                  ← Updated: Global components only
├── components/                 ← Shared components (unchanged)
├── contextanimation/           ← Shared context (unchanged)
└── provider.tsx                ← User Providers component
```

## Files to Move

### Step 1: Move User Route Files
These files should be moved from `/src/app/` to `/src/app/(user)/`:

- `page.tsx` → `(user)/page.tsx` (home page)
- `categories/` → `(user)/categories/`
- `checkoutpage/` → `(user)/checkoutpage/`
- `pages/` → `(user)/pages/`
- `payment/` → `(user)/payment/`
- `product/` → `(user)/product/`
- `search/` → `(user)/search/`
- `signout/` → `(user)/signout/`

### Step 2: User Layout Already Created ✅
The file `/src/app/(user)/layout.tsx` has been created with:
- User-specific Providers (GoogleOAuth, React Query)
- SocketProvider for real-time notifications
- NotificationWrapper for push/socket notifications
- CartIconProvider for cart management
- SplashScreenWrapper for user splash screen
- LayoutWrapper with navbar/footer

### Step 3: Root Layout Already Updated ✅
The root layout has been simplified to include only:
- Global components (Toaster, PWAInstallPrompt, NetworkStatus)
- ModalProvider (shared by user & admin)
- SpeedInsights and TawkToWidget
- Children render point for route-specific layouts

### Step 4: Admin Layout (No Changes Needed) ✅
The admin layout at `/src/app/admin/layout.tsx` already has all admin-specific components and remains unchanged.

## Component Location Reference

### Global Components (in Root Layout)
✅ Toaster - Toast notifications
✅ PWAInstallPrompt - PWA installation
✅ ModalProvider - Modal system (shared)
✅ NetworkStatus - Network status indicator
✅ SpeedInsights - Performance analytics
✅ TawkToWidget - Support widget

### User Components (in (user)/layout.tsx)
✅ Providers - GoogleOAuth, React Query, cart sync
✅ SocketProvider - WebSocket for real-time data
✅ NotificationWrapper - Push & socket notifications
✅ CartIconProvider - Cart animation context
✅ SplashScreenWrapper - Loading splash screen
✅ LayoutWrapper - Navbar, footer, cart popup

### Admin Components (in admin/layout.tsx)
✅ AuthProvider - Admin authentication
✅ ProtectedRoute - Admin permission check
✅ AdminNotificationWrapper - Admin notifications
✅ Header, Sidebar - Admin UI
✅ Video upload features

## Benefits After Migration

1. **Clear Separation** - User routes are visually grouped in `(user)` directory
2. **Smaller Root Layout** - Root only loads absolutely necessary global components
3. **No Route Checks Needed** - User layout only affects user routes
4. **Better Tree-Shaking** - Build can more easily remove user-specific code from admin bundle
5. **Clearer Intent** - New developers immediately see the route structure
6. **Simpler Testing** - Can test user and admin flows independently

## Migration Checklist

- [ ] Move `/src/app/page.tsx` → `/src/app/(user)/page.tsx`
- [ ] Move `/src/app/categories/` → `/src/app/(user)/categories/`
- [ ] Move `/src/app/checkoutpage/` → `/src/app/(user)/checkoutpage/`
- [ ] Move `/src/app/pages/` → `/src/app/(user)/pages/`
- [ ] Move `/src/app/payment/` → `/src/app/(user)/payment/`
- [ ] Move `/src/app/product/` → `/src/app/(user)/product/`
- [ ] Move `/src/app/search/` → `/src/app/(user)/search/`
- [ ] Move `/src/app/signout/` → `/src/app/(user)/signout/`
- [ ] Verify `(user)/layout.tsx` exists ✅
- [ ] Verify root `layout.tsx` is simplified ✅
- [ ] Verify admin routes still work
- [ ] Test user routes still work
- [ ] Update any absolute imports if needed
- [ ] Run build to verify no errors

## Manual Steps Required

**Note:** File moving must be done manually through your file system, Git, or IDE because:
1. Moving preserves git history for each file
2. Prevents potential issues with imports
3. Allows verification at each step

### Option A: Using Your IDE (Recommended)
1. Create the `(user)` directory structure
2. Drag and drop files from `/src/app/` to `/src/app/(user)/`
3. The IDE will update imports automatically
4. Commit the moves as one change

### Option B: Using Git Commands
```bash
# Create the directory structure
mkdir -p src/app/\(user\)

# Move files
git mv src/app/page.tsx src/app/\(user\)/page.tsx
git mv src/app/categories src/app/\(user\)/categories
git mv src/app/checkoutpage src/app/\(user\)/checkoutpage
git mv src/app/pages src/app/\(user\)/pages
git mv src/app/payment src/app/\(user\)/payment
git mv src/app/product src/app/\(user\)/product
git mv src/app/search src/app/\(user\)/search
git mv src/app/signout src/app/\(user\)/signout

# Verify and commit
git status
git commit -m "refactor: implement (user) route group for better separation"
```

### Option C: Manual File System
1. Create folders manually
2. Copy files to new locations
3. Delete old files
4. Update Git tracking if needed

## Verification

After migration, verify:

1. **User Routes Work**
   - Visit `/` (home)
   - Visit `/categories`
   - Visit `/product/[id]`
   - Visit `/search?q=test`
   - Visit `/pages/cart`
   - Visit `/checkoutpage`

2. **Admin Routes Work**
   - Visit `/admin/login`
   - Visit `/admin/orders`
   - Visit `/admin/products`

3. **No Build Errors**
   ```bash
   npm run build
   ```

4. **No ESLint Errors**
   ```bash
   npm run lint
   ```

## Timeline

- **Created Files** ✅
  - `(user)/layout.tsx` with all user-specific providers
  - Updated `layout.tsx` to only have global components

- **Manual Work Needed** ⏳
  - Move user route directories to `(user)` group

- **Verification** ⏳
  - Test all user and admin routes
  - Verify build succeeds
  - Run tests if applicable

## Notes

- The `(user)` is a **route group** in Next.js 13+ - it doesn't appear in the URL
- `/categories` will still be accessible at `/categories` (not `/user/categories`)
- This is a non-breaking change - URLs remain the same
- All imports should continue to work (no breaking changes)

## Rollback

If needed, the changes can be easily rolled back:
1. Move files back from `(user)` to root
2. Restore original layout files

The implementation is designed to be easily reversible.

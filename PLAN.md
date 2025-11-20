# WIC Scanning App - Plan of Attack

## Overview
Create a one-page Progressive Web App (PWA) that:
- Scans barcodes using device camera
- Checks scanned products against the official WIC APL (Approved Product List) Excel file
- Downloads and syncs the Excel file locally using Dexie/IndexedDB
- Works offline after initial sync

## Tech Stack
- **Framework**: Astro + React (already set up)
- **Styling**: Tailwind CSS (already set up)
- **Database**: Dexie.js for IndexedDB (client-side), Convex (server-side sync)
- **Barcode Scanning**: HTML5 Camera API + @zxing/library
- **Excel Parsing**: SheetJS (xlsx)
- **Backend**: Convex (data sync), Vercel Functions (Excel processing)
- **Package Manager**: pnpm (already in use)

## ✅ Phase 1: Project Setup & Dependencies (COMPLETED)

### 1.1 Install Required Packages ✅
- ✅ `dexie` - IndexedDB wrapper
- ✅ `xlsx` - Excel parsing
- ✅ `@zxing/library` - Barcode scanning
- ✅ `cheerio` - HTML parsing for scraping
- ✅ `date-fns` - Date formatting
- ✅ `dexie-react-hooks` - Reactive Dexie updates

### 1.2 PWA Configuration (COMPLETED)
- ✅ Add manifest.json for PWA capabilities (via @vite-pwa/astro)
- ✅ Configure service worker for offline support (autoUpdate strategy)
- ⏳ Add custom install prompts (optional, browser handles default)

## ✅ Phase 2: Database Schema & Dexie Setup (COMPLETED)

### 2.1 Create Dexie Database Schema ✅
**File**: `src/lib/db.ts` ✅

- ✅ `products` table: Store WIC APL product data
  - `upc` (primary key, indexed)
  - `categoryDescription`
  - `subCategoryDescription`
  - `brandName`
  - `foodDescription`
  - `packageSize`
  - `uom`
- ✅ `syncMetadata` table: Track sync status
  - `id` (primary key: "current")
  - `lastSyncDate`
  - `totalProducts`

### 2.2 Database Initialization ✅
- ✅ Dexie instance created
- ✅ Schema with indexes defined
- ✅ Database exported

## ✅ Phase 3: Excel File Download & Parsing (COMPLETED)

### 3.1 Excel File Source ✅
**File**: `src/lib/scraper.ts` ✅
- ✅ Identified WIC APL website URL
- ✅ Created API route to find Excel file link: `src/pages/api/find-apl-link.ts`
- ✅ Scrapes website to find current Excel file URL
- ✅ Handles caching (1 hour cache)
- ✅ Download mechanism with timeout handling

### 3.2 Excel Parsing ✅
**File**: `src/lib/excelParser.ts` ✅
- ✅ Uses SheetJS (xlsx) to parse Excel file
- ✅ Extracts product data from Excel sheets
- ✅ Maps Excel columns to database schema
- ✅ Handles header row detection
- ✅ Validates data integrity
- ✅ Skips rows with missing UPC

### 3.3 Data Sync Logic ✅ (UPDATED)
**File**: `src/lib/sync.ts` ✅
- ✅ Connects to Convex backend
- ✅ Fetches pre-processed data from Convex (JSON)
- ✅ Upserts products into IndexedDB
- ✅ Handles large datasets via pagination
- ✅ Updates sync metadata
- ✅ Reactive UI updates via `dexie-react-hooks`

## ✅ Phase 4: Barcode Scanning Implementation (COMPLETED)

### 4.1 Camera Access ✅
**File**: `src/components/BarcodeScanner.tsx` ✅
- ✅ Requests camera permissions
- ✅ Accesses device camera via `getUserMedia` API
- ✅ Displays camera feed in video element
- ✅ Handles camera errors and permissions

### 4.2 Barcode Detection ✅
- ✅ Integrated @zxing/library
- ✅ Continuously scans video frames
- ✅ Detects barcode/UPC codes
- ✅ Extracts barcode value
- ✅ Handles multiple barcode formats

### 4.3 Scanning UI ✅
- ✅ Camera preview component
- ✅ Visual feedback (scanning indicator, success/error states)
- ✅ Manual barcode entry fallback

## ✅ Phase 5: Product Lookup & Display (COMPLETED)

### 5.1 Database Query ✅
**File**: `src/lib/productLookup.ts` ✅
- ✅ Queries IndexedDB by barcode/UPC
- ✅ Fast indexed lookup
- ✅ Handles not found cases
- ✅ Returns product information
- ✅ `isWICApproved()` helper function

### 5.2 Result Display ✅
**File**: `src/components/BarcodeScanner.tsx` ✅
- ✅ Displays product information
- ✅ Shows approval status (WIC approved or not)
- ✅ Product details (name, brand, size, category)
- ✅ Visual indicators for approved/not approved

## ✅ Phase 6: Main App UI (COMPLETED)

### 6.1 Layout Structure ✅
**File**: `src/pages/index.astro` ✅
- ✅ Header with app title
- ✅ Sync status indicator (`LastSyncStatus` component)
- ✅ Manual sync button (`SyncButton` component)
- ✅ Barcode scanner section
- ✅ Product result display

### 6.2 State Management ✅
- ✅ React state for:
  - Current scan result
  - Sync status
  - Camera state
- ✅ Uses React hooks (useState, useEffect)
- ✅ Reactive sync status (useLiveQuery)

### 6.3 Styling ✅
- ✅ Uses Tailwind CSS for responsive design
- ✅ Mobile-first approach
- ✅ Touch-friendly buttons
- ✅ Clear visual feedback

## ✅ Phase 7: Server-Side Sync Architecture (COMPLETED)

### 7.1 Convex Setup ✅
**Files created:**
- `convex/schema.ts` - Database schema
- `convex/sync.ts` - Sync mutations/queries
- `convex/_generated/` - Auto-generated types

**Completed Tasks:**
- ✅ Install Convex: `pnpm add convex`
- ✅ Initialize Convex: `npx convex dev`
- ✅ Define schema matching IndexedDB Product structure
- ✅ Create `bulkUpsertProducts` mutation
- ✅ Create `getSyncMetadata` query
- ✅ Create `getProductsPaginated` query (handles >8k items)
- ✅ Update `getAllProducts` query (legacy support)

### 7.2 Vercel Function for Excel Processing ✅
**File**: `src/pages/api/sync-products.ts`

**Completed Tasks:**
- ✅ Create serverless function that:
  - Finds current APL URL (reuse scraper logic)
  - Downloads Excel file
  - Parses Excel file (server-side)
  - Calls Convex mutation to store products
- ✅ Handle errors and retries
- ✅ Return sync status
- ✅ Secure endpoint with `CRON_SECRET`
- ✅ Handle build-time env var constraints (Lazy initialization)

### 7.3 Vercel Cron Job (TODO)
**File**: `vercel.json`

**Tasks:**
- ⏳ Set up cron job to trigger sync daily
- ⏳ Configure cron schedule (e.g., daily at 2 AM)
- ⏳ Handle cron job authentication

### 7.4 Update Client-Side Sync ✅
**File**: `src/lib/sync.ts`

**Completed Tasks:**
- ✅ Replace Excel download/parsing with Convex fetch
- ✅ Fetch products from Convex using query
- ✅ Store fetched products in IndexedDB (same as before)
- ✅ Keep offline functionality intact
- ✅ Add error handling for Convex connection

**New Flow:**
```typescript
// Client-side sync (mobile-friendly)
1. Fetch products from Convex (lightweight JSON)
2. Store in IndexedDB (local cache)
3. Works offline with IndexedDB
```

## Phase 8: Sync & Update Mechanism (PARTIALLY COMPLETE)

### 8.1 Initial Sync ✅
- ✅ On first load, check if database is empty
- ✅ Manual sync button available
- ✅ Shows download progress
- ✅ Uses Convex for fast data transfer

### 8.2 Manual Sync ✅
- ✅ Button to manually trigger sync
- ✅ Shows sync status
- ✅ Fetches from Convex
- ✅ Updates UI reactively

### 8.3 Background Sync (TODO)
- ⏳ Service worker for background sync
- ⏳ Periodic checks for updates
- ⏳ Notify user of updates
- ⏳ Use Convex real-time subscriptions for updates

## Phase 9: Error Handling & Edge Cases (PARTIALLY COMPLETE)

### 9.1 Error Scenarios
- ✅ Excel file download fails (with timeout handling)
- ✅ Network errors (with retry logic)
- ✅ Camera permission denied
- ✅ Camera not available
- ✅ Large dataset handling (pagination implemented)
- ✅ Build-time environment variable handling
- ⏳ Excel file format changes
- ⏳ IndexedDB quota exceeded
- ⏳ Invalid barcode format
- ⏳ Convex connection errors

### 9.2 User Feedback ✅
- ✅ Clear error messages
- ✅ Loading states
- ✅ Retry mechanisms
- ✅ Fallback options (manual entry)
- ⏳ Better error recovery

## Phase 10: Testing & Optimization (TODO)

### 10.1 Testing Checklist
- ⏳ Test on actual mobile device
- ⏳ Test various barcode formats
- ⏳ Test offline functionality
- ⏳ Test with different Excel file sizes
- ⏳ Test camera on different devices
- ⏳ Test IndexedDB storage limits
- ⏳ Test Convex sync on mobile networks
- ⏳ Test Vercel function reliability

### 10.2 Performance Optimization
- ⏳ Optimize barcode scanning frame rate
- ⏳ Lazy load components
- ⏳ Optimize database queries
- ⏳ Compress/cache Excel data if needed
- ⏳ Optimize Convex queries (pagination if needed)

## Phase 11: Polish & Deployment (TODO)

### 11.1 PWA Features (PARTIALLY COMPLETE)
- ✅ Add to home screen capability (Enabled via manifest)
- ✅ Offline support (service worker configured)
- ⏳ App icon and splash screen (Using favicon placeholder, needs PNGs)
- ✅ Manifest configuration

### 11.2 Final Touches
- ⏳ Loading animations
- ⏳ Success/error animations
- ⏳ Sound feedback (optional)
- ⏳ Vibration feedback (optional)

## Implementation Order Recommendation

### Completed ✅
1. ✅ **Phase 2** (Database setup) - Foundation
2. ✅ **Phase 3** (Excel parsing) - Core data functionality
3. ✅ **Phase 4** (Barcode scanning) - Core feature
4. ✅ **Phase 5** (Product lookup) - Connect scanning to data
5. ✅ **Phase 6** (UI) - User interface
6. ✅ **Phase 7** (Server-Side Sync) - Modern architecture

### Next Steps 🔄
1. **Phase 7.3** (Cron Job) - Automate the server sync
2. **Phase 8** (Enhanced sync) - Background sync with Convex
3. **Phase 11** (PWA polish) - Final touches for mobile experience
4. **Phase 10** (Testing) - Comprehensive testing

## Key Files Structure

```
wic-scanning-app/
├── src/
│   ├── lib/
│   │   ├── db.ts              # ✅ Dexie database setup
│   │   ├── excelParser.ts     # ✅ Excel parsing logic
│   │   ├── sync.ts            # ✅ Sync logic (Convex integrated)
│   │   ├── scraper.ts         # ✅ APL URL finding
│   │   └── productLookup.ts   # ✅ Product lookup functions
│   ├── components/
│   │   ├── BarcodeScanner.tsx # ✅ Camera & barcode scanning
│   │   ├── SyncButton.tsx     # ✅ Manual sync trigger
│   │   ├── LastSyncStatus.tsx # ✅ Sync status display
│   │   ├── Head.astro         # ✅ Head component
│   │   └── MainLayout.astro   # ✅ Layout component
│   └── pages/
│       ├── index.astro        # ✅ Main app page
│       └── api/
│           ├── find-apl-link.ts # ✅ APL URL API route
│           └── sync-products.ts # ✅ Excel processing & Convex sync
├── convex/                     # ✅ Convex backend
│   ├── schema.ts              # ✅ Database schema
│   ├── sync.ts                # ✅ Sync mutations/queries
│   └── _generated/            # ✅ Auto-generated types
├── vercel.json                # ⏳ NEW: Cron job config
└── package.json
```

## Architecture Overview

### Current Architecture (Server-Side Sync + Client Cache)
```
Vercel Cron (or Manual) → Vercel Function → Scrape & Parse Excel → Convex DB
                                                                        ↓
Mobile/PC → Convex Query (Paginated) → Fetch JSON → IndexedDB (local cache)
```

**Benefits:**
- ✅ Mobile-friendly (lightweight JSON fetch instead of heavy Excel processing)
- ✅ Faster sync (pre-processed data)
- ✅ Centralized data source
- ✅ Real-time updates possible with Convex subscriptions
- ✅ Better error handling (server-side retries)

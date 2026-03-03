# WIC Scanning App

A Progressive Web App (PWA) that scans barcodes to check if products are on the WIC (Women, Infants, and Children) Approved Product List (APL).

## Features

- **Barcode Scanning**: Scan product barcodes using your device camera with real-time detection
- **Product Text Search**: Search the entire database manually with autocomplete, infinite scroll, and responsive grid layouts
- **WIC Eligibility Rules Engine**: Select a participant type (e.g., Pregnant, Infant, Child) to dynamically filter and verify if a product is WIC-approved for your specific needs
- **Dynamic Imagery**: Uses local SVG icons for zero-latency categorization and lazy-loads real product images via the Open Food Facts API
- **Modern UI/UX**: Features a premium, earthy WIC-specific color palette with dark/light mode toggling and toast notifications
- **Offline Support**: Works offline after initial data sync (PWA with service worker)
- **Automatic Data Sync**: Weekly automated sync of the official NYS WIC APL database
- **Mobile-First Design**: Responsive UI optimized for mobile devices
- **Real-time Updates**: Convex subscriptions for live data synchronization

## Tech Stack

- **Framework**: [Astro](https://astro.build/) + [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: 
  - [Dexie.js](https://dexie.org/) (IndexedDB) for client-side storage
  - [Convex](https://convex.dev/) for server-side data sync
- **Barcode Scanning**: [@zxing/library](https://github.com/zxing-js/library)
- **Component Library/Icons**: [Lucide React](https://lucide.dev/) for SVG iconography, [Sonner](https://sonner.emilkowal.ski/) for toasts
- **Excel Parsing**: [SheetJS (xlsx)](https://sheetjs.com/)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Deployment**: [Vercel](https://vercel.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## Project Structure

```
wic-scanning-app/
├── src/
│   ├── components/
│   │   ├── App.tsx              # Main React app component
│   │   ├── BarcodeScanner.tsx   # Camera & barcode scanning UI
│   │   ├── SyncButton.tsx       # Manual sync trigger
│   │   ├── SyncManager.tsx      # Convex sync orchestration
│   │   └── LastSyncStatus.tsx   # Sync status display
│   ├── lib/
│   │   ├── db.ts                # Dexie/IndexedDB database setup
│   │   ├── convex.ts            # Convex client configuration
│   │   ├── sync.ts              # Data sync logic
│   │   ├── excelParser.ts       # Excel file parsing
│   │   ├── scraper.ts           # APL URL discovery
│   │   ├── productLookup.ts     # Product query functions
│   │   └── barcodeDetection.ts  # Barcode detection utilities
│   └── pages/
│       ├── index.astro          # Main app page
│       └── api/
│           ├── find-apl-link.ts # API: Find APL Excel URL
│           └── sync-products.ts # API: Sync products to Convex
├── convex/
│   ├── schema.ts                # Convex database schema
│   ├── sync.ts                  # Convex mutations/queries
│   └── _generated/              # Auto-generated Convex types
├── scripts/
│   └── sync-convex.ts           # Manual Convex sync script
├── public/                      # Static assets (PWA icons, etc.)
├── vercel.json                  # Vercel config (cron jobs)
└── package.json
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel Cron (Weekly)                        │
│                          ↓                                      │
│              Vercel Function (/api/sync-products)               │
│                          ↓                                      │
│    Scrape WIC Website → Download Excel → Parse → Convex DB      │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Client (Mobile/PC)                         │
│                          ↓                                      │
│         Convex Query (Paginated) → IndexedDB (local cache)      │
│                          ↓                                      │
│              Barcode Scan → Product Lookup → Result             │
└─────────────────────────────────────────────────────────────────┘
```

**Benefits:**
- Mobile-friendly (lightweight JSON fetch instead of heavy Excel processing)
- Faster sync (pre-processed data from Convex)
- Centralized data source with real-time updates
- Full offline functionality with IndexedDB cache

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (`npm install -g pnpm`)
- A [Convex](https://convex.dev/) account

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd wic-scanning-app
   ```

2. Install dependencies:
   ```sh
   pnpm install
   ```

3. Set up environment variables:
   ```sh
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Convex deployment URL:
   ```
   PUBLIC_CONVEX_URL=https://your-deployment-name.convex.cloud
   ```

4. Initialize Convex:
   ```sh
   npx convex dev
   ```

5. Start the development server:
   ```sh
   pnpm dev
   ```

6. Open [http://localhost:4321](http://localhost:4321) in your browser

### Initial Data Sync

On first load, the app will show an empty database. Trigger a server-side sync to populate the database with initial data:

- **Via CLI**: Run `pnpm sync:convex`

Then trigger a manual sync from the app to update the local indexedDB cache:

- **Via UI**: Tap the "Sync Now" button in the app

## Commands

| Command            | Action                                           |
| :----------------- | :----------------------------------------------- |
| `pnpm install`     | Install dependencies                              |
| `pnpm dev`         | Start local dev server at `localhost:4321`       |
| `pnpm build`       | Build for production to `./dist/`                |
| `pnpm preview`     | Preview production build locally                 |
| `pnpm test`        | Run Vitest unit tests UI/Lib                     |
| `pnpm sync:convex` | Manually sync products to Convex                 |
| `npx convex dev`   | Start Convex development deployment              |

## Environment Variables

| Variable            | Description                                          |
| :------------------ | :--------------------------------------------------- |
| `PUBLIC_CONVEX_URL` | Your Convex deployment URL (required)                |
| `CRON_SECRET`       | Secret for cron job authentication (optional)        |

## Data Model

### Product
```typescript
interface Product {
  upc: string;                  // UPC/PLU barcode number
  categoryDescription: string;  // WIC category
  subCategoryDescription: string; // Sub-category
  brandName: string;            // Product brand
  foodDescription: string;      // Product description
  packageSize: string;          // Package size
  uom: string;                  // Unit of measure
}
```

### Sync Metadata
```typescript
interface SyncMetadata {
  id: "current";
  lastSyncDate: Date;
  totalProducts: number;
}
```

## PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Service worker caches app shell and data
- **Auto-update**: App updates automatically when new versions deploy

## Deployment

The app is designed for Vercel deployment:

1. Push to your Git repository
2. Import to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

The included `vercel.json` configures a weekly cron job (Fridays at 2 AM) to sync the WIC APL data.

## License

MIT

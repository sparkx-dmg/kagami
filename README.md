# 鏡 KAGAMI — Technical Specifications & Developer Architecture Guide

Kagami is a next-generation, high-performance web client for manga cataloging and reading. Built on **Next.js 16 (App Router)** and **TypeScript**, it is designed to deliver a highly optimized, lag-free mobile and desktop experience with a tailored **Velvet Obsidian** interface.

---

## 🎨 1. Visual Identity, Theming & Micro-Animations

The interface is engineered around the **Pure Velvet Obsidian Canvas**, stripping out unnecessary layout meshes, gradients, and technical grid overlays in favor of a clean, contrast-rich reading environment.

### Color System & Design Tokens
*   **Ink-Black Canvas (`#0B0B0A`)**: The root application background, providing a deep, warm-dark ink black base.
*   **Surface Cards (`#141413`)**: The standard surface color for modular boxes, dropdown inputs, and cards.
*   **Typography Accent (`#F5F5F0`)**: High-contrast, warm off-white primary text.
*   **Obsidian Borders (`#262624`)**: Thin border specifications for layout boxes and divider rules.
*   **Monochrome Noise Texture**: Applied globally using an inline SVG turbulence filter with a low-opacity (2%) mask in the stylesheet, giving the canvas a tactile, velvet-matte finish.
*   **Capsule Geometry**: Perfect pill styling (`rounded-full`) for active navigation indicators and action triggers; rounded cornering (`rounded-xl` and `rounded-2xl`) for modules.

### Kinetic Animation Engine (`KineticCore.tsx` & `EuclideanWave.tsx`)
To ensure high frame rates on lower-end devices, all heavy JavaScript-calculated animations were replaced with hardware-accelerated CSS and optimized Framer Motion springs:
*   **`ZeroGFloating`**: A lightweight container providing structural depth without the CPU cost of real-time swaving.
*   **`KineticTypography`**: Animates text blocks using a hardware-accelerated pure CSS fade-in, avoiding layout thrashing.
*   **`ProximityDistortion`**: Renders border hover trail glows purely through native CSS transitions, removing pointer tracking loops.
*   **`BalloonClick`**: Applies squash-and-stretch click physics dynamically via pointer down/up spring scales (`scaleX: 1.12`, `scaleY: 0.88`) with high-frequency spring settling.
*   **`EuclideanWaveItem`**: Animates entrance layouts using tight CSS classes rather than JS loop measurements, preventing cumulative layout shift (CLS).

---

## 🚀 2. Codebase Architecture & File Mapping

The project structure segregates layout templates, services, storage stores, and test coverage:

```
src/
├── app/                      # Next.js App Router routes & handlers
│   ├── api/                  # Server-side API proxy & scraper endpoints
│   ├── categories/           # Genre directory and category browsing pages
│   ├── history/              # Reading logs and history pages
│   ├── library/              # Local storage user bookshelf page
│   ├── manga/[id]/           # Manga detail, notes, and chapter list page
│   ├── read/[chapterId]/     # Reading canvas drawer (Webtoon/Single/Double)
│   ├── search/               # Directory catalog search & filter page
│   ├── settings/             # SFW toggles, themes, and client configurations
│   └── page.tsx              # Bento Dashboard and Category rows
├── components/               # React UI modules
│   ├── layout/               # AppShell, Sidebar, Header, and BottomNav
│   ├── manga/                # MangaCard, Skeleton indicators
│   └── ui/                   # Custom buttons, text, and providers
├── services/                 # Catalog APIs & normalization layer
│   ├── mangadex/             # MangaDex integration services
│   └── supplemental/         # Local supplemental JSON catalog
├── stores/                   # Zustand state stores
│   ├── libraryStore.ts       # Bookshelf, favorites, notes, history
│   └── settingsStore.ts      # Themes, SFW, reader configurations
└── types/                    # Core TypeScript models
```

---

## 💻 3. Layout, AppShell & Navigation

### AppShell Layout System (`AppShell.tsx`)
The shell encloses every page with a viewport containment grid, preventing horizontal layout shifting on mobile screens:
*   **Horizontal Stability**: Locked to `w-full max-w-full overflow-x-hidden` on both root wrappers.
*   **Responsive Menus**:
    *   **Desktop (`md:flex`)**: Left-docked navigation sidebar and a top-floating navigation header containing search triggers.
    *   **Mobile (`md:hidden`)**: A bottom-docked navigation menu utilizing a sliding tab indicator.
*   **Online Indicator**: A green ping dot is embedded in the Header, utilizing an animate-ping status indicator showing system connectivity.

### Command Menu Spotlight (`CommandMenu.tsx`)
The search spotlight (`Ctrl + K` or `Cmd + K`) runs on a global key listener, letting users search their history, settings, bookshelf, and catalog:
*   Includes instant filters for active shelves (Currently Reading, Completed, On Hold).
*   Allows toggling SFW safe mode directly via command inputs.

---

## 📡 4. Catalog Integration & Normalization

### Normalization Layer (`mangaMetadataNormalizer.ts`)
Converts raw JSON payload structures from MangaDex API endpoints into unified TypeScript models (`KagamiManga`):
*   **Image Path Construction**: Cover files are parsed from relationships and mapped directly to optimized CDN URLs:
    `https://uploads.mangadex.org/covers/{mangaId}/{fileName}.512.jpg`.
*   **Status & Demographic Parsing**: Normalizes demographic options (`shounen`, `shoujo`, `seinen`, `josei`, `none`) and status values (`ongoing`, `completed`, `hiatus`, `cancelled`).
*   **Alternate Title Sorting**: Prioritizes English titles (`en`, `en-us`) and extracts original language labels as fallbacks.

### Supplemental Local Database (`supplementalCatalog.ts`)
An offline database of curated shonen titles (e.g. *My Hero Academia*, *Jujutsu Kaisen*, *Chainsaw Man*, *Spy x Family*) which are heavily restricted on MangaDex:
*   Stores custom high-resolution cover arts, alternative titles, and publishers.
*   Maps external redirect URLs (e.g., Viz Media, MangaPlus) for licensed titles, integrating them into search queries.

---

## 🔌 5. Fallback Scraper Proxy (`weebcentral.com`)

When a chapter is unavailable on MangaDex, Kagami automatically resolves the missing items by scraping chapters from Weeb Central:

### Fallback Chapters Scraper (`/api/fallback/chapters/route.ts`)
1.  **Search Lookup**: Next.js receives the manga title and alt titles via query parameters, making a POST request (`text={query}`) to `weebcentral.com/search/simple`.
2.  **Series Matching**: Searches matches using regex:
    `/href="https:\/\/weebcentral\.com\/series\/([a-zA-Z0-9]+)\/([^"]+)"/g`.
    Prefers non-colored version formats unless the query explicitly requests colored versions.
3.  **HTML Parsing**: Downloads the full chapter list from `weebcentral.com/series/{seriesId}/full-chapter-list` and parses links (`weebcentral.com/chapters/{chapterId}`) using string manipulation and regex.
4.  **Integration**: Merges fallback chapters into the details view, adding a custom `Weeb Central (Fallback)` scanlation badge.

### Fallback Pages Scraper (`/api/fallback/pages/route.ts`)
1.  **Chapter Lookup**: Fetches the HTML of `weebcentral.com/chapters/{chapterId}`.
2.  **First Page Detection**: Scrapes the preload link tag:
    `/<link\s+[^>]*href="([^"]*\/manga\/[^"]*\.(?:png|jpg|jpeg|webp))"/i`.
3.  **Total Pages Extraction**: Parses the JS variable inside the page:
    `max_page: parseInt('(\d+)')`.
4.  **URL Reconstruction**: Rebuilds all page links dynamically by replacing the page number index, padding the file names (e.g. `001.png`, `002.png`), and returning a clean JSON array.

---

## 💾 6. Offline Chapter Downloader & Local Storage

### Library Storage Store (`libraryStore.ts`)
Built using Zustand, storing user data locally in browser storage:
*   **Reading Status**: Categories manga into `reading`, `planning`, `on_hold`, `completed`, `dropped`, or `none`.
*   **History Logs**: Tracks reading milestones (chapter numbers, timestamps, and page index positions).
*   **Reviews & Notes**: Allows users to save reading notes and ratings (1-10 stars) locally.

### Offline Cache Manager (`caches`)
*   **Service Worker Caching**: The downloader opens a native cache container:
    `caches.open('kagami-offline-chapters')`.
*   **Parallel Fetch**: Resolves image urls via `fetchAtHomeServer` (or Weeb Central page proxy), fetches the page images in parallel, and caches them inside browser storage.
*   **Offline Indicator**: If a chapter is cached, the UI replaces the download trigger with an `Offline` badge, enabling zero-network reading.

---

## 📖 7. High-Performance Reader Canvas

The reading drawer (`/read/[chapterId]/page.tsx`) offers three responsive layouts:

*   **Vertical Webtoon Mode**:
    *   Applies hardware acceleration styles (`will-change: transform`, `transform: translate3d(0,0,0)`) on page containers to prevent repaint lags.
    *   Implements `content-visibility: auto` and `contain-intrinsic-size` on individual pages, allowing the browser to skip rendering offscreen images and reduce memory load.
*   **Horizontal Single/Double Page Mode**:
    *   Groups pages into single or side-by-side spreads.
    *   Uses a 150ms Framer Motion sliding transition to slide pages snappily on flip commands.
*   **Smart Prefetching**: Automatically pre-loads adjacent pages (up to 3 pages ahead) in the background while the user reads.
*   **Keybinding Handlers**: Key listeners listen for `ArrowRight`/`D` (next page) and `ArrowLeft`/`A` (prev page), adjusting navigation direction to match Left-to-Right (LTR) or Right-to-Left (RTL) reading preferences.

---

## 🌐 8. DNS Interceptor Proxy & Staggered wave Engine

To bypass local DNS server failures (`ENOTFOUND api.mangadex.org` or `ConnectTimeoutError`), a hybrid fetch configuration is implemented:

### DNS Lookup Override (`route.ts`)
The server proxy route intercepts Node's default DNS lookup queries for `api.mangadex.org` and resolves them using Google/Cloudflare public DNS resolvers:
```typescript
const dnsResolver = new dns.Resolver();
dnsResolver.setServers(['8.8.8.8', '1.1.1.1']);

const originalLookup = dns.lookup;
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (hostname === 'api.mangadex.org') {
    dnsResolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        originalLookup(hostname, options, callback);
      } else {
        if (options.all) {
          callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
        } else {
          callback(null, addresses[0], 4);
        }
      }
    });
    return;
  }
  return originalLookup(hostname, options, callback);
};
```
*   **Result**: Browser requests route through the Next.js proxy route `/api/mangadex` (avoiding browser-side DNS timeout blocks). Server-side requests bypass proxies and query the API directly, utilizing this Node DNS override.

### Concurrency Queue Manager (`client.ts`)
*   Caps active connections to a maximum of **4 in-flight requests**, queuing extra requests to prevent rate limit blocks.

### Staggered Wave Homepage Queries (`page.tsx`)
Queries are triggered in three sequential waves using React Query's `enabled` prop and setTimeout gates:
*   **Wave 1**: Loads Trending, Latest, and New Arrivals immediately on load.
*   **Wave 2**: Loads Top Rated, Action, and Romance (400ms delay after Wave 1 starts receiving data).
*   **Wave 3**: Loads Drama, Comedy, Fantasy, and Sci-Fi (800ms delay after Wave 2 starts).

---

## 🧪 9. Unit Testing Framework

Kagami uses **Vitest** for unit tests. It includes 13 test files covering all modules:

1.  `categories.test.tsx`: Tests genre category directories and filter toggles.
2.  `home.test.tsx`: Verifies bento dashboard components and categories rows.
3.  `library.test.tsx`: Tests book shelving, history logs, and local store sync.
4.  `manga.test.tsx`: Asserts details rendering, tag groups, and erotica safe-mode blockers.
5.  `navigation.test.tsx`: Tests Header, Sidebar, and BottomNav viewport responsive boundaries.
6.  `offline.test.tsx`: Verifies downloaded offline indicator states.
7.  `reader.test.tsx`: Asserts Webtoon scrolling and page flip button commands.
8.  `search.test.tsx`: Verifies search filters, search inputs, and catalog listing states.
9.  `settings.test.tsx`: Tests SFW toggles, client themes, and library stats.
10. `chapterFeedPagination.test.ts`: Verifies offset limit paginations.
11. `api.test.ts`: Tests proxy route GET/POST endpoints.
12. `design.test.tsx`: Tests custom button and badge layouts.
13. `dummy.test.ts`: Dummy placeholder verification.

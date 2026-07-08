# 鏡 KAGAMI — Premium, High-Performance Manga Reader

Kagami is a state-of-the-art, premium cross-platform Web manga client built with Next.js, TypeScript, TailwindCSS, React Query, and Framer Motion. It delivers an immersive, high-fidelity experience optimized for both Android mobile viewports and modern desktop screens.

---

## 🎨 Visual Identity & Aesthetic Spec

Kagami is designed around the **Pure Velvet Obsidian Canvas** — a highly polished, distraction-free environment that prioritizes artwork rendering.

*   **Ink-Black Canvas**: Root background is locked to `#0B0B0A` (ultra-pure, warm-dark ink black).
*   **Surface Cards**: Modular container elements use a warm-charcoal `#141413` backdrop.
*   **Typography Accent**: Text is rendered in crisp off-white `#F5F5F0` with a signature deep-orange / gold accent system.
*   **Obsidian Borders**: Borders and dividers utilize `#262624` for soft, elegant grid alignment.
*   **Tactile Texture**: A low-opacity (2%) monochrome noise layer is applied via inline SVG turbulence filters, giving the interface a velvet-matte tactile quality.
*   **Geometry Rule**: Capsule layouts (`rounded-full`) for active pills and structural elements; rounded corners (`rounded-xl` and `rounded-2xl`) for card modules.

---

## 🚀 Key Features & Capabilities

### 1. Cinematic Curated Spotlight (Homepage)
*   **Direct Image Render**: Avoids cover art distortion by rendering covers in a designated right-hand space with `object-cover` and `object-center` alignments.
*   **Ambient Readable Gradient**: A dark linear gradient (`from-bg-app/95 via-bg-app/75 to-bg-app/10`) sweeps from left-to-right, ensuring text readability while keeping cover art crisp.
*   **Staged Content**: The manga description uses a strict 2-line line-clamp with snug leading and a compact font.
*   **Position Pager**: A dot indicator system in the bottom-right displays cycle positions and allows users to jump slides directly.

### 2. High-Density Bento Dashboard
*   **Pinned Collection**: Refactored to span the full grid width (`col-span-4`) on mobile, aligning title metrics and action buttons side-by-side with 54px compact covers.
*   **Multi-Category Shelves**: Displays 10 distinct, horizontal scroll zones:
    1.  🏆 **Trending** (Popular titles sorted by follower count)
    2.  ⏱️ **Latest** (Recently uploaded chapters)
    3.  ✨ **New Arrivals** (Recently added directory records)
    4.  ⭐ **Top Rated** (Highest user rating metrics)
    5.  ⚔️ **Action & Adventure** (Tag ID: `391b0423-...`)
    6.  💕 **Romance** (Tag ID: `423e2eae-...`)
    7.  🎭 **Drama** (Tag ID: `b9af3a63-...`)
    8.  🎨 **Comedy** (Tag ID: `4d32cc48-...`)
    9.  🧭 **Fantasy** (Tag ID: `cdc58593-...`)
    10. 🛰️ **Sci-Fi** (Tag ID: `256c8bd9-...`)

### 3. Hardware-Accelerated Webtoon & Page Reader
*   **Vertical Webtoon Mode**: Utilizes native scrolling with strict GPU compositing directives (`will-change: transform`, `transform: translate3d(0,0,0)`) on canvas containers to prevent reflow frame drops.
*   **Horizontal Reader Modes**: Supports Single/Double page layouts with hardware-accelerated slide transitions executing at exactly 150ms.
*   **Volume/Chapter Grouping Drawer**: Structured list grouping by volume numbers with animated accordion toggles.

### 4. Reading Diary & Local Library Storage
*   **Offline Cache API**: Caches reading assets locally in browser storage, enabling offline reading directly from client devices.
*   **Reading Log**: Users can save reading notes, review text, status labels (Reading, Completed, etc.), and custom star ratings locally.

---

## ⚡ Performance Optimization Mechanics

To eliminate interface lag and frame drops, the following optimization steps are implemented:

*   **Framer-Motion Stripping**: Spring JS calculations were removed from the 150+ cards and heading nodes on load, replacing them with hardware-accelerated CSS animations (`animate-fade-in`).
*   **Dynamic GPU Promotion**: Cards default to `will-change: auto` to prevent GPU memory depletion; they dynamically elevate to `will-change: transform` only during hover interactions, returning to `auto` immediately on mouse-leave.
*   **Lazy Image Decoding**: Manga cover images carry `decoding="async"` and `loading="lazy"` attributes, freeing the main thread during asset loading.
*   **3-Wave Homepage Query Strategy**:
    *   **Wave 1**: Loads Trending, Latest, and New Arrivals immediately above the fold.
    *   **Wave 2**: Fires Top Rated, Action, and Romance (400ms delay after Wave 1 resolves).
    *   **Wave 3**: Fires Drama, Comedy, Fantasy, and Sci-Fi (800ms delay after Wave 2 resolves).
*   **Edge & Browser Caching**: API responses carry Next.js revalidation rules and explicit `Cache-Control: public, s-maxage=300, stale-while-revalidate=60` headers, serving subsequent page navigation instantly.

---

## 🌐 DNS Resolver & Proxy Architecture

To bypass server-side network resolution blockages (e.g. `ENOTFOUND api.mangadex.org` or `ConnectTimeoutError` due to local DNS servers failing), a hybrid request mechanism is used:

```
[Browser Client]
       │
       ├─► (Local Network/CORS Check OK?) ──► Proxy Path (/api/mangadex)
       │                                            │
       │                                     [Next.js Server]
       │                                            │
       │                                     Global Interceptor
       │                                  (Resolves via 8.8.8.8)
       │                                            │
       └─► (SSR / Server Component Fetch) ──► Direct to api.mangadex.org
```

### 1. Global Node.js DNS Interceptor
A custom DNS hook intercepts Node's `dns.lookup` calls for `api.mangadex.org` inside Next.js API routes, routing resolution through Google/Cloudflare resolvers (`8.8.8.8` / `1.1.1.1`) rather than the server's broken local DNS.

### 2. Client Concurrency Queue Manager
To prevent client queries from triggering rate limits (429 errors), network calls pass through a concurrency manager restricted to **4 maximum concurrent connections**.

### 3. Exponential Backoff Retry Engine
Integrated in the React Query client (`QueryProvider.tsx`), queries use exponential backoff (`1s → 2s → 4s`), with custom 429 rate-limiting intervals (`5s → 10s → 30s`) to ensure seamless connection recovery.

---

## 📱 Mobile-First Responsive Framework

*   **Android height Locks**: Key page frameworks use `h-[100dvh]` and `min-h-[100dvh]` to prevent viewport layout shifts when browser bars slide in/out.
*   **High-Density 3-Column Grid**: Viewports below 768px display compact 3-column rows (`grid-cols-3` with a tight `gap-2`) to keep covers and metadata scaled down.
*   **44px Touch Targets**: Interactive pills, tab controls, and list row actions follow tap target sizing guidelines, featuring `touch-action: manipulation` to remove double-tap delays.
*   **Unified Sidebar/BottomNav Visibility**: Redundant double-menu rendering is prevented via responsive breakpoint rules (`hidden md:flex` on Header, `flex md:hidden` on BottomNav).

---

## 🧪 Testing & Verification

Kagami includes a comprehensive Vitest test suite that covers all page modules, state transitions, and component behavior.

*   **Commands**:
    *   `npm run typecheck` (Executes TypeScript checks - passing with 0 errors).
    *   `npx vitest run` (Executes 13 test files and 23 tests - passing cleanly).

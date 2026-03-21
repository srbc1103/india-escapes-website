# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js + Turbopack)
npm run build    # Production build (Turbopack)
npm start        # Serve production build
npm run lint     # Run ESLint
```

No test suite is configured.

## Architecture Overview

This is a **Next.js 16 / React 19** full-stack travel booking platform with two distinct sections sharing the same codebase:

### 1. Public Website (`app/(website)/`)
Customer-facing India tour package platform. Key routes:
- `/` — Homepage
- `/tours`, `/categories/[category]`, `/regions/[slug]` — Package browsing
- `/[packageID]` — Package detail page (itinerary, pricing, inclusions, exclusions)
- `/destinations/[url]`, `/deals/[url]`, `/labels/[url]`, `/blogs/[url]` — Content pages
- `/search`, `/booking-form`, `/tag/[tag_name]` — Utility pages

### 2. CMS Dashboard (`app/ie_cms/`)
Admin interface for content management, auth-gated via Appwrite token stored in a cookie. Routes prefixed with `/ie_cms/(pages)/` cover CRUD for packages, blogs, destinations, deals, regions, media, and settings.

### Backend: Appwrite
All data lives in **Appwrite** (cloud-hosted). The Appwrite client is initialized in `lib/appwrite.js`, exporting `databases`, `account`, and `storage` singletons.

`lib/backend.js` exports a `DataService` class with all data access methods:
- Auth: `login()`, `logOut()`, `check_user()`
- Reads: `fetchPackages()`, `fetchBlogs()`, `get_items_list()`, `get_item_detail()`, `fetchPackageComplete()` (batched: package + itinerary + inclusions + exclusions + expenses + related)
- Writes: `create_item()`, `update_item()`, `delete_item()`
- Media: `create_file()`, `list_files()`, `delete_file()`

### API Routes (`app/api/`)
Next.js API routes act as a proxy layer between client and Appwrite:
- `/api/package-query?ep=<endpoint>` — Main data endpoint, routes by `ep` param with ISR caching (1 hr for lists, 3 min for packages, 1 min for search)
- `/api/booking-form`, `/api/query-form` — Form submissions
- `/api/send-mail` — Email via Resend API
- `/api/exchange-rates` — Currency conversion rates

### Data Fetching Pattern (Client Side)
Client components use `hooks/useFetch.jsx` (wraps React Query) and `hooks/usePackages.jsx` for paginated package queries. These call the `/api/package-query` route, not Appwrite directly.

### State / Context
- `CurrencyContext` — Global currency selection (INR, USD, EUR, GBP, AUD, CAD, JPY, CNY)
- `LanguageContext` — Global language (12 languages via Google Translate)
- `ThemeProvider` — Dark/light mode via `next-themes`

### Key Constants & Utilities
- `constants.js` — `COLLECTIONS` (Appwrite collection IDs), `REGIONS`, `CURRENCIES`, `LANGUAGES`, `ICON_MAP`, `FEATURED_IMAGE_PAGE_MAP`
- `functions.js` — `formatNumber()` (currency), `formatDate()`, `slugify()`, `generateID()`, CSV utilities

## Environment Variables

Required in `.env.local` (see `.env.local.example`):

```
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
NEXT_PUBLIC_APPWRITE_DATABASE_ID
NEXT_PUBLIC_APPWRITE_BUCKET_ID
RESEND_API_KEY
FROM_EMAIL
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_TRANSLATE_API_KEY   # optional, for translation
EXCHANGE_RATE_API_URL                   # optional, for live rates
```

## CMS Authentication

CMS pages call `Data.check_user()` on mount and redirect to `/ie_cms/auth` if not authenticated. The session token is stored in a cookie (`HASH.TOKEN` key from `constants.js`). `DataService` in `lib/backend.js` handles login/logout via Appwrite `account`.

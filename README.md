# Weather Dashboard

A single-page weather app built with React and TypeScript. Search cities, view current conditions, browse a 5-day forecast with charts, and manage saved locations. Data comes from the [OpenWeatherMap](https://openweathermap.org/api) free tier.

## Features

- **Dashboard** — Auto-detects your location on load; debounced city search with geocoding autocomplete; current weather, hourly strip, tomorrow outlook, sunrise/sunset, and highlights (rain, UV, wind, humidity)
- **5-day forecast** — Daily high/low, icons, Recharts temperature chart, °C/°F toggle (persisted)
- **Saved locations** — Star cities, view weather in parallel, remove with confirmation; tap a card to open it on the dashboard
- **Async handling** — Custom hooks with `AbortController` cleanup; loading, error, and empty states throughout

## Setup

### Prerequisites

- Node.js 18+ and npm
- A free [OpenWeatherMap API key](https://home.openweathermap.org/api_keys)

### Install and run

```bash
git clone <repository-url>
cd weather-app
npm install
```

Create a `.env` file in the project root (do **not** commit this file):

```env
REACT_APP_API_KEY=your_openweathermap_api_key
REACT_APP_API_URL=https://api.openweathermap.org/data/2.5
```

Optional geocoding base URL (defaults to OpenWeather geocoding v1.0):

```env
REACT_APP_GEO_URL=https://api.openweathermap.org/geo/1.0
```

Start the dev server:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000). Allow location access when prompted so the dashboard can load your city automatically.

### Other commands

```bash
npm test          # unit tests (Jest + React Testing Library)
npm run build     # production build
```

## State management

This project does **not** use Redux, Zustand, or TanStack Query. State is split by responsibility:

| Layer | Approach | Why |
|--------|-----------|-----|
| **Global UI preferences** | React Context — `TempUnitContext`, `FavoritesContext`, `SidebarContext` | Small, stable slices shared across routes (unit toggle, starred cities, sidebar open state). Context avoids extra dependencies and keeps providers easy to read in `App.tsx`. |
| **Persistence** | `localStorage` inside contexts/hooks | Favorites, recent searches (last 5), and °C/°F preference survive reloads without a backend. |
| **Server / API data** | Custom hooks (`useAsyncWeather`, `useCitySuggestions`, `useDebounce`) + component `useState` | Weather and forecast are fetched per screen with abort-on-unmount. Local state matches the request lifecycle and avoids caching stale data across unrelated views. |
| **Routing** | React Router + URL search params | Forecast and “open city on dashboard” use query params so links are shareable and back/forward work. |

**Why not a global store for weather?** Weather is tied to the active city and route. Keeping it in hooks next to each page makes loading/error states obvious and prevents one global cache from serving the wrong city after navigation.

## Project structure

```
src/
  components/       # Shared UI (layout, autocomplete, sidebar, weather widgets)
  constants/        # Shared layout tokens (card styles, grid helpers)
  context/          # TempUnit, Favorites, Sidebar providers
  hooks/            # debounce, async weather, geolocation, initial city, recent searches
  pages/
    Home/           # Dashboard + composed subcomponents
    Forecast/       # 5-day forecast + chart
    Cities/         # Saved locations
  services/         # OpenWeather API client + error parsing
  types/            # TypeScript interfaces + WeatherError discriminated union
  utils/            # Pure helpers (forecast aggregation, city mappers, errors)
```

## Review criteria alignment

| Criterion | How this project addresses it |
|-----------|-------------------------------|
| **Clean, readable code** | Feature-based folders; shared `PageLayout`, `constants/ui`; no `any`; removed unused `App.css`; consistent naming (`CityQuery`, `geocodingToCityQuery`). |
| **TypeScript quality** | Strict interfaces for all API shapes in `types/`; `WeatherErrorKind` union + `isWeatherErrorKind`; typed hooks and service layer; separate `tsconfig.test.json` for Jest. |
| **Component architecture** | Home split into `CitySearchBar`, `CurrentWeatherHero`, `HourlyTomorrowSection`, `TodayHighlights`, `OtherCitiesGrid`; reusable `HighlightStatCard`, `WeatherCard`; custom hooks for geolocation and data fetching. |
| **State management** | Context only for cross-route concerns (favorites, temp unit, sidebar); weather stays in `useAsyncWeather` per view; URL params for deep links; no unnecessary global store. |
| **Testing** | 20 unit tests on debounce, temp conversion, forecast aggregation, API error mapping, URL city parsing, and error titles — logic-focused, not snapshots. |
| **Responsive & polished** | MUI Grid breakpoints (`xs` / `sm` / `lg`); collapsible sidebar; striped dashboard background; loading skeletons; error cards with icons per error kind. |

## Trade-offs and shortcuts

- **OpenWeather 5-day forecast** — Uses the 3-hour / 5-day endpoint; daily values are aggregated in the client (`getFiveDayOutlook`), not the One Call API (separate paid tier).
- **UV index** — Approximated from cloud cover on the dashboard, not a dedicated UV field from the API.
- **“Other cities” on Home** — Shows four preset cities from `common.ts`, excluding the current city, rather than a user-configurable list.
- **Geolocation fallback** — If permission is denied or lookup fails, defaults to Mumbai (first preset city).
- **No backend** — API key is exposed in the browser via `REACT_APP_*` env vars; acceptable for a demo, not for production without a proxy.
- **Create React App** — Stays on `react-scripts` 5 (no eject); test files use a separate `tsconfig.test.json` so production builds exclude Jest globals.
- **Test coverage** — Strong unit coverage on pure logic; component/integration tests and MSW mocks not yet added.

## With more time, I would improve

1. **API layer** — BFF or serverless proxy to hide the API key; optional Redis/memory cache for rate limits.
2. **Data fetching** — TanStack Query (or RTK Query) for deduplication, retries, stale-while-revalidate, and simpler cache invalidation when switching cities.
3. **Testing** — Component tests for search, favorites, and error UI; MSW for stable API mocks in CI.
4. **Accessibility** — Audit focus order, live regions for loading/errors, and keyboard flows for autocomplete and cards.
5. **UX** — Skeleton layouts per section; offline/retry banner; `.env.example` in repo and stricter secret handling in docs/CI.
6. **Forecast** — One Call API or daily aggregation with clearer “today vs future” boundaries and precipitation charts.
7. **Code organization** — TanStack Query for server state; optional `SelectedCityContext` if URL-only selection becomes the single source of truth.

## License

Private / evaluation project — adjust as needed for your repository.

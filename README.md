# Anti Dashboard — GHN DNB

Next.js 15 dashboard phân tích hiệu suất giao hàng vùng Đông Nam Bộ (DNB) từ Google Sheet công khai.

## Stack
- Next.js 14.2 (App Router, Node runtime) + TypeScript strict
- Tailwind CSS + shadcn-style primitives
- Recharts + TanStack Table
- PapaParse (CSV với định dạng số kiểu Việt Nam)
- date-fns (vi locale)
- jose (JWT cookie session)

## Tính năng
- Đăng nhập bằng **mã nhân viên AM** (validate từ sheet `Cơ cấu`)
- Filter cascading: Vùng → Tỉnh → AM → Bưu cục, date range, granularity (Day/Week/Month), Loại Hàng
- **6 sections:** KPI cards (5 thẻ + delta), Trend chart (multi-metric), Ranking table (AM/BC), Alerts panel (threshold config), Loại Hàng comparison, Heatmap BC × Ngày
- Threshold cảnh báo tùy chỉnh (lưu localStorage)
- Cache 60s + nút "Làm mới" (`revalidateTag`)
- URL-driven filters (shareable)

## Setup local

```bash
cd dashboard
npm install
cp .env.local.example .env.local
# Sửa AUTH_SECRET trong .env.local (random 32+ chars)
npm run dev
```

Mở `http://localhost:3000` → redirect `/login` → nhập **mã AM** (số trước dấu `-` trong cột AM của sheet Cơ cấu, vd `1872036`).

## Env vars

| Tên | Mục đích |
|-----|----------|
| `SHEET_ID` | Google Sheet ID (public). Mặc định trong `.env.local.example`. |
| `AUTH_SECRET` | Secret để ký JWT cookie. **Bắt buộc** đổi cho production (random 32+ chars: `openssl rand -hex 32`). |
| `ALERT_TON_THRESHOLD` | (opt) Override mặc định 0.4 |
| `ALERT_CHUA_GAN_THRESHOLD` | (opt) Override mặc định 0.3 |
| `ALERT_LEADTIME_THRESHOLD` | (opt) Override mặc định 25 |
| `ALERT_GTC_THRESHOLD` | (opt) Override mặc định 0.6 |

## Scripts

```bash
npm run dev        # Dev server (port 3000)
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
npm run typecheck  # TypeScript check
npm test           # Vitest unit tests
```

## Deploy Vercel

1. Push repo lên GitHub
2. Vercel → Add New Project → Import repo
3. **Root Directory:** `dashboard`
4. Framework: Next.js (auto-detect)
5. Environment Variables: set `SHEET_ID` + `AUTH_SECRET`
6. Deploy

## Data Source

Sheet ID: `1vOl-4dtja1f8wDSNVg5XeQC8nzMoZ-53CcEnStyDMX0`
- Sheet **Data**: fact rows (Volume, %, Leadtime theo BC × ngày × Loại Hàng)
- Sheet **Cơ cấu**: dimension (BC ↔ AM ↔ Huyện ↔ Tỉnh + danh sách AM hợp lệ để đăng nhập)

Fetch qua gviz CSV endpoint (không cần API key), cache 60s.

## Cấu trúc thư mục

```
src/
├── app/
│   ├── api/{login,logout,refresh}/route.ts
│   ├── login/page.tsx
│   ├── page.tsx           # Main dashboard (Server Component)
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── globals.css
├── middleware.ts          # Auth gate (JWT cookie)
├── lib/
│   ├── auth.ts            # JWT create/verify
│   ├── sheets-fetcher.ts  # gviz CSV + cache + revalidateTag
│   ├── sheets-parser.ts   # PapaParse + VN comma normalize
│   ├── types.ts
│   ├── filters.ts         # URL ↔ state + dimension tree
│   ├── aggregations.ts    # groupBy D/W/M + weighted avg + ranking + heatmap
│   ├── alerts.ts          # threshold detection
│   ├── format.ts          # vi-VN number/percent/hours
│   └── utils.ts           # cn()
├── components/
│   ├── ui/*               # shadcn primitives
│   ├── filter-bar.tsx
│   ├── kpi-cards.tsx
│   ├── trend-chart.tsx
│   ├── ranking-table.tsx
│   ├── alerts-{panel,client}.tsx
│   ├── loai-hang-comparison.tsx
│   ├── heatmap.tsx + heatmap-wrapper.tsx
│   ├── refresh-button.tsx
│   ├── threshold-settings.tsx
│   └── logout-button.tsx
└── tests/                 # vitest
```

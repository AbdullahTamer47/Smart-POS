# Smart POS | نظام نقاط البيع الذكي

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

نظام نقاط بيع متكامل متعدد المستأجرين مع دعم كامل للغة العربية والإنجليزية، إدارة المخزون، المحاسبة، والتقارير.

A comprehensive multi-tenant Point of Sale system with full Arabic and English support, inventory management, accounting, and reporting.

---

## Tech Stack | التقنيات المستخدمة

### Frontend | الواجهة الأمامية
- **React 19** with TypeScript
- **Vite 6** - Build tool
- **MUI 7** - UI component library
- **React Router 7** - Client-side routing
- **TanStack React Query 5** - Server state management
- **Zustand 5** - Client state management
- **React Hook Form + Zod** - Form validation
- **i18next** - Internationalization (ar/en)
- **Recharts** - Charts and visualizations
- **Workbox** - Service worker for PWA
- **idb** - IndexedDB for offline storage

### Backend | الواجهة الخلفية
- **NestJS** - Node.js framework
- **PostgreSQL** - Primary database
- **Redis** - Caching and session store
- **Socket.io** - Real-time communication
- **BullMQ** - Job queues
- **JWT** - Authentication

### Infrastructure | البنية التحتية
- **Docker** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Prometheus + Grafana** - Monitoring
- **PgBouncer** - Connection pooling

---

## Prerequisites | المتطلبات الأساسية

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** and **Docker Compose**
- **PostgreSQL** >= 16 (if running locally)
- **Redis** >= 7 (if running locally)

---

## Quick Start | بداية سريعة

```bash
git clone https://github.com/your-org/smart-pos-next.git
cd smart-pos-next

cp .env.example .env

pnpm install

docker compose up -d

pnpm run dev
```

The application will be available at:
- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:3000](http://localhost:3000)
- API Docs: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

---

## Development Setup | إعداد بيئة التطوير

### 1. Clone and Install

```bash
git clone https://github.com/your-org/smart-pos-next.git
cd smart-pos-next
pnpm install
```

### 2. Environment Configuration

Copy and configure environment variables:

```bash
cp .env.example .env
```

### 3. Start Services

Using Docker Compose:

```bash
docker compose up -d postgres redis
```

Or start services manually.

### 4. Run Database Migrations

```bash
pnpm run db:migrate
pnpm run db:seed
```

### 5. Start Development

```bash
pnpm run dev
```

This starts all applications in development mode using Turborepo.

---

## Project Structure | هيكل المشروع

```
smart-pos-next/
├── apps/
│   ├── frontend/          # React frontend application
│   │   ├── public/        # Static assets (manifest, service worker, icons)
│   │   ├── src/
│   │   │   ├── api/       # API client and endpoints
│   │   │   ├── components/# Shared UI components
│   │   │   ├── hooks/     # Custom React hooks
│   │   │   ├── i18n/      # Internationalization (ar/en)
│   │   │   ├── layouts/   # Page layouts
│   │   │   ├── pages/     # Route pages
│   │   │   ├── router/    # Route configuration
│   │   │   ├── services/  # Business logic (print, offline sync)
│   │   │   ├── stores/    # Zustand stores
│   │   │   └── theme/     # MUI theme configuration
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   └── api/               # NestJS backend application
│       ├── src/
│       │   ├── modules/   # Feature modules
│       │   ├── common/    # Shared utilities
│       │   └── config/    # Configuration
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Shared utility functions
│   └── ui/                # Shared UI components
├── docker/                # Docker configuration files
│   ├── nginx/             # Nginx reverse proxy config
│   ├── grafana/           # Grafana dashboards
│   ├── prometheus/        # Prometheus config
│   └── pgbouncer/         # PgBouncer config
├── docker-compose.yml     # Main services orchestration
├── turbo.json             # Turborepo configuration
├── pnpm-workspace.yaml    # pnpm workspace config
├── package.json           # Root package.json
└── .env.example           # Environment variables template
```

---

## Available Scripts | الأوامر المتاحة

### Root

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start all apps in development mode |
| `pnpm run build` | Build all apps and packages |
| `pnpm run lint` | Lint all apps and packages |
| `pnpm run typecheck` | Type check all TypeScript files |
| `pnpm run test` | Run all tests |
| `pnpm run clean` | Clean all build artifacts |

### Frontend (`apps/frontend`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start Vite dev server |
| `pnpm run build` | Build for production |
| `pnpm run preview` | Preview production build |
| `pnpm run lint` | Run ESLint |
| `pnpm run typecheck` | TypeScript type checking |
| `pnpm run test` | Run Vitest tests |
| `pnpm run test:e2e` | Run Playwright E2E tests |

### Backend (`apps/api`)

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start NestJS dev server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint |
| `pnpm run test` | Run Jest tests |
| `pnpm run db:migrate` | Run database migrations |
| `pnpm run db:seed` | Seed database with sample data |

---

## Environment Variables | متغيرات البيئة

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3000` |
| `VITE_APP_NAME` | Application name | `Smart POS` |
| `VITE_ENABLE_PWA` | Enable PWA features | `true` |
| `VITE_VAPID_PUBLIC_KEY` | VAPID public key for push notifications | - |

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | API server port | `3000` |
| `DATABASE_URL` | PostgreSQL connection URL | `postgresql://postgres:postgres@localhost:5432/smartpos` |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | - |
| `JWT_EXPIRY` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh token expiry | `7d` |
| `VAPID_PRIVATE_KEY` | VAPID private key for push notifications | - |
| `VAPID_PUBLIC_KEY` | VAPID public key for push notifications | - |
| `SMTP_HOST` | SMTP server host | - |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | - |
| `SMTP_PASS` | SMTP password | - |
| `UPLOAD_DIR` | File upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Maximum upload file size | `10mb` |

---

## API Documentation | توثيق API

API documentation is available at `/api/docs` when the backend is running. The API follows RESTful conventions and supports:

- **Authentication** - JWT-based with refresh tokens
- **Multi-tenancy** - All requests scoped to tenant via `x-tenant-id` header
- **Pagination** - Cursor-based and offset-based pagination
- **Filtering** - Query parameter filtering
- **Sorting** - Multi-field sorting

---

## Deployment Guide | دليل النشر

### Docker Deployment

```bash
# Build all images
docker compose build

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Production Build (Frontend)

```bash
cd apps/frontend
pnpm run build

# Output is in apps/frontend/dist
# Serve with nginx or any static file server
```

### Production Build (Backend)

```bash
cd apps/api
pnpm run build

# Output is in apps/api/dist
# Start with: node dist/main.js
```

### Kubernetes

Example Kubernetes manifests are available in the `k8s/` directory (coming soon).

---

## Features | الميزات

### Point of Sale | نقاط البيع
- Fast product search and barcode scanning
- Customer selection and loyalty points
- Discounts and coupons
- Multiple payment methods
- Hold and resume invoices
- Receipt printing (thermal/A4)
- Kitchen order printing

### Inventory Management | إدارة المخزون
- Multi-warehouse stock tracking
- Stock adjustments and transfers
- Low stock alerts
- Expiry date tracking
- Batch and serial number tracking
- Purchase orders

### Accounting | المحاسبة
- General ledger
- Accounts receivable/payable
- Expense and revenue tracking
- Cash register management
- Tax configuration (VAT/Sales Tax)

### Reports | التقارير
- Sales reports
- Profit and loss
- Inventory valuation
- Cashier performance
- Customer statements
- Tax reports
- Export to PDF/Excel/CSV

### Administration | الإدارة
- Multi-tenant architecture
- Role-based access control
- User management
- Branch management
- Subscription plans
- Audit logging

---

## Contributing | المساهمة

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `pnpm run test && pnpm run lint`
5. Commit using conventional commits: `feat: add amazing feature`
6. Push to your branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Convention

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

---

## License | الرخصة

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support | الدعم

For issues and feature requests, please use the [GitHub Issues](https://github.com/your-org/smart-pos-next/issues) page.

---

Made with by the Smart POS Team